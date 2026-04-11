import type React from "react";
import MetricsCard from "../components/Card/MetricsCard";
import { useEffect, useMemo, useState } from "react";
import LineChart from "../components/Charts/LineChart";
import DataTable from "../components/Table/DataTable";
import elasticsearchService from "../services/elasticsearch.service";
import { elasticIndices } from "../constants";
import { fetchUniqueDevicesQuery, parseFetchUniqueDevicesResponse, type FetchUniqueDevicesResponse } from "../queries/fetchUniqueDevices";
import { buildFetchTotalIoDevicesQuery, type FetchTotalIoDevicesResponse } from "../queries/fetchTotalIoDevices";
import Dropdown from "../components/Filters/Dropdown";
import TimeRange from "../components/Filters/TimeRange";
import { buildFetchDeviceMetricsQuery, type FetchDeviceMetricsResponse } from "../queries/fetchDeviceMetrics";
import { buildFetchMemoryIntenseProcessQuery, parseFetchMemoryIntenseProcessResponse, type MemoryIntenseProcess } from "../queries/fetchMemoryIntenseProcess";
import { buildFetchMemoryLeakProcessesQuery, parseFetchMemoryLeakProcessesResponse, type MemoryLeakProcess } from "../queries/fetchMemoryLeak";
import { buildFetchProcessExecutionsQuery, parseFetchProcessExecutionsResponse, type FetchProcessExecutionsResponse } from "../queries/fetchProcessExecutions";
import SidePanel from "../components/Panels/Sidepanel";
import { fetchProcessTreeQuery, mapProcessTreeResponse, type fetchProcessTreeResponse, type ProcessTreeInfo } from "../queries/fetchProcessTree";
import ProcessTreeDiagram from "../components/Trees/ProcessTree";


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
const DataEngineeringPage: React.FC = () => {
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

    const [memoryIntenseProcesses, setMemoryIntenseProcesses] = useState<MemoryIntenseProcess[]>([]);
    const [activePageMemoryIntense, setActivePageMemoryIntense] = useState(1);
    const [totalMemoryIntenseProcess, setTotalMemoryIntenseProcess] = useState(1);

    const [memoryLeakProcesses, setMemoryLeakProcesses] = useState<MemoryLeakProcess[]>([]);
    const [activePageMemoryLeak, setActivePageMemoryLeak] = useState(1);
    const [totalMemoryLeakProcesses, setTotalMemoryLeakProcesses] = useState(1);

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

    const fetchUniqueDevices = async () => {
        const result = await elasticsearchService.aggregate<null, FetchUniqueDevicesResponse>(
            fetchUniqueDevicesQuery(1, 10),
            elasticIndices.ioDevices
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
        const result = await elasticsearchService.search<FetchDeviceMetricsResponse>(buildFetchDeviceMetricsQuery({
            deviceId: device,
            from: fromDate,
            to: toDate
        }), elasticIndices.deviceMetrics);
        if(!result || !result.hits || !result.hits.hits || result.hits.hits.length === 0) {
            console.error("Failed to fetch device metrics:", result);
            return;
        }
        const latestMetrics = result.hits.hits[0]._source;
        setMemoryUsagePercent(latestMetrics.memory_usage);
        setCpuUsagePercent(latestMetrics.cpu_usage);
        setMemoryUsageGB(latestMetrics.memory_megabytes / 1024);
    };

    const fetchMemoryIntensiveProcesses = useMemo(async () => {
        const result = await elasticsearchService.search<MemoryIntenseProcess>(
            buildFetchMemoryIntenseProcessQuery({
                deviceId: device,
                from: fromDate,
                to: toDate,
                page: activePageMemoryIntense,
                pageSize: totalItemsPerPage
            }),
            elasticIndices.runningProcesses
        );
        if(!result || !result.hits || !result.hits.hits?.length) {
            console.error("Failed to fetch memory intensive processes:", result);
            return;
        }
        return parseFetchMemoryIntenseProcessResponse(result);
        
    }, [fromDate, toDate, device, activePageMemoryIntense, totalItemsPerPage]);

    const fetchTotalIODevices = async () => {
        const result = await elasticsearchService.aggregate<null, FetchTotalIoDevicesResponse>(
            buildFetchTotalIoDevicesQuery({
                deviceId: device,
                from: fromDate,
                to: toDate
            }),
            elasticIndices.ioDevices
        );
        if(!result || !result.aggregations) {
            console.error("Failed to fetch total I/O devices:", result);
            return;
        }
        const ioDevices = result.aggregations ? result.aggregations.unique_io_devices.buckets.length : 0;
        setIoDevicesConnected(ioDevices);
    };

    const fetchMemoryLeakProcesses = useMemo(async () => {
        const result = await elasticsearchService.search<MemoryLeakProcess>(
            buildFetchMemoryLeakProcessesQuery({
                deviceId: device,
                from: fromDate,
                to: toDate,
                page: activePageMemoryLeak,
                pageSize: totalItemsPerPage
            }),
            elasticIndices.runningProcesses
        );
        if(!result || !result.hits || !result.hits.hits?.length) {
            console.error("Failed to fetch memory leak processes:", result);
            return;
        }
        return parseFetchMemoryLeakProcessesResponse(result);
    }, [fromDate, toDate, device, activePageMemoryLeak, totalItemsPerPage]);

    const fetchProcessExecutions = async (processName: string) => {
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
                elasticIndices.processExecutions
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
            setIsFetchingProcessTree(true);
            const result = await elasticsearchService.search<fetchProcessTreeResponse>(
                fetchProcessTreeQuery(deviceId, processing_timestamp),
                elasticIndices.processTree
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

    /**
     * Component Display related functions
     */
    

    useEffect(() => {
        fetchUniqueDevices();
    }, []);

    useEffect(() => {
        fetchTotalIODevices();
        fetchDeviceMetrics();
    }, [fromDate, toDate, device])

    // Reset both paginated tables to page 1 whenever the filters change.
    useEffect(() => {
        setActivePageMemoryIntense(1);
        setActivePageMemoryLeak(1);
        setSelectedProcessName(null);
        setProcessExecutionChartData(null);
        setProcessTreeData([]);
    }, [device, fromDate, toDate]);

    // Fires exactly once per unique (device + dateRange + page) combination for
    // the memory-intense table. The memo reference encodes all deps.
    useEffect(() => {
        fetchMemoryIntensiveProcesses.then(data => {
            if(data) {
                setMemoryIntenseProcesses(data.items);
                setTotalMemoryIntenseProcess(data.total);
            }
        });
    }, [fetchMemoryIntensiveProcesses]);

    // Same pattern for the memory-leak table.
    useEffect(() => {
        fetchMemoryLeakProcesses.then(data => {
            if(data) {
                setMemoryLeakProcesses(data.items);
                setTotalMemoryLeakProcesses(data.total);
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
                        if (from) setFromDate(from);
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

            
            {activePageMemoryIntense && <DataTable 
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
                    avgMemoryUsageGB: (p.avg_memory_megabytes / 1024).toFixed(2),
                    deviationMemoryConsumption: p.deviation_memory_consumption.toFixed(2),
                    avgCpuConsumption: p.avg_cpu_consumption.toFixed(2),
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
                onRowClick={(row) => fetchProcessExecutions(row.processName)}
            />}
            {activePageMemoryLeak && <DataTable
                title="Processes with Memory Leak"
                columns={[
                    { name: "Process Name", key: "processName" },
                    { name: "Avg. Memory Leak (MB)", key: "avgMemoryLeak" },
                    { name: "Deviation of Memory Leak", key: "deviationMemoryLeak" }
                ]}
                data={memoryLeakProcesses.map(p => ({
                    processName: p.process_name,
                    avgMemoryLeak: p.avg_memory_leak.toFixed(2),
                    deviationMemoryLeak: p.deviation_memory_leak.toFixed(2)
                }))}
                pagination={Array.from({ length: Math.ceil(totalMemoryLeakProcesses/totalItemsPerPage) }, (_, i) => ({
                    pageNumber: i + 1,
                    isActive: activePageMemoryLeak === (i + 1)
                }))}
                paginationHandler={(page) => { setActivePageMemoryLeak(page); }}
                clipLongText={true}
                totalPages={Math.ceil(totalMemoryLeakProcesses/totalItemsPerPage)}
                onRowClick={(row) => fetchProcessExecutions(row.processName)}
            />}
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
                                    fetchProcessTree(processId, device, processingTimestamp);
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
                                    fetchProcessTree(processId, device, processingTimestamp);
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

export default DataEngineeringPage;