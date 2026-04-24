import type React from "react";
import MetricsCard from "../../components/Card/MetricsCard";
import { useCallback, useEffect, useState } from "react";
import LineChart from "../../components/Charts/LineChart";
import DataTable from "../../components/Table/DataTable";
import elasticsearchService from "../../services/elasticsearch.service";
import { elasticIndices } from "../../constants";
import { fetchUniqueDevicesQuery, parseFetchUniqueDevicesResponse, type FetchUniqueDevicesResponse } from "../../queries/fetchUniqueDevices";
import { buildFetchTotalIoDevicesQuery, type FetchTotalIoDevicesResponse } from "../../queries/fetchTotalIoDevices";
import Dropdown from "../../components/Filters/Dropdown";
import TimeRange from "../../components/Filters/TimeRange";
import { buildFetchDeviceMetricsQuery, parseFetchDeviceMetricsResponse, type FetchDeviceMetricsAggregationResponse } from "../../queries/fetchDeviceMetrics";
import { buildFetchRunningDevicesStatsQuery, parseFetchRunningDevicesStatsResponse, type RunningDevicesStatsResponse } from "../../queries/fetchRunningDeviceStats";
import { buildFetchProcessExecutionsQuery, parseFetchProcessExecutionsResponse, type FetchProcessExecutionsResponse } from "../../queries/fetchProcessExecutions";
import SidePanel from "../../components/Panels/Sidepanel";
import { fetchProcessTreeQuery, mapProcessTreeResponse, type fetchProcessTreeResponse, type ProcessTreeInfo } from "../../queries/fetchProcessTree";
import ProcessTreeDiagram from "../../components/Trees/ProcessTree";
import SearchInput from "../../components/Search/SearchInput";
import { useOrganization } from "../../contexts/organization.context";


interface CardRowProps {
    memoryUsagePercent: number;
    cpuUsagePercent: number;
    memoryUsageGB: number;
    ioDevicesConnected: number;
}
const CardRow: React.FC<CardRowProps> = ({ memoryUsagePercent, cpuUsagePercent, memoryUsageGB, ioDevicesConnected }) => {
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
}

/**
 * Displays Dashboard related to Data Engineering Project - Log Processor
 * The following metrics are displayed:
 * 1. Total Memory (%) Usage (Card)
 * 2. Total CPU (%) Usage (Card)
 * 3. Total Memory (GB) Usage (Card)
 * 4. Total Number of I/O Devices Connected (Card)
 * 5. Most Memory consuming Processes (Table)
 * 6. Processes with Memory Leak (Table)
 * 7. Most Recent Process Tree (Tree)
 * 8. Memory Consumption of single process over time (Line Chart)
 * 9. CPU Consumption of single process over time (Line Chart)
 * @returns
 */
