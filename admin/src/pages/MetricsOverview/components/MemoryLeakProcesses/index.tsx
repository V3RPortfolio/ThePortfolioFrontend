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

interface MemoryLeakProcessesProps {
    device: string;
    fromDate: string;
    toDate: string;
    onProcessSelect: (processName: string) => void;
}

const ITEMS_PER_PAGE = 10;

const MemoryLeakProcesses: React.FC<MemoryLeakProcessesProps> = ({
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
                // Memory leak is relative and not time-range dependent
                page: activePage,
                pageSize: ITEMS_PER_PAGE,
                order_by: "avg_memory_leak",
                filters: searchTerm
                    ? [{ wildcard: { process_name: `*${searchTerm}*` } }]
                    : [],
            }),
            elasticIndices.runningProcesses,
            selectedOrg.info.id,
            indexInfo.major_version
        );

        if (!result || !result.hits || !result.hits.hits?.length) {
            console.error("Failed to fetch memory leak processes:", result);
            return;
        }
        return parseFetchRunningDevicesStatsResponse(result);
    }, [device, activePage, searchTerm, selectedOrg]);

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
        <div className="memory-leak-process-section">
            <div className="flex flex-wrap w-full gap-2 flex-start mb-2 memory-leak-process-filters">
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
                title="Processes with Memory Leak"
                columns={[
                    { name: "Process Name", key: "processName" },
                    { name: "Mean memory leak over time", key: "avgMemoryLeak" },
                    { name: "Deviation of Memory Leak", key: "deviationMemoryLeak" },
                ]}
                data={processes.map((p) => ({
                    processName: p.process_name,
                    avgMemoryLeak: (p.avg_memory_leak || 0).toFixed(2),
                    deviationMemoryLeak: (p.deviation_memory_leak || 0).toFixed(2),
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

export default MemoryLeakProcesses;
