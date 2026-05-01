import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProbabilityDistributionChart from "../../../../components/Charts/ProbabilityDistributionChart";
import Dropdown from "../../../../components/Filters/Dropdown";
import elasticsearchService from "../../../../services/elasticsearch.service";
import {
    fetchDistributionDataQuery,
    parseFetchDistributionDataResponse,
    type fetchDistributionDataResponse,
} from "./distribution.queries";
import { elasticIndices } from "../../../../constants";
import { useOrganization } from "../../../../contexts/organization.context";
import type { DistributionInfo } from "../../../../interfaces/metricsOverview.interface";

interface DeviceMetricsDistributionProps {
    devices: string[];
}

const availableMetrics: Record<string, { field: string; label: string }> = {
    cpuUsage: { field: "avg_cpu_consumption", label: "Average CPU Usage (%)" },
    memoryUsage: { field: "avg_memory_consumption", label: "Average Memory Usage (%)" },
    memoryMB: { field: "avg_memory_megabytes", label: "Average Memory Usage (MB)" },
};

const DeviceMetricsDistribution: React.FC<DeviceMetricsDistributionProps> = ({ devices }) => {
    const { selectedOrg } = useOrganization();

    const [showDistribution, setShowDistribution] = useState(true);
    const [selectedMetric, setSelectedMetric] = useState(availableMetrics.memoryUsage);
    const [deviceMetrics, setDeviceMetrics] = useState<{ device: string; distribution: DistributionInfo[] }[]>([]);
    const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);

    const fetchDistribution = useCallback(async () => {
        if (!devices.length || !selectedMetric.field || isFetchingMetrics) return [];
        if (!selectedOrg || !selectedOrg.resource?.indices) return [];

        const indexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.runningProcesses
        );
        if (!indexInfo) return [];

        const distributions: { device: string; distribution: DistributionInfo[] }[] = [];
        setIsFetchingMetrics(true);

        for (const device of devices) {
            const result = await elasticsearchService.aggregate<null, fetchDistributionDataResponse>(
                fetchDistributionDataQuery(device, selectedMetric.field),
                elasticIndices.runningProcesses,
                selectedOrg.info.id,
                indexInfo.major_version
            );
            if (!result || !result.aggregations) {
                console.error("Failed to fetch distribution data:", result);
                continue;
            }
            const distributionData = parseFetchDistributionDataResponse(selectedMetric.field, result);
            distributions.push({
                device,
                distribution: distributionData.filter((x) => x.metric_value != undefined),
            });
        }

        setIsFetchingMetrics(false);
        return distributions;
    }, [devices, selectedMetric, selectedOrg]);

    useEffect(() => {
        fetchDistribution().then((distributions) => {
            setDeviceMetrics(distributions);
        });
    }, [devices, selectedMetric, selectedOrg]);

    return (
        <div className="distribution-container">
            <div className="flex flex-row justify-between p-6 bg-[var(--color-background)] mb-6 distribution-header">
                <h4 className="text text-title">Device Metrics Distribution</h4>
                {showDistribution ? (
                    <ChevronDown
                        size={24}
                        className="cursor-pointer"
                        onClick={() => setShowDistribution(false)}
                    />
                ) : (
                    <ChevronUp
                        size={24}
                        className="cursor-pointer"
                        onClick={() => setShowDistribution(true)}
                    />
                )}
            </div>

            {showDistribution && (
                <div className="flex flex-col">
                    <div className="flex flex-row flex-wrap flex-start gap-4 distribution-filters">
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
                            className="w-auto"
                        />
                    </div>

                    {deviceMetrics && (
                        <ProbabilityDistributionChart
                            title="Metric Distribution Chart Across Devices"
                            data={deviceMetrics.map(({ device, distribution }) => ({
                                label: device,
                                values: distribution.map((m) => m.metric_value),
                                dataPointId: distribution.map(
                                    (m) => `${m.process_name}__${m.processing_timestamp}`
                                ),
                            }))}
                            xAxisTitle="Metric Value"
                            yAxisTitle="Frequency"
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default DeviceMetricsDistribution;
