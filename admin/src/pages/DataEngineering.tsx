import type React from "react";
import MetricsCard from "../components/Card/MetricsCard";
import { useEffect, useState } from "react";
import DataTable from "../components/Table/DataTable";
import LineChart from "../components/Charts/LineChart";


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
                value={memoryUsagePercent}
                unit="%"
                isPercentage
            />
            <MetricsCard
                title="Total CPU Usage"
                value={cpuUsagePercent}
                unit="%"
                isPercentage
            />
            <MetricsCard
                title="Total Memory Usage"
                value={memoryUsageGB}
                unit="GB"
            />
            <MetricsCard
                title="I/O Devices Connected"
                value={ioDevicesConnected}
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
    const [memoryUsagePercent, setMemoryUsagePercent] = useState(0);
    const [cpuUsagePercent, setCpuUsagePercent] = useState(0);
    const [memoryUsageGB, setMemoryUsageGB] = useState(0);
    const [ioDevicesConnected, setIoDevicesConnected] = useState(0);

    const [index, selectedIndex] = useState("");
    const [device, selectedDevice] = useState("");


    /**
     * Elasticsearch Data Processing
     */
    const fetchElasticIndices = async () => {

    };

    const fetchUniqueDevices = async () => {
    };

    const fetchProcessExecutions = async () => {
    };

    const fetchProcessTree = async () => {

    };

    const feetchIODevices = () => {

    };

    /**
     * Component Display related functions
     */
    const onPageChange = (pageNumber: number) => {
        console.log("Page changed to:", pageNumber);
    };
    

    useEffect(() => {
        fetchElasticIndices();
        fetchUniqueDevices();
    }, []);
    

    return <div className="p-6 flex flex-col gap-6">
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
            data={[
                { processName: "Process A", memoryUsageGB: 2.5 },
                { processName: "Process B", memoryUsageGB: 1.8 },
                { processName: "Process C", memoryUsageGB: 0.9 },
            ]}
            pagination={[
                { pageNumber: 1, isActive: true },
                { pageNumber: 2 },
                { pageNumber: 3 },
            ]}
            paginationHandler={onPageChange}
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
            paginationHandler={onPageChange}
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