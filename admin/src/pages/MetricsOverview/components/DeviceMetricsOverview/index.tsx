import React, { useEffect, useState } from "react";
import MetricsCard from "../../../../components/Card/MetricsCard";
import elasticsearchService from "../../../../services/elasticsearch.service";
import { elasticIndices } from "../../../../constants";
import {
    buildFetchDeviceMetricsQuery,
    parseFetchDeviceMetricsResponse,
    type FetchDeviceMetricsAggregationResponse,
} from "./metrics.queries";
import {
    buildFetchTotalIoDevicesQuery,
    type FetchTotalIoDevicesResponse,
} from "./io.queries";
import { useOrganization } from "../../../../contexts/organization.context";

interface DeviceMetricsOverviewProps {
    device: string;
    fromDate: string;
    toDate: string;
}

const DeviceMetricsOverview: React.FC<DeviceMetricsOverviewProps> = ({ device, fromDate, toDate }) => {
    const { selectedOrg } = useOrganization();

    const [memoryUsagePercent, setMemoryUsagePercent] = useState(0.0);
    const [cpuUsagePercent, setCpuUsagePercent] = useState(0.0);
    const [memoryUsageGB, setMemoryUsageGB] = useState(0.0);
    const [ioDevicesConnected, setIoDevicesConnected] = useState(0);

    const fetchDeviceMetrics = async () => {
        if (!device || !fromDate || !toDate) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.deviceMetrics
        );
        if (!indexInfo) return;
        const result = await elasticsearchService.aggregate<null, FetchDeviceMetricsAggregationResponse>(
            buildFetchDeviceMetricsQuery({ deviceId: device, from: fromDate, to: toDate }),
            elasticIndices.deviceMetrics,
            selectedOrg.info.id,
            indexInfo.major_version
        );
        if (!result || !result.aggregations) {
            console.error("Failed to fetch device metrics:", result);
            return;
        }
        const metrics = parseFetchDeviceMetricsResponse(result.aggregations);
        if (metrics.length === 0) {
            setMemoryUsagePercent(0);
            setCpuUsagePercent(0);
            setMemoryUsageGB(0);
            return;
        }
        // Assuming the last bucket is the most recent one due to chronological ordering
        const latestMetrics = metrics[metrics.length - 1];
        setMemoryUsagePercent(latestMetrics.memory_usage);
        setCpuUsagePercent(latestMetrics.cpu_usage);
        setMemoryUsageGB(latestMetrics.memory_megabytes / 1024); // Convert MB to GB
    };

    const fetchTotalIODevices = async () => {
        if (!device || !fromDate || !toDate) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.ioDevices
        );
        if (!indexInfo) return;
        const result = await elasticsearchService.aggregate<null, FetchTotalIoDevicesResponse>(
            buildFetchTotalIoDevicesQuery({ deviceId: device, from: fromDate, to: toDate }),
            elasticIndices.ioDevices,
            selectedOrg.info.id,
            indexInfo.major_version
        );
        if (!result || !result.aggregations) {
            console.error("Failed to fetch total I/O devices:", result);
            return;
        }
        const ioDevices = result.aggregations.unique_io_devices.buckets.length;
        setIoDevicesConnected(ioDevices);
    };

    useEffect(() => {
        fetchDeviceMetrics();
        fetchTotalIODevices();
    }, [device, fromDate, toDate, selectedOrg]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricsCard
                title="Total Memory Usage"
                value={memoryUsagePercent.toFixed(1)}
                unit="%"
                isPercentage
            />
            <MetricsCard
                title="Total CPU Usage"
                value={cpuUsagePercent.toFixed(1)}
                unit="%"
                isPercentage
            />
            <MetricsCard
                title="Total Memory Usage"
                value={memoryUsageGB.toFixed(2)}
                unit="GB"
            />
            <MetricsCard
                title="I/O Devices Connected"
                value={ioDevicesConnected.toString()}
                unit="devices"
            />
        </div>
    );
};

export default DeviceMetricsOverview;
