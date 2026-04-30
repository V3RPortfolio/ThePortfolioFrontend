import React, { useCallback, useEffect, useState } from "react";
import DataTable from "../../../../components/Table/DataTable";
import SearchInput from "../../../../components/Search/SearchInput";
import elasticsearchService from "../../../../services/elasticsearch.service";
import { elasticIndices } from "../../../../constants";
import {
    buildFetchRunningDevicesStatsQuery,
    parseFetchRunningDevicesStatsResponse,
    type RunningDevicesStatsResponse,
} from "./memoryStats.queries";
import { useOrganization } from "../../../../contexts/organization.context";

interface MemoryIntensiveProcessesProps {
    device: string;
    fromDate: string;
    toDate: string;
    onProcessSelect: (processName: string) => void;
}

const ITEMS_PER_PAGE = 10;

const MemoryIntensiveProcesses: React.FC<MemoryIntensiveProcessesProps> = ({
    device,
    fromDate,
    toDate,
    onProcessSelect,
}) => {
    const { selectedOrg } = useOrganization();

    const [processes, setProcesses] = useState<RunningDevicesStatsResponse[]>([]);
    const [activePage, setActivePage] = useState(1);
    const [totalProcesses, setTotalProcesses] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    // Reset pagination and search whenever the shared filters change
    useEffect(() => {
        setActivePage(1);
        setSearchTerm("");
        setTotalProcesses(1);
    }, [device, fromDate, toDate]);

    const fetchProcesses = useCallback(async () => {
        if (!device || !selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.runningProcesses
        );
        if (!indexInfo) return;

        const result = await elasticsearchService.search<RunningDevicesStatsResponse>(
            buildFetchRunningDevicesStatsQuery({
                deviceId: device,
                page: activePage,
                pageSize: ITEMS_PER_PAGE,
                order_by: "avg_memory_megabytes",
                fields: [
                    "processing_timestamp",
                    "avg_memory_megabytes",
                    "deviation_memory_consumption_megabytes",
                    "avg_cpu_consumption",
                    "process_name",
                ],
                filters: searchTerm
                    ? [{ wildcard: { process_name: `*${searchTerm}*` } }]
                    : [],
            }),
            elasticIndices.runningProcesses,
            selectedOrg.info.id,
            indexInfo.major_version
        );

        if (!result || !result.hits || !result.hits.hits?.length) {
            console.error("Failed to fetch memory intensive processes:", result);
            return;
        }
        return parseFetchRunningDevicesStatsResponse(result);
    }, [device, fromDate, toDate, activePage, searchTerm, selectedOrg]);

    useEffect(() => {
        fetchProcesses().then((data) => {
            if (data) {
                setProcesses(data.items);
                setTotalProcesses(data.total);
            } else {
                setProcesses([]);
                setTotalProcesses(1);
            }
        });
    }, [fetchProcesses]);

    return (
        <div className="memory-intensive-process-section">
            <div className="flex flex-wrap w-full gap-2 flex-start mb-2 memory-intensive-process-filters">
                <SearchInput
                    value=""
                    onChange={(value) => {
                        setActivePage(1);
                        setSearchTerm(value);
                    }}
                    placeholder="Search by process name..."
                    fullWidth={false}
                />
            </div>
            <DataTable
                title="Highest memory consuming processes"
                columns={[
                    { name: "Process Name", key: "processName" },
                    { name: "Average Memory Usage (GB)", key: "avgMemoryUsageGB" },
                    { name: "Avg. Deviation from Mean (%)", key: "deviationMemoryConsumption" },
                    { name: "Average CPU Usage (%)", key: "avgCpuConsumption" },
                    { name: "Processed At", key: "processingTimestamp" },
                ]}
                data={processes.map((p) => ({
                    processName: p.process_name,
                    avgMemoryUsageGB: ((p.avg_memory_megabytes || 0) / 1024).toFixed(2),
                    deviationMemoryConsumption: (
                        (p.deviation_memory_consumption_megabytes || 0) / 1024
                    ).toFixed(2),
                    avgCpuConsumption: (p.avg_cpu_consumption || 0).toFixed(2),
                    processingTimestamp: new Date(p.processing_timestamp).toLocaleString(),
                }))}
                pagination={Array.from(
                    { length: Math.ceil(totalProcesses / ITEMS_PER_PAGE) },
                    (_, i) => ({ pageNumber: i + 1, isActive: activePage === i + 1 })
                )}
                paginationHandler={(page) => setActivePage(page)}
                clipLongText={true}
                totalPages={Math.ceil(totalProcesses / ITEMS_PER_PAGE)}
                onRowClick={(row) => onProcessSelect(row.processName)}
            />
        </div>
    );
};

export default MemoryIntensiveProcesses;