const ProcessInformationPage: React.FC = () => {

    const { selectedOrg } = useOrganization()
    const [memoryUsagePercent, setMemoryUsagePercent] = useState(0.0);
    const [cpuUsagePercent, setCpuUsagePercent] = useState(0.0);
    const [memoryUsageGB, setMemoryUsageGB] = useState(0.0);
    const [ioDevicesConnected, setIoDevicesConnected] = useState(0);

    const [availableDevices, setAvailableDevices] = useState<string[]>([]);
    const [device, selectedDevice] = useState("");

    const today = new Date();
    const past24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const [fromDate, setFromDate] = useState(past24Hours.toISOString());
    const [toDate, setToDate] = useState(today.toISOString());

    const [memoryIntenseProcesses, setMemoryIntenseProcesses] = useState<RunningDevicesStatsResponse[]>([]);
    const [activePageMemoryIntense, setActivePageMemoryIntense] = useState(1);
    const [totalMemoryIntenseProcess, setTotalMemoryIntenseProcess] = useState(1);
    const [memoryIntenseProcessSearchTerm, setMemoryIntenseProcessesSearchTerm] = useState("");

    const [memoryLeakProcesses, setMemoryLeakProcesses] = useState<RunningDevicesStatsResponse[]>([]);
    const [activePageMemoryLeak, setActivePageMemoryLeak] = useState(1);
    const [totalMemoryLeakProcesses, setTotalMemoryLeakProcesses] = useState(1);
    const [memoryLeakProcessSearchTerm, setMemoryLeakProcessSearchTerm] = useState("");

    const totalItemsPerPage = 10;

    const [selectedProcessName, setSelectedProcessName] = useState<string | null>(null);
    const [processExecutionChartData, setProcessExecutionChartData] = useState<{ x: Date[]; memoryUsage: number[], cpuUsage: number[], processName: string, processId: string[], processingTimestamp: string[] } | null>(null);
    const [isFetchingExecutions, setIsFetchingExecutions] = useState(false);

    const [processTreeData, setProcessTreeData] = useState<ProcessTreeInfo[]>([]);
    const [processTreeHighlightPid, setProcessTreeHighlightPid] = useState<string | null>(null);
    const [isFetchingProcessTree, setIsFetchingProcessTree] = useState(false);


    /**
     * Elasticsearch Data Processing
     */

    const updateFromDate = useCallback((newFromDate: string) => {
        // From date should not be more than 30 days in the past
        const newFrom = new Date(newFromDate);
        const now = !!toDate ? new Date(toDate) : new Date();
        if (newFrom < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) {
            setFromDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString());
        } else if (newFrom > now) {
            setFromDate(now.toISOString());
        } else {
            setFromDate(newFrom.toISOString());
        }
    }, [toDate]);

    const fetchUniqueDevices = async () => {
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.ioDevices);
        if (!indexInfo) return;
        const result = await elasticsearchService.aggregate<null, FetchUniqueDevicesResponse>(
            fetchUniqueDevicesQuery(0, 1),
            elasticIndices.ioDevices,
            selectedOrg.info.id,
            indexInfo.major_version
        );
        if(!result || !result.aggregations) {
            console.error("Failed to fetch unique devices:", result);
            return;
        }
        const devices = parseFetchUniqueDevicesResponse(result.aggregations);
        setAvailableDevices(devices);
        if(!devices.includes(device)) {
            selectedDevice(devices[0] || "");
        }
    };

    const fetchDeviceMetrics = async () => {
        if(!device || !fromDate || !toDate) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.deviceMetrics);
        if (!indexInfo) return;
        const result = await elasticsearchService.aggregate<null, FetchDeviceMetricsAggregationResponse>(buildFetchDeviceMetricsQuery({
            deviceId: device,
            from: fromDate,
            to: toDate
        }), elasticIndices.deviceMetrics, selectedOrg.info.id, indexInfo.major_version);
        
        if(!result || !result.aggregations) {
            console.error("Failed to fetch device metrics:", result);
            return;
        }
        const metrics = parseFetchDeviceMetricsResponse(result.aggregations);
        if(metrics.length === 0) {
            setMemoryUsagePercent(0);
            setCpuUsagePercent(0);
            setMemoryUsageGB(0);
            return;
        }
        // Assuming the last bucket is the most recent one due to chronological ordering of buckets
        const latestMetrics = metrics[metrics.length - 1];
        setMemoryUsagePercent(latestMetrics.memory_usage);
        setCpuUsagePercent(latestMetrics.cpu_usage);
        setMemoryUsageGB(latestMetrics.memory_megabytes / 1024); // Convert MB to GB
    };

    const fetchTotalIODevices = async () => {
        if(!device || !fromDate || !toDate) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.ioDevices);
        if (!indexInfo) return;
        const result = await elasticsearchService.aggregate<null, FetchTotalIoDevicesResponse>(
            buildFetchTotalIoDevicesQuery({
                deviceId: device,
                from: fromDate,
                to: toDate
            }),
            elasticIndices.ioDevices,
            selectedOrg.info.id,
            indexInfo.major_version
        );
        if(!result || !result.aggregations) {
            console.error("Failed to fetch total I/O devices:", result);
            return;
        }
        const ioDevices = result.aggregations ? result.aggregations.unique_io_devices.buckets.length : 0;
        setIoDevicesConnected(ioDevices);
    };

    const fetchProcessExecutions = async (processName: string) => {
        if(!device || !fromDate || !toDate) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.processExecutions);
        if (!indexInfo) return;
        setIsFetchingExecutions(true);
        setSelectedProcessName(processName);
        setProcessExecutionChartData(null);
        setProcessTreeData([]);
        try {
            // Fetch Process Executions
            const result = await elasticsearchService.search<FetchProcessExecutionsResponse>(
                buildFetchProcessExecutionsQuery({
                    deviceId: device,
                    from: fromDate,
                    to: toDate,
                    processNameKeyword: processName,
                    page: 1,
                    pageSize: 200
                }),
                elasticIndices.processExecutions,
                selectedOrg.info.id,
                indexInfo.major_version
            );
            if (!result || !result.hits?.hits?.length) {
                console.error("No process executions found for:", processName);
                setProcessExecutionChartData({ x: [], memoryUsage: [], cpuUsage: [], processingTimestamp: [], processName: "", processId: [] });
                setProcessTreeData([]);
                return;
            }
            let executions = parseFetchProcessExecutionsResponse(result as any);

            // Set chart data
            setProcessExecutionChartData({
                x: executions.map(e => new Date(e.timestamp)),
                memoryUsage: executions.map(e => e.memory_megabytes),
                cpuUsage: executions.map(e => e.cpu_usage),
                processName,
                processId: executions.map(e => e.process_id),
                processingTimestamp: executions.map(e => e.processing_timestamp)
            });
        } finally {
            setIsFetchingExecutions(false);
        }
    };

    const fetchProcessTree = async (processId:string, deviceId:string, processing_timestamp:string) => {
        try {
            if(!deviceId || !processing_timestamp) return;
            if (!selectedOrg || !selectedOrg.resource?.indices) return;
            const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.processTree);
            if (!indexInfo) return;
            setIsFetchingProcessTree(true);
            const result = await elasticsearchService.search<fetchProcessTreeResponse>(
                fetchProcessTreeQuery(deviceId, processing_timestamp),
                elasticIndices.processTree,
                selectedOrg.info.id,
                indexInfo.major_version
            );
            if(!result || !result.hits?.hits?.length) {
                console.error("No process tree data found for:", {processId, deviceId, processing_timestamp});
                setProcessTreeData([]);
                return;
            }
            const processTree = mapProcessTreeResponse(result as any);
            setProcessTreeData(processTree);
            setProcessTreeHighlightPid(processId);
        } catch (error) {
            console.error("Error fetching process tree:", error);
            setProcessTreeData([]);
        }
        setIsFetchingProcessTree(false);
    }

    const fetchMemoryIntensiveProcesses = useCallback(async () => {
        if(!device || !activePageMemoryIntense || !totalItemsPerPage) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.runningProcesses);
        if (!indexInfo) return;
        const result = await elasticsearchService.search<RunningDevicesStatsResponse>(
            buildFetchRunningDevicesStatsQuery({
                deviceId: device,
                page: activePageMemoryIntense,
                pageSize: totalItemsPerPage,
                order_by: "avg_memory_megabytes",
                fields: [
                    "processing_timestamp",
                    "avg_memory_megabytes",
                    "deviation_memory_consumption_megabytes",
                    "avg_cpu_consumption",
                    "process_name"
                ],
                filters: memoryIntenseProcessSearchTerm ? [
                    {
                        wildcard: {
                            process_name: `*${memoryIntenseProcessSearchTerm}*`
                        }
                    }
                ] : []
            }),
            elasticIndices.runningProcesses,
            selectedOrg.info.id,
            indexInfo.major_version
        );
        if(!result || !result.hits || !result.hits.hits?.length) {
            console.error("Failed to fetch memory intensive processes:", result);
            return;
        }
        return parseFetchRunningDevicesStatsResponse(result);
        
    }, [
        fromDate, toDate, device, 
        activePageMemoryIntense, totalItemsPerPage, memoryIntenseProcessSearchTerm, 
        selectedOrg
    ]);
    
    const fetchMemoryLeakProcesses = useCallback(async () => {
        if(!device || !activePageMemoryLeak || !totalItemsPerPage) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.runningProcesses);
        if (!indexInfo) return;
        const result = await elasticsearchService.search<RunningDevicesStatsResponse>(
            buildFetchRunningDevicesStatsQuery({
                deviceId: device,
                // from: fromDate, # Memory leak is relative and not time dependent
                // to: toDate, # Memory leak is relative and not time dependent
                page: activePageMemoryLeak,
                pageSize: totalItemsPerPage,
                order_by: "avg_memory_leak",
                filters: memoryLeakProcessSearchTerm ? [
                    {
                        wildcard: {
                            process_name: `*${memoryLeakProcessSearchTerm}*`
                        }
                    }
                ] : [],
            }),
            elasticIndices.runningProcesses,
            selectedOrg.info.id,
            indexInfo.major_version
        );
        if(!result || !result.hits || !result.hits.hits?.length) {
            console.error("Failed to fetch memory intensive processes:", result);
            return;
        }
        return parseFetchRunningDevicesStatsResponse(result);
    }, [fromDate, toDate, device, 
        activePageMemoryLeak, totalItemsPerPage, memoryLeakProcessSearchTerm, 
        selectedOrg]);

    /**
     * Component Display related functions
     */

    useEffect(() => {
        selectedDevice("");
        setAvailableDevices([]);
        fetchUniqueDevices();
    }, [selectedOrg]);

    useEffect(() => {
        fetchTotalIODevices();
        fetchDeviceMetrics();
    }, [fromDate, toDate, device])

    // Reset both paginated tables to page 1 whenever the filters change.
    useEffect(() => {
        setActivePageMemoryIntense(1);
        setActivePageMemoryLeak(1);
        setMemoryIntenseProcessesSearchTerm("");
        setMemoryLeakProcessSearchTerm("");
        setTotalMemoryIntenseProcess(1);
        setTotalMemoryLeakProcesses(1);

        setSelectedProcessName(null);
        setProcessExecutionChartData(null);
        setProcessTreeData([]);
        setProcessTreeHighlightPid(null);
    }, [device, fromDate, toDate]);

    // Fires exactly once per unique (device + dateRange + page) combination for
    // the memory-intense table. The memo reference encodes all deps.
    useEffect(() => {
        fetchMemoryIntensiveProcesses().then(data => {
            if(data) {
                setMemoryIntenseProcesses(data.items);
                setTotalMemoryIntenseProcess(data.total);
            } else {
                setMemoryIntenseProcesses([]);
                setTotalMemoryIntenseProcess(1);
            }
        });
    }, [fetchMemoryIntensiveProcesses]);

    // Same pattern for the memory-leak table.
    useEffect(() => {
        fetchMemoryLeakProcesses().then(data => {
            if(data) {
                setMemoryLeakProcesses(data.items);
                setTotalMemoryLeakProcesses(data.total);
            } else {
                setMemoryLeakProcesses([]);
                setTotalMemoryLeakProcesses(1);
            }
        });
    }, [fetchMemoryLeakProcesses])
    

    return <>
        <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-row flex-wrap flex-start gap-4 display-unique-device-dropdown">
                {availableDevices.length > 0 ? (
                        <Dropdown 
                            items={availableDevices.map((d) => ({ name: d, value: d }))}
                            value={device}
                            handler={(item) => selectedDevice(item)}
                            placeholder="Select Device"
                            label="Select Device"
                            disabled={availableDevices.length === 0}
                            className="w-auto"

                        />
                    ) : (
                        <p>No devices found.</p>
                    )   
                }

                <TimeRange 
                    label="Select Time Range"
                    from={fromDate}
                    to={toDate}
                    handler={({from, to}) => {
                        if (from) updateFromDate(from);
                        if (to) setToDate(to);
                    }}
                    className="w-auto"

                />


            </div>
            <CardRow
                memoryUsagePercent={memoryUsagePercent}
                cpuUsagePercent={cpuUsagePercent}
                memoryUsageGB={memoryUsageGB}
                ioDevicesConnected={ioDevicesConnected} />

            
            {activePageMemoryIntense && <div className="memory-intensive-process-section">
                <div className="flex flex-wrap w-full gap-2 flex-start mb-2 memory-intensive-process-filters">
                    <SearchInput 
                        value=""
                        onChange={(value) => { 
                            setActivePageMemoryIntense(1); // Reset to first page on new search
                            setMemoryIntenseProcessesSearchTerm(value);
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
                        { name: "Processed At", key: "processingTimestamp"}
                    ]}
                    data={memoryIntenseProcesses.map(p => ({
                        processName: p.process_name,
                        avgMemoryUsageGB: ((p.avg_memory_megabytes || 0) / 1024).toFixed(2),
                        deviationMemoryConsumption: ((p.deviation_memory_consumption_megabytes || 0)/1024 ).toFixed(2),
                        avgCpuConsumption: (p.avg_cpu_consumption || 0).toFixed(2),
                        processingTimestamp: new Date(p.processing_timestamp).toLocaleString()
                    }))}
                    pagination={
                        Array.from({ length: Math.ceil(totalMemoryIntenseProcess/totalItemsPerPage) }, (_, i) => ({
                            pageNumber: i + 1,
                            isActive: activePageMemoryIntense === (i + 1)
                        }))
                    }
                    paginationHandler={(page) => {
                        setActivePageMemoryIntense(page);
                    }}
                    clipLongText={true}
                    totalPages={Math.ceil(totalMemoryIntenseProcess/totalItemsPerPage)}
                    onRowClick={(row) => !isFetchingExecutions && fetchProcessExecutions(row.processName)}
                />
                
            </div>}
            {activePageMemoryLeak && <div className="memory-leak-process-section">
                <div className="flex flex-wrap w-full gap-2 flex-start mb-2 memory-leak-process-filters">
                    <SearchInput 
                        value=""
                        onChange={(value) => { 
                            setActivePageMemoryLeak(1); // Reset to first page on new search
                            setMemoryLeakProcessSearchTerm(value);
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
                        { name: "Deviation of Memory Leak", key: "deviationMemoryLeak" }
                    ]}
                    data={memoryLeakProcesses.map(p => ({
                        processName: p.process_name,
                        avgMemoryLeak: (p.avg_memory_leak || 0).toFixed(2),
                        deviationMemoryLeak: (p.deviation_memory_leak || 0).toFixed(2)
                    }))}
                    pagination={Array.from({ length: Math.ceil(totalMemoryLeakProcesses/totalItemsPerPage) }, (_, i) => ({
                        pageNumber: i + 1,
                        isActive: activePageMemoryLeak === (i + 1)
                    }))}
                    paginationHandler={(page) => { setActivePageMemoryLeak(page); }}
                    clipLongText={true}
                    totalPages={Math.ceil(totalMemoryLeakProcesses/totalItemsPerPage)}
                    onRowClick={(row) => !isFetchingExecutions && fetchProcessExecutions(row.processName)}
                />
            </div>}
        </div>
        <SidePanel
        title={`Process Execution Details${selectedProcessName ? ` — ${selectedProcessName}` : ""}`}
        isDisplayed={!!selectedProcessName}
        onClose={() => {
            setSelectedProcessName(null);
            setProcessExecutionChartData(null);
        }}
        >
            {selectedProcessName && (
                <div className="card p-4 flex flex-col gap-2">
                    {isFetchingExecutions && (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading executions for <strong>{selectedProcessName}</strong>…</p>
                    )}
                    {!isFetchingExecutions && processExecutionChartData && processExecutionChartData.x.length === 0 && (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>No execution records found for <strong>{selectedProcessName}</strong> in the selected time range.</p>
                    )}
                    {!isFetchingExecutions && processExecutionChartData && processExecutionChartData.x.length > 0 && (
                        <LineChart
                            title={`Memory Usage over Time — ${selectedProcessName}`}
                            data={[{
                                label: processExecutionChartData.processName,
                                x: processExecutionChartData.x,
                                y: processExecutionChartData.memoryUsage,
                                dataPointId: processExecutionChartData.processId
                            }]}
                            xAxisTitle="Time"
                            yAxisTitle="Memory (MB)"
                            timeSeriesUnit="hour"
                            onDataPointClick={(datapointId:string) => {
                                const index = processExecutionChartData.processId.findIndex(id => id === datapointId);
                                if(index !== -1) {
                                    const processId = processExecutionChartData.processId[index];
                                    const processingTimestamp = processExecutionChartData.processingTimestamp[index];
                                    !isFetchingProcessTree && fetchProcessTree(processId, device, processingTimestamp);
                                }
                            }}
                        />
                    )}
                    {!isFetchingExecutions && processExecutionChartData && processExecutionChartData.x.length > 0 && (
                        <LineChart
                            title={`CPU Usage over Time — ${selectedProcessName}`}
                            data={[{
                                label: processExecutionChartData.processName,
                                x: processExecutionChartData.x,
                                dataPointId: processExecutionChartData.processId,
                                y: processExecutionChartData.cpuUsage
                            }]}
                            xAxisTitle="Time"
                            yAxisTitle="CPU (%)"
                            timeSeriesUnit="hour"
                            onDataPointClick={(datapointId:string) => {
                                const index = processExecutionChartData.processId.findIndex(id => id === datapointId);
                                if(index !== -1) {
                                    const processId = processExecutionChartData.processId[index];
                                    const processingTimestamp = processExecutionChartData.processingTimestamp[index];
                                    !isFetchingProcessTree && fetchProcessTree(processId, device, processingTimestamp);
                                }
                            }}
                        />
                    )}
                    {
                        !isFetchingProcessTree && processTreeData && processTreeData.length > 0 && (
                            <ProcessTreeDiagram 
                                deviceId={device}
                                processId={processTreeHighlightPid || ""}
                                processes={processTreeData}
                            />
                        )
                    }
                </div>
            )}
        </SidePanel>

    </>;
};

export default ProcessInformationPage;