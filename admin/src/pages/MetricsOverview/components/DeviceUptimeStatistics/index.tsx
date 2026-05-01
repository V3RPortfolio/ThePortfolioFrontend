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

interface UptimeStats {
    timestamp: string;
    entries: number;
    cpu_perct_metric: number;
    memory_perct_metrics: number;
    memory_megabyte_metrics: number;
}

const timeSeriesViewUnits: Record<string, { label: string; value: string }> = {
    hour: { label: "Hour", value: "hour" },
    day: { label: "Day", value: "day" },
    week: { label: "Week", value: "week" },
    month: { label: "Month", value: "month" },
    year: { label: "Year", value: "year" },
};

const availableMetrics: Record<string, { field: string; label: string }> = {
    uptime: { field: "uptime", label: "Uptime" },
    cpuUsage: { field: "avg_cpu_consumption", label: "Average CPU Usage (%)" },
    memoryUsage: { field: "avg_memory_consumption", label: "Average Memory Usage (%)" },
    memoryMB: { field: "avg_memory_megabytes", label: "Average Memory Usage (MB)" },
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
        { device: string; metrics: UptimeStats[] }[]
    >([]);
    const [isFetchingUptime, setIsFetchingUptime] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(availableMetrics.uptime);

    const fetchDeviceMetrics = useCallback(async () => {
        if (!devices.length || !uptimeDateStart || !uptimeDateEnd || isFetchingUptime) return [];
        if (!selectedOrg || !selectedOrg.resource?.indices) return [];

        const indexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.deviceMetrics
        );
        if (!indexInfo) return [];

        setIsFetchingUptime(true);
        const uptimeResults: { device: string; metrics: UptimeStats[] }[] = [];

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

            const metricsMap: Record<string, {count: number, cpu_perct: number, memory_perct: number, memory_megabytes:number}> = {};
            for (const hit of data) {
                const hourKey = hit.processing_timestamp.substring(0, substringIndex);
                if (metricsMap[hourKey] == undefined) {
                    metricsMap[hourKey] = {
                        count: 1,
                        cpu_perct: hit.cpu_usage,
                        memory_perct: hit.memory_usage,
                        memory_megabytes: hit.memory_megabytes,
                    };
                } else {
                    metricsMap[hourKey] = {
                        count: metricsMap[hourKey].count + 1,
                        cpu_perct: metricsMap[hourKey].cpu_perct + hit.cpu_usage,
                        memory_perct: metricsMap[hourKey].memory_perct + hit.memory_usage,
                        memory_megabytes: metricsMap[hourKey].memory_megabytes + hit.memory_megabytes,
                    };
                }
            }

            uptimeResults.push({
                device,
                metrics: Object.entries(metricsMap)
                    .map(([hour, metrics]) => ({
                        timestamp: hour + ":00:00Z",
                        entries: metrics.count,
                        cpu_perct_metric: metrics.cpu_perct / metrics.count,
                        memory_perct_metrics: metrics.memory_perct / metrics.count,
                        memory_megabyte_metrics: metrics.memory_megabytes / metrics.count,
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
                <h4 className="text text-title">Device {selectedMetric.label} Statistics</h4>
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
                            className="w-full lg:w-auto min-w-[30%]"
                        />
                        <Dropdown
                            label="View Chart By"
                            items={Object.values(timeSeriesViewUnits).map((unit) => ({
                                name: unit.label,
                                value: unit.value,
                            }))}
                            className="w-full lg:w-auto min-w-[20%]"
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
                        <Dropdown
                            label="Select Metric"
                            items={Object.values(availableMetrics).map((metric) => ({
                                name: metric.label,
                                value: metric.field,
                            }))}
                            value={selectedMetric.field}
                            handler={(value) => {
                                const metric = Object.values(availableMetrics).find(
                                    (m) => m.field === value
                                );
                                if (metric) setSelectedMetric(metric);
                            }}
                            className="w-full lg:w-auto min-w-[20%]"
                        />
                    </div>

                    {uptimeData && (
                        <LineChart
                            title={`${selectedMetric.label} Over Time Across`}
                            data={uptimeData.map(({ device, metrics }) => ({
                                label: device,
                                y: metrics.map((m) => selectedMetric.field == 'uptime' ? m.entries : 
                                                        selectedMetric.field == 'avg_cpu_consumption' ? 
                                                        m.cpu_perct_metric : selectedMetric.field == 'avg_memory_consumption' ? 
                                                        m.memory_perct_metrics : m.memory_megabyte_metrics),
                                x: metrics.map((m) => new Date(m.timestamp)),
                                dataPointId: metrics.map((m) => m.timestamp),
                            }))}
                            xAxisTitle="Time"
                            yAxisTitle={selectedMetric.label}
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
