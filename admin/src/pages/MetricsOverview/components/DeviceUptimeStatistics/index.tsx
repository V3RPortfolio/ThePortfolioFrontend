import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import LineChart from "../../../../components/Charts/LineChart";
import Dropdown from "../../../../components/Filters/Dropdown";
import TimeRange from "../../../../components/Filters/TimeRange";
import elasticsearchService from "../../../../services/elasticsearch.service";
import {
    buildFetchDeviceMetricsQuery,
    parseFetchDeviceMetricsResponse,
    type FetchDeviceMetricsAggregationResponse,
} from "./metrics.queries";
import { elasticIndices } from "../../../../constants";
import { useOrganization } from "../../../../contexts/organization.context";

interface DeviceUptimeStatisticsProps {
    devices: string[];
}

const timeSeriesViewUnits: Record<string, { label: string; value: string }> = {
    hour: { label: "Hour", value: "hour" },
    day: { label: "Day", value: "day" },
    week: { label: "Week", value: "week" },
    month: { label: "Month", value: "month" },
    year: { label: "Year", value: "year" },
};

const DeviceUptimeStatistics: React.FC<DeviceUptimeStatisticsProps> = ({ devices }) => {
    const { selectedOrg } = useOrganization();

    const today = new Date();

    const [showUptime, setShowUptime] = useState(true);
    const [uptimeDateStart, setUptimeDateStart] = useState(
        new Date(today.getTime() - 72 * 60 * 60 * 1000).toISOString()
    );
    const [uptimeDateEnd, setUptimeDateEnd] = useState(today.toISOString());
    const [uptimeBinCategory, setUptimeBinCategory] = useState<string>(
        timeSeriesViewUnits.hour.value
    );
    const [uptimeData, setUptimeData] = useState<
        { device: string; metrics: { timestamp: string; entries: number }[] }[]
    >([]);
    const [isFetchingUptime, setIsFetchingUptime] = useState(false);

    const fetchDeviceMetrics = useCallback(async () => {
        if (!devices.length || !uptimeDateStart || !uptimeDateEnd || isFetchingUptime) return [];
        if (!selectedOrg || !selectedOrg.resource?.indices) return [];

        const indexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.deviceMetrics
        );
        if (!indexInfo) return [];

        setIsFetchingUptime(true);
        const uptimeResults: { device: string; metrics: { timestamp: string; entries: number }[] }[] = [];

        const fetchUnit =
            uptimeBinCategory === "hour" ? "minute" :
            uptimeBinCategory === "day" ? "hour" :
            uptimeBinCategory === "week" ? "day" :
            uptimeBinCategory === "month" ? "day" :
            uptimeBinCategory === "year" ? "month" : "hour";

        const substringIndex =
            uptimeBinCategory === "minute" ? 16 :
            uptimeBinCategory === "hour" ? 13 :
            uptimeBinCategory === "day" ? 10 :
            uptimeBinCategory === "week" ? 10 :
            uptimeBinCategory === "month" ? 7 :
            uptimeBinCategory === "year" ? 4 : 13;

        for (const device of devices) {
            const response = await elasticsearchService.aggregate<
                null,
                FetchDeviceMetricsAggregationResponse
            >(
                buildFetchDeviceMetricsQuery({
                    deviceId: device,
                    from: uptimeDateStart,
                    to: uptimeDateEnd,
                    unit: fetchUnit as "minute" | "hour" | "day" | "week" | "month" | "year",
                }),
                elasticIndices.deviceMetrics,
                selectedOrg.info.id,
                indexInfo.major_version
            );

            if (!response || !response.aggregations) {
                console.error("Failed to fetch device metrics:", response);
                continue;
            }

            const data = await parseFetchDeviceMetricsResponse(response.aggregations);

            if (!data?.length) {
                uptimeResults.push({ device, metrics: [] });
                continue;
            }

            const metricsMap: Record<string, number> = {};
            for (const hit of data) {
                const hourKey = hit.processing_timestamp.substring(0, substringIndex);
                if (metricsMap[hourKey] == undefined) {
                    metricsMap[hourKey] = 0;
                } else {
                    metricsMap[hourKey] += 1;
                }
            }

            uptimeResults.push({
                device,
                metrics: Object.entries(metricsMap)
                    .map(([hour, entries]) => ({
                        timestamp: hour + ":00:00Z",
                        entries,
                    }))
                    .sort(
                        (a, b) =>
                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    ),
            });
        }

        setIsFetchingUptime(false);
        return uptimeResults;
    }, [devices, uptimeDateStart, uptimeDateEnd, uptimeBinCategory, selectedOrg]);

    useEffect(() => {
        fetchDeviceMetrics().then((uptimeResults) => {
            setUptimeData(uptimeResults);
        });
    }, [devices, uptimeDateStart, uptimeDateEnd, selectedOrg]);

    return (
        <div className="uptime-container">
            <div className="flex flex-row justify-between p-6 bg-[var(--color-background)] mb-6 distribution-header">
                <h4 className="text text-title">Device Uptime Statistics</h4>
                {showUptime ? (
                    <ChevronDown
                        size={24}
                        className="cursor-pointer"
                        onClick={() => setShowUptime(false)}
                    />
                ) : (
                    <ChevronUp
                        size={24}
                        className="cursor-pointer"
                        onClick={() => setShowUptime(true)}
                    />
                )}
            </div>

            {showUptime && (
                <div className="flex flex-col">
                    <div className="flex flex-row flex-wrap flex-start gap-4 uptime-filters">
                        <TimeRange
                            label="Select Time Range"
                            from={uptimeDateStart}
                            to={uptimeDateEnd}
                            handler={({ from, to }) => {
                                if (from) setUptimeDateStart(from);
                                if (to) setUptimeDateEnd(to);
                            }}
                            className="w-full md:w-auto"
                        />
                        <Dropdown
                            label="View Chart By"
                            items={Object.values(timeSeriesViewUnits).map((unit) => ({
                                name: unit.label,
                                value: unit.value,
                            }))}
                            className="w-full lg:w-auto"
                            handler={(value: string) => {
                                if (
                                    Object.values(timeSeriesViewUnits).find(
                                        (unit) => unit.value === value
                                    )
                                ) {
                                    setUptimeBinCategory(value);
                                }
                            }}
                            value={uptimeBinCategory}
                        />
                    </div>

                    {uptimeData && (
                        <LineChart
                            title="Device Uptime Over Time"
                            data={uptimeData.map(({ device, metrics }) => ({
                                label: device,
                                y: metrics.map((m) => m.entries),
                                x: metrics.map((m) => new Date(m.timestamp)),
                                dataPointId: metrics.map((m) => m.timestamp),
                            }))}
                            xAxisTitle="Time"
                            yAxisTitle="Uptime"
                            timeSeriesUnit={
                                uptimeBinCategory as "hour" | "day" | "week" | "month" | "year"
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DeviceUptimeStatistics;
