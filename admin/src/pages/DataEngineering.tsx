import type React from "react";
import MetricsCard from "../components/Card/MetricsCard";
import { useEffect, useState } from "react";
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
        console.log("Total unique processes:", totalProcesses);
        setTotalMemoryIntenseProcess(totalProcesses);
    };

    const fetchMemoryIntensiveProcesses = async () => {
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
        const processes = result.aggregations ? parseFetchMemoryIntenseProcessResponse(result.aggregations) : [];
        setMemoryIntenseProcesses(processes);
    };

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
    }, [fromDate, toDate, device])

    useEffect(() => {
        fetchMemoryIntensiveProcesses();
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

        <DataTable 
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
        />

        <DataTable 
            title="Processes with Memory Leak"
            columns={[
                { name: "Process Name", key: "processName" },
                { name: "Max Memory Usage (GB)", key: "memoryUsageGB" },
                { name: "Rate of Increase", key: "memoryIncreaseRate" }
            ]}
            data={[
                { processName: "Process A", memoryUsageGB: 2.5, memoryIncreaseRate: "500MB/hr" },
                { processName: "Process B", memoryUsageGB: 1.8, memoryIncreaseRate: "300MB/hr" },
                { processName: "Process C", memoryUsageGB: 0.9, memoryIncreaseRate: "100MB/hr" },
            ]}
            pagination={[
                { pageNumber: 1, isActive: true },
                { pageNumber: 2 },
                { pageNumber: 3 },
            ]}
            paginationHandler={(page) => {}}
        />

        <LineChart 
            title="Memory Consumption of Process A Over Time"
            data={[
                {
                    label: "Process A",
                    x: [0, 5, 10, 15, 20],
                    y: [0.5, 1.0, 1.8, 2.5, 3.0]
                },
                {
                    label: "Process B",
                    x: [0, 5, 10, 15, 20],
                    y: [0.3, 0.8, 1.2, 1.8, 2.5]
                }
            ]}
            xAxisTitle="Time"
            yAxisTitle="Memory Usage (GB)"
        />
    </div>;
};

export default DataEngineeringPage;