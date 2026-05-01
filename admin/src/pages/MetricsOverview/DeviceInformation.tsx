import React, { useEffect, useState } from "react";
import elasticsearchService from "../../services/elasticsearch.service";
import {
    fetchTotalUniqueDevicesQuery,
    fetchUniqueDevicesQuery,
    parseFetchTotalUniqueDevicesResponse,
    parseFetchUniqueDevicesResponse,
    type FetchTotalUniqueDevicesResponse,
    type FetchUniqueDevicesResponse,
} from "./queries/fetchUniqueDevices.queries";
import { elasticIndices } from "../../constants";
import { useOrganization } from "../../contexts/organization.context";
import DeviceMetricsDistribution from "./components/DeviceMetricsDistribution";
import DeviceUptimeStatistics from "./components/DeviceUptimeStatistics";


const DeviceInformationPage: React.FC = () => {
    const { selectedOrg } = useOrganization();

    const [devices, setDevices] = useState<string[]>([]);
    const [isFetchingDevices, setIsFetchingDevices] = useState(false);

    const fetchUniqueDevices = async () => {
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const ioIndexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.runningProcesses
        );
        if (!ioIndexInfo) return;
        if (isFetchingDevices) return;

        setIsFetchingDevices(true);
        setDevices([]);

        const response = await elasticsearchService.aggregate<null, FetchTotalUniqueDevicesResponse>(
            fetchTotalUniqueDevicesQuery(),
            elasticIndices.runningProcesses,
            selectedOrg.info.id,
            ioIndexInfo.major_version
        );

        if (!response || !response.aggregations) {
            console.error("Failed to fetch total unique devices:", response);
            setIsFetchingDevices(false);
            return;
        }

        const totalDevices = parseFetchTotalUniqueDevicesResponse(response.aggregations) || 0;
        if (totalDevices === 0) {
            setIsFetchingDevices(false);
            return;
        }

        const pageSize = 1000;
        const totalPartitions = Math.ceil(totalDevices / pageSize);

        try {
            const accumulated: string[] = [];
            for (let partition = 0; partition < totalPartitions; partition++) {
                const result = await elasticsearchService.aggregate<null, FetchUniqueDevicesResponse>(
                    fetchUniqueDevicesQuery(partition, totalPartitions),
                    elasticIndices.runningProcesses,
                    selectedOrg.info.id,
                    ioIndexInfo.major_version
                );

                if (!result?.aggregations) {
                    console.error("Failed to fetch unique devices:", result);
                    break;
                }

                const partitionDevices = parseFetchUniqueDevicesResponse(result.aggregations);
                if (!partitionDevices?.length) break;

                accumulated.push(...partitionDevices);
            }
            setDevices(Array.from(new Set(accumulated)));
        } finally {
            setIsFetchingDevices(false);
        }
    };

    useEffect(() => {
        fetchUniqueDevices();
    }, [selectedOrg]);

    return (
        <div className="p-6 flex flex-col gap-6">
            <DeviceMetricsDistribution devices={devices} />
            <DeviceUptimeStatistics devices={devices} />
        </div>
    );
};

export default DeviceInformationPage;