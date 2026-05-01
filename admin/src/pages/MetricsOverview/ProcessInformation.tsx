import React, { useCallback, useEffect, useState } from "react";
import elasticsearchService from "../../services/elasticsearch.service";
import { elasticIndices } from "../../constants";
import { fetchUniqueDevicesQuery, parseFetchUniqueDevicesResponse, type FetchUniqueDevicesResponse } from "./queries/fetchUniqueDevices.queries";
import Dropdown from "../../components/Filters/Dropdown";
import TimeRange from "../../components/Filters/TimeRange";
import { useOrganization } from "../../contexts/organization.context";
import DeviceMetricsOverview from "./components/DeviceMetricsOverview";
import MemoryIntensiveProcesses from "./components/MemoryIntensiveProcesses";
import MemoryLeakProcesses from "./components/MemoryLeakProcesses";
import ProcessExecutionDetail from "./components/ProcessExecutionDetail";

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

    const { selectedOrg } = useOrganization();

    const [availableDevices, setAvailableDevices] = useState<string[]>([]);
    const [device, setDevice] = useState("");

    const today = new Date();
    const past24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const [fromDate, setFromDate] = useState(past24Hours.toISOString());
    const [toDate, setToDate] = useState(today.toISOString());

    /** Coordinates which process is shown in the side panel (shared between both tables). */
    const [selectedProcessName, setSelectedProcessName] = useState<string | null>(null);

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
        const indexInfo = selectedOrg.resource.indices.find(x => x.name === elasticIndices.runningProcesses);
        if (!indexInfo) return;
        const result = await elasticsearchService.aggregate<null, FetchUniqueDevicesResponse>(
            fetchUniqueDevicesQuery(0, 1),
            elasticIndices.runningProcesses,
            selectedOrg.info.id,
            indexInfo.major_version
        );
        if (!result || !result.aggregations) {
            console.error("Failed to fetch unique devices:", result);
            return;
        }
        const devices = parseFetchUniqueDevicesResponse(result.aggregations);
        setAvailableDevices(devices);
        if (!devices.includes(device)) {
            setDevice(devices[0] || "");
        }
    };

    useEffect(() => {
        setDevice("");
        setAvailableDevices([]);
        fetchUniqueDevices();
    }, [selectedOrg]);

    // Close the side panel whenever the global filters change
    useEffect(() => {
        setSelectedProcessName(null);
    }, [device, fromDate, toDate]);

    return <>
        <div className="p-6 flex flex-col gap-6">
            <div className="flex flex-row flex-wrap flex-start gap-4 display-unique-device-dropdown">
                {availableDevices.length > 0 ? (
                    <Dropdown
                        items={availableDevices.map((d) => ({ name: d, value: d }))}
                        value={device}
                        handler={(item) => setDevice(item)}
                        placeholder="Select Device"
                        label="Select Device"
                        disabled={availableDevices.length === 0}
                        className="w-auto"
                    />
                ) : (
                    <p>No devices found.</p>
                )}

                <TimeRange
                    label="Select Time Range"
                    from={fromDate}
                    to={toDate}
                    handler={({ from, to }) => {
                        if (from) updateFromDate(from);
                        if (to) setToDate(to);
                    }}
                    className="w-auto"
                />
            </div>

            <DeviceMetricsOverview
                device={device}
                fromDate={fromDate}
                toDate={toDate}
            />

            <MemoryIntensiveProcesses
                device={device}
                fromDate={fromDate}
                toDate={toDate}
                onProcessSelect={(processName) => setSelectedProcessName(processName)}
            />

            <MemoryLeakProcesses
                device={device}
                fromDate={fromDate}
                toDate={toDate}
                onProcessSelect={(processName) => setSelectedProcessName(processName)}
            />
        </div>

        <ProcessExecutionDetail
            processName={selectedProcessName}
            device={device}
            fromDate={fromDate}
            toDate={toDate}
            onClose={() => setSelectedProcessName(null)}
        />
    </>;
};

export default ProcessInformationPage;