import type React from "react";
import MetricsCard from "../components/Card/MetricsCard";
import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/Table/DataTable";
import elasticsearchService from "../services/elasticsearch.service";
import { elasticIndices } from "../constants";
import { fetchUniqueDevicesQuery, parseFetchUniqueDevicesResponse, type FetchUniqueDevicesResponse } from "../queries/fetchUniqueDevices";
import { buildFetchTotalIoDevicesQuery, type FetchTotalIoDevicesResponse } from "../queries/fetchTotalIoDevices";
import Dropdown from "../components/Filters/Dropdown";
import TimeRange from "../components/Filters/TimeRange";
import { buildFetchDeviceMetricsQuery, type FetchDeviceMetricsResponse } from "../queries/fetchDeviceMetrics";
import { buildFetchMemoryIntenseProcessQuery, parseFetchMemoryIntenseProcessResponse, type MemoryIntenseProcess } from "../queries/fetchMemoryIntenseProcess";
import { buildFetchMemoryLeakProcessesQuery, parseFetchMemoryLeakProcessesResponse, type MemoryLeakProcess } from "../queries/fetchProcessesByHour";


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
                { name: "Average Memory Usage (GB)", key: "avgMemoryUsageGB" },
                { name: "Avg. Deviation from Mean (%)", key: "deviationMemoryConsumption" },
                { name: "Average CPU Usage (%)", key: "avgCpuConsumption" }
            ]}
            data={memoryIntenseProcesses.map(p => ({
                processName: p.process_name,
                avgMemoryUsageGB: (p.avg_memory_megabytes / 1024).toFixed(2),
                deviationMemoryConsumption: p.deviation_memory_consumption.toFixed(2),
                avgCpuConsumption: p.avg_cpu_consumption.toFixed(2)
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
        />}
    </div>;
};

export default DataEngineeringPage;