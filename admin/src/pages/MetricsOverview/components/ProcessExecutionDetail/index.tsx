import React, { useEffect, useState } from "react";
import LineChart from "../../../../components/Charts/LineChart";
import SidePanel from "../../../../components/Panels/Sidepanel";
import ProcessTreeDiagram from "../../../../components/Trees/ProcessTree";
import elasticsearchService from "../../../../services/elasticsearch.service";
import { elasticIndices } from "../../../../constants";
import {
    buildFetchProcessExecutionsQuery,
    parseFetchProcessExecutionsResponse,
    type FetchProcessExecutionsResponse,
} from "./processExecutions.queries";
import {
    fetchProcessTreeQuery,
    mapProcessTreeResponse,
    type fetchProcessTreeResponse,
} from "./processTree.queries";
import { useOrganization } from "../../../../contexts/organization.context";
import type { ProcessTreeInfo } from "../../../../interfaces/metricsOverview.interface";

interface ProcessExecutionDetailProps {
    /** The currently selected process name — `null` means the panel is hidden. */
    processName: string | null;
    device: string;
    fromDate: string;
    toDate: string;
    onClose: () => void;
}

interface ChartData {
    x: Date[];
    memoryUsage: number[];
    cpuUsage: number[];
    processName: string;
    processId: string[];
    processingTimestamp: string[];
}

const ProcessExecutionDetail: React.FC<ProcessExecutionDetailProps> = ({
    processName,
    device,
    fromDate,
    toDate,
    onClose,
}) => {
    const { selectedOrg } = useOrganization();

    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isFetchingExecutions, setIsFetchingExecutions] = useState(false);

    const [processTreeData, setProcessTreeData] = useState<ProcessTreeInfo[]>([]);
    const [processTreeHighlightPid, setProcessTreeHighlightPid] = useState<string | null>(null);
    const [isFetchingProcessTree, setIsFetchingProcessTree] = useState(false);

    // Fetch executions whenever the selected process changes
    useEffect(() => {
        if (!processName) {
            setChartData(null);
            setProcessTreeData([]);
            setProcessTreeHighlightPid(null);
            return;
        }

        const fetch = async () => {
            if (!device || !fromDate || !toDate) return;
            if (!selectedOrg || !selectedOrg.resource?.indices) return;
            const indexInfo = selectedOrg.resource.indices.find(
                (x) => x.name === elasticIndices.processExecutions
            );
            if (!indexInfo) return;

            setIsFetchingExecutions(true);
            setChartData(null);
            setProcessTreeData([]);
            setProcessTreeHighlightPid(null);

            try {
                const result = await elasticsearchService.search<FetchProcessExecutionsResponse>(
                    buildFetchProcessExecutionsQuery({
                        deviceId: device,
                        from: fromDate,
                        to: toDate,
                        processNameKeyword: processName,
                        page: 1,
                        pageSize: 200,
                    }),
                    elasticIndices.processExecutions,
                    selectedOrg.info.id,
                    indexInfo.major_version
                );

                if (!result || !result.hits?.hits?.length) {
                    console.error("No process executions found for:", processName);
                    setChartData({ x: [], memoryUsage: [], cpuUsage: [], processingTimestamp: [], processName: "", processId: [] });
                    return;
                }

                const executions = parseFetchProcessExecutionsResponse(result as any);
                setChartData({
                    x: executions.map((e) => new Date(e.timestamp)),
                    memoryUsage: executions.map((e) => e.memory_megabytes),
                    cpuUsage: executions.map((e) => e.cpu_usage),
                    processName,
                    processId: executions.map((e) => e.process_id),
                    processingTimestamp: executions.map((e) => e.processing_timestamp),
                });
            } finally {
                setIsFetchingExecutions(false);
            }
        };

        fetch();
    }, [processName, device, fromDate, toDate, selectedOrg]);

    const fetchProcessTree = async (
        processId: string,
        deviceId: string,
        processingTimestamp: string
    ) => {
        if (!deviceId || !processingTimestamp) return;
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const indexInfo = selectedOrg.resource.indices.find(
            (x) => x.name === elasticIndices.processTree
        );
        if (!indexInfo) return;

        setIsFetchingProcessTree(true);
        try {
            const result = await elasticsearchService.search<fetchProcessTreeResponse>(
                fetchProcessTreeQuery(deviceId, processingTimestamp),
                elasticIndices.processTree,
                selectedOrg.info.id,
                indexInfo.major_version
            );
            if (!result || !result.hits?.hits?.length) {
                console.error("No process tree data found for:", { processId, deviceId, processingTimestamp });
                setProcessTreeData([]);
                return;
            }
            const processTree = mapProcessTreeResponse(result as any);
            setProcessTreeData(processTree);
            setProcessTreeHighlightPid(processId);
        } catch (error) {
            console.error("Error fetching process tree:", error);
            setProcessTreeData([]);
        } finally {
            setIsFetchingProcessTree(false);
        }
    };

    const handleDataPointClick = (datapointId: string) => {
        if (!chartData || isFetchingProcessTree) return;
        const index = chartData.processId.findIndex((id) => id === datapointId);
        if (index !== -1) {
            fetchProcessTree(
                chartData.processId[index],
                device,
                chartData.processingTimestamp[index]
            );
        }
    };

    return (
        <SidePanel
            title={`Process Execution Details${processName ? ` — ${processName}` : ""}`}
            isDisplayed={!!processName}
            onClose={onClose}
        >
            {processName ? (
                <div className="card p-4 flex flex-col gap-2">
                    {isFetchingExecutions ? (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            Loading executions for <strong>{processName}</strong>…
                        </p>
                    ) : null}

                    {!isFetchingExecutions && chartData && chartData.x.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            No execution records found for <strong>{processName}</strong> in the
                            selected time range.
                        </p>
                    ) : null}

                    {!isFetchingExecutions && chartData && chartData.x.length > 0 && (
                        <LineChart
                            title={`Memory Usage over Time — ${processName}`}
                            data={[
                                {
                                    label: chartData.processName,
                                    x: chartData.x,
                                    y: chartData.memoryUsage,
                                    dataPointId: chartData.processId,
                                },
                            ]}
                            xAxisTitle="Time"
                            yAxisTitle="Memory (MB)"
                            timeSeriesUnit="hour"
                            onDataPointClick={handleDataPointClick}
                        />
                    )}

                    {!isFetchingExecutions && chartData && chartData.x.length > 0 && (
                        <LineChart
                            title={`CPU Usage over Time — ${processName}`}
                            data={[
                                {
                                    label: chartData.processName,
                                    x: chartData.x,
                                    dataPointId: chartData.processId,
                                    y: chartData.cpuUsage,
                                },
                            ]}
                            xAxisTitle="Time"
                            yAxisTitle="CPU (%)"
                            timeSeriesUnit="hour"
                            onDataPointClick={handleDataPointClick}
                        />
                    )}

                    {!isFetchingProcessTree && processTreeData && processTreeData.length > 0 && (
                        <ProcessTreeDiagram
                            deviceId={device}
                            processId={processTreeHighlightPid || ""}
                            processes={processTreeData}
                        />
                    )}
                </div>
            ) : null}
        </SidePanel>
    );
};

export default ProcessExecutionDetail;
