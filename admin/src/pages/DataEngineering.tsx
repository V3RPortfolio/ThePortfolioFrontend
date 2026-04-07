import type React from "react";
import MetricsCard from "../components/Card/MetricsCard";
import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/Table/DataTable";
import LineChart from "../components/Charts/LineChart";
import elasticsearchService from "../services/elasticsearch.service";
import { elasticIndices } from "../constants";
import { fetchUniqueDevicesQuery, parseFetchUniqueDevicesResponse, type FetchUniqueDevicesResponse } from "../queries/fetchUniqueDevices";
import { buildFetchTotalIoDevicesQuery, type FetchTotalIoDevicesResponse } from "../queries/fetchTotalIoDevices";
import Dropdown from "../components/Filters/Dropdown";
import TimeRange from "../components/Filters/TimeRange";
import { buildFetchDeviceMetricsQuery, parseFetchDeviceMetricsResponse, type FetchDeviceMetricsResponse } from "../queries/fetchDeviceMetrics";
import { buildFetchMemoryIntenseProcessQuery, parseFetchMemoryIntenseProcessResponse, type FetchMemoryIntenseProcessResponse, type MemoryIntenseProcess } from "../queries/fetchMemoryIntenseProcess";
import { fetchUniqueProcessNamesQuery, parseFetchUniqueProcessNamesResponse, type FetchUniqueProcessNamesAggregation } from "../queries/fetchUniqueProcessNames";
import { buildFetchProcessesByHourQuery, parseFetchProcessesByHourResponse, type FetchProcessesByHourResponse, type ProcessesByHour } from "../queries/fetchProcessesByHour";


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
interface HourlyProcessData {
    processes: ProcessesByHour[];
    memoryIncreaseRate: number;
    avgMemoryUsage: number;
}

interface MemoryLeakData {
    processName: string;
    memoryUsageGB: string;
    memoryIncreaseRate: string;
    index: number;
}

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

    const [hourlyProcessData, setHourlyProcessData] = useState<{name:string, data: HourlyProcessData, index:number}[]>([]);
    const [activePageHourlyProcess, setActivePageHourlyProcess] = useState(1);

    const [memoryLeakGraphProcess, setMemoryLeakGraphProcess] = useState<number[]>([]);
    const addToMemoryLeakGraphProcess = (index: number) => {
        setMemoryLeakGraphProcess(prev => {
            if(prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    }
    const removeFromMemoryLeakGraphProcess = (index: number) => {
        setMemoryLeakGraphProcess(prev => prev.filter(i => i !== index));
    }
    const existsInMemoryLeakGraphProcess = (index: number) => {
        return memoryLeakGraphProcess.includes(index);
    }

    const totalItemsPerPage = 10;


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

    const fetchTotalProcesses = async () => {
        const result = await elasticsearchService.aggregate<null, FetchUniqueProcessNamesAggregation>(
            fetchUniqueProcessNamesQuery(
                device,
                fromDate,
                toDate
            ),
            elasticIndices.processExecutions
        );
        if(!result || !result.aggregations) {
            console.error("Failed to fetch total processes:", result);
            return;
        }
        const totalProcesses = result.aggregations ? parseFetchUniqueProcessNamesResponse(result.aggregations) : 0;
        setTotalMemoryIntenseProcess(totalProcesses);
    };

    const fetchMemoryIntensiveProcesses = useMemo(async () => {
        const result = await elasticsearchService.aggregate<null, FetchMemoryIntenseProcessResponse>(
            buildFetchMemoryIntenseProcessQuery({
                deviceId: device,
                from: fromDate,
                to: toDate,
                page: activePageMemoryIntense,
                pageSize: totalItemsPerPage
            }),
            elasticIndices.processExecutions
        );
        if(!result || !result.aggregations || 
            !result.aggregations.processes || 
            !result.aggregations.processes.buckets?.length ||
            !result.aggregations.processes.buckets[0].top_hit?.hits?.hits?.length
        ) {
            console.error("Failed to fetch memory intensive processes:", result);
            return;
        }
        return result.aggregations ? parseFetchMemoryIntenseProcessResponse(result.aggregations) : [];
        
    }, [fromDate, toDate, device, activePageMemoryIntense, totalItemsPerPage, totalMemoryIntenseProcess]);

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

    const fetchHourlyProcessData = useMemo(async () => {
        const result = await elasticsearchService.aggregate<null, FetchProcessesByHourResponse>(
            buildFetchProcessesByHourQuery({
                deviceId: device,
                from: fromDate,
                to: toDate,
                sortField: "memory_megabytes",
                sortOrder: "desc"
            }),
            elasticIndices.processExecutions
        );
        if(!result || !result.aggregations) {
            console.error("Failed to fetch hourly process data:", result);
            return;
        }
        
        const processes = parseFetchProcessesByHourResponse(result.aggregations).sort(
                (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            ).reduce((acc, curr) => {
                if (!acc[curr.process_name]) {
                    acc[curr.process_name] = {
                        processes: [],
                        memoryIncreaseRate: 0,
                        avgMemoryUsage: 0
                    };
                }
                acc[curr.process_name].processes.push(curr);
                return acc;
            }, {} as {[key:string]: HourlyProcessData});

        for (const processName in processes) {
            processes[processName].processes = processes[processName].processes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            processes[processName].avgMemoryUsage = processes[processName].processes.reduce((sum, p) => sum + p.avg_usage, 0) / processes[processName].processes.length;

            let memorySlopes = processes[processName].processes.map((p, index) => {
                if(index == 0) return 0;
                // Compute slope if time difference between the two indices is less than 1 hour
                if((new Date(processes[processName].processes[index].timestamp).getTime() - new Date(processes[processName].processes[index-1].timestamp).getTime()) > 60 * 60 * 1000) {
                    return null;    
                }
                return p.avg_usage - processes[processName].processes[index - 1].avg_usage;
            }).filter(x => x !== null) as number[];
            if(memorySlopes.length > 1) {
                for(let i=1; i<memorySlopes.length; i++) {
                    processes[processName].memoryIncreaseRate += memorySlopes[i] - memorySlopes[i-1];
                }
                processes[processName].memoryIncreaseRate /= (memorySlopes.length - 1);
            }
        }

        return Object.keys(processes)
                                .sort((a, b) => processes[b].memoryIncreaseRate - processes[a].memoryIncreaseRate)
                                .map((name, index) => ({data: processes[name], name, index}))
    }, [fromDate, toDate, device, totalMemoryIntenseProcess]);

    /**
     * Component Display related functions
     */
    

    useEffect(() => {
        fetchUniqueDevices();
    }, []);

    useEffect(() => {
        fetchTotalIODevices();
        fetchDeviceMetrics();
        fetchTotalProcesses();
        fetchHourlyProcessData.then(data => {
            if(data) {
                setHourlyProcessData(data);
                setActivePageHourlyProcess(1);
                if(data.length > 0 && memoryLeakGraphProcess.length == 0) {
                    setMemoryLeakGraphProcess([0])
                }
            }
        });
    }, [fromDate, toDate, device])

    useEffect(() => {
        fetchMemoryIntensiveProcesses.then(data => {
            if(data) {
                setMemoryIntenseProcesses(data);
                setActivePageMemoryIntense(1);
            }
        });
    }, [device, fromDate, toDate, activePageMemoryIntense])
    

    return <div className="p-6 flex flex-col gap-6">
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
                { name: "Memory Usage (GB)", key: "memoryUsageGB" }
            ]}
            data={memoryIntenseProcesses.map(p => ({
                processName: p.process_name,
                memoryUsageGB: (p.memory_megabytes/1024).toFixed(2)
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
        />}

        {activePageHourlyProcess && <DataTable 
            title="Processes with Memory Leak"
            columns={[
                { name: "Process Name", key: "processName" },
                { name: "Average Memory Usage (GB)", key: "memoryUsageGB" },
                { name: "Rate of Increase (MB Per hour)", key: "memoryIncreaseRate" }
            ]}
            data={hourlyProcessData
                .slice((activePageHourlyProcess - 1) * totalItemsPerPage, (activePageHourlyProcess - 1) * totalItemsPerPage + totalItemsPerPage)
                .map(({ name, data, index }) => {
                    return {
                        processName: name,
                        memoryUsageGB: (data.avgMemoryUsage/1024).toFixed(2),
                        memoryIncreaseRate: data.memoryIncreaseRate.toFixed(2),
                        index
                    }
                }) as MemoryLeakData[]}
            pagination={Array.from({ length: Math.ceil(hourlyProcessData.length/totalItemsPerPage) }, (_, i) => ({
                pageNumber: i + 1,
                isActive: activePageHourlyProcess === (i + 1)
            }))}
            paginationHandler={(page) => { setActivePageHourlyProcess(page); }}
            clipLongText={true}
            totalPages={Math.ceil(hourlyProcessData.length/totalItemsPerPage)}
            onRowClick={(row) => {
                const process = row as MemoryLeakData;
                if(!process || !process.index) return;
                if(!existsInMemoryLeakGraphProcess(process.index)) {
                    addToMemoryLeakGraphProcess(process.index);
                } else {
                    removeFromMemoryLeakGraphProcess(process.index);
                }
            }}
        />}

        <LineChart 
            title="Memory Consumption of Process A Over Time"
            data={memoryLeakGraphProcess.map(index => {
                if(hourlyProcessData.length <= index) return {};
                const process = hourlyProcessData[index];
                return {
                    label: process.name,
                    x: process.data.processes.map(x => x.timestamp), // Assuming 5-minute intervals
                    y: process.data.processes.map(d => d.avg_usage)
                };
            }).filter(d => typeof d.x !== "undefined" && typeof d.y !== "undefined")}
            timeSeriesUnit="hour"
            xAxisTitle="Time"
            yAxisTitle="Memory Usage (MB)"
        />
    </div>;
};

export default DataEngineeringPage;