import React, { useCallback, useEffect, useState } from "react";
import ProbabilityDistributionChart from "../../components/Charts/ProbabilityDistributionChart";
// import TimeRange from "../components/Filters/TimeRange";
import elasticsearchService from "../../services/elasticsearch.service";
import { fetchTotalUniqueDevicesQuery, fetchUniqueDevicesQuery, parseFetchTotalUniqueDevicesResponse, parseFetchUniqueDevicesResponse, type FetchTotalUniqueDevicesResponse, type FetchUniqueDevicesResponse } from "../../queries/fetchUniqueDevices";
import { elasticIndices } from "../../constants";
import { fetchDistributionDataQuery, parseFetchDistributionDataResponse, type DistributionInfo, type fetchDistributionDataResponse } from "../../queries/fetchDistributionData";
import Dropdown from "../../components/Filters/Dropdown";
import { ChevronDown, ChevronUp } from "lucide-react";
import TimeRange from "../../components/Filters/TimeRange";
import { buildFetchDeviceMetricsQuery, parseFetchDeviceMetricsResponse, type FetchDeviceMetricsAggregationResponse } from "../../queries/fetchDeviceMetrics";
import LineChart from "../../components/Charts/LineChart";
import { useOrganization } from "../../contexts/organization.context";


const DeviceInformationPage:React.FC = () => {
    const { selectedOrg } = useOrganization();

    const today = new Date();

    // const [fromDate, setFromDate] = useState(past24Hours.toISOString());
    // const [toDate, setToDate] = useState(today.toISOString());

    /* UI State Management */
    const [showDistribution, setShowDistribution] = useState(true);
    const [showUptime, setShowUptime] = useState(true);

    /* Metrics State Management */
    const availableMetrics:Record<string, {field: string, label: string}> = {
        cpuUsage: { field: "avg_cpu_consumption", label: "Average CPU Usage (%)" },
        memoryUsage: { field: "avg_memory_consumption", label: "Average Memory Usage (%)" },
        memoryMB: { field: "avg_memory_megabytes", label: "Average Memory Usage (MB)" },
    }
    const timeSeriesViewUnits:Record<string, {label: string, value: string}> = {
        hour: { label: "Hour", value: "hour" },
        day: { label: "Day", value: "day" },
        week: { label: "Week", value: "week" },
        month: { label: "Month", value: "month" },
        year: { label: "Year", value: "year" },
    };

    const [devices, setDevices] = useState<string[]>([]);
    const [isFetchingDevices, setIsFetchingDevices] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState(availableMetrics.memoryUsage);

    const [deviceMetrics, setDeviceMetrics] = useState<{device: string, distribution: DistributionInfo[]}[]>([]);
    const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);  


    const [uptimeDateStart, setUptimeDateStart] = useState(new Date(today.getTime() - 72 * 60 * 60 * 1000).toISOString());
    const [uptimeDateEnd, setUptimeDateEnd] = useState(today.toISOString());
    const [uptimeBinCategory, setUptimeBinCategory] = useState<string>(timeSeriesViewUnits.hour.value);

    const [uptimeData, setUptimeData] = useState<{device: string, metrics: {timestamp: string, entries: number}[]}[]>([]); // Replace 'any' with your actual data type
    const [isFetchingUptime, setIsFetchingUptime] = useState(false);


    const updateDevices = async (newDevices: string[]) => {
        setDevices(Array.from(new Set([...devices, ...newDevices])))
    }

    const clearDevices = () => {        
        setDevices([]);
    }

    /* Elasticsearch Data Processing */
    const fetchUniqueDevices = async () => {
        console.log(selectedOrg, isFetchingDevices)
        if (!selectedOrg || !selectedOrg.resource?.indices) return;
        const ioIndexInfo = selectedOrg.resource.indices.find(x => x.name === elasticIndices.runningProcesses);
        if (!ioIndexInfo) return;
        if(isFetchingDevices) return;
        setIsFetchingDevices(true);
        clearDevices();
        const deviceIndex = elasticIndices.runningProcesses;
        const response = await elasticsearchService.aggregate<null, FetchTotalUniqueDevicesResponse>(
            fetchTotalUniqueDevicesQuery(),
            deviceIndex,
            selectedOrg.info.id,
            ioIndexInfo.major_version
        );
        if(!response || !response.aggregations) {
            console.error("Failed to fetch total unique devices:", response);
            setIsFetchingDevices(false);
            return;
        }
        const totalDevices = parseFetchTotalUniqueDevicesResponse(response.aggregations) || 0;
        if(totalDevices == 0) {
            setIsFetchingDevices(false);
            return; 
        }
        const pageSize = 1000;
        const totalPartitions = Math.ceil(totalDevices / pageSize);
        try {
            for (let partition = 0; partition < totalPartitions; partition++) {
                const result = await elasticsearchService.aggregate<null, FetchUniqueDevicesResponse>(
                    fetchUniqueDevicesQuery(partition, totalPartitions),
                    elasticIndices.runningProcesses,
                    selectedOrg.info.id,
                    ioIndexInfo.major_version
                );

                if (!result?.aggregations) {
                    console.error("Failed to fetch unique devices:", result);
                    break;
                }

                const partitionDevices = parseFetchUniqueDevicesResponse(result.aggregations);
                if(!partitionDevices?.length) {
                    break; // Exit early if no devices found in this partition, assuming we've covered all devices
                }
                updateDevices(partitionDevices);
            }
        } finally {
            setIsFetchingDevices(false);
        }
    };

    const fetchDistribution = useCallback(async () => {
        if(!devices.length || !selectedMetric.field || isFetchingMetrics) return [];
        if (!selectedOrg || !selectedOrg.resource?.indices) return [];
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.runningProcesses);
        if (!indexInfo) return [];
        const distributions:{device: string, distribution: DistributionInfo[]}[] = [];
        setIsFetchingMetrics(true);
        for (let device of devices) {
            const result = await elasticsearchService.aggregate<null, fetchDistributionDataResponse>(
                fetchDistributionDataQuery(device, selectedMetric.field),
                elasticIndices.runningProcesses,
                selectedOrg.info.id,
                indexInfo.major_version
            );
            if(!result || !result.aggregations) {
                console.error("Failed to fetch distribution data:", result);
                continue;
            }
            const distributionData = parseFetchDistributionDataResponse(selectedMetric.field, result);
            distributions.push({ device, distribution: distributionData.filter(x => x.metric_value != undefined) });
        }
        setIsFetchingMetrics(false);
        return distributions
    }, [devices, selectedMetric, selectedOrg]);


    const fetchDeviceMetrics = useCallback(async () => {
        if(!devices.length || !uptimeDateStart || !uptimeDateEnd || isFetchingUptime) return [];
        if (!selectedOrg || !selectedOrg.resource?.indices) return [];
        const indexInfo = selectedOrg.resource?.indices.find(x => x.name === elasticIndices.deviceMetrics);
        if (!indexInfo) return [];
        setIsFetchingUptime(true);
        const uptimeResults:{device: string, metrics: {timestamp: string, entries: number}[]}[] = [];

        const fetchUnit = uptimeBinCategory == "hour" ? "minute" :
                        uptimeBinCategory == "day" ? "hour" :   
                        uptimeBinCategory == "week" ? "day" :
                        uptimeBinCategory == "month" ? "day" :
                        uptimeBinCategory == "year" ? "month" : "hour";

        const substringIndex = uptimeBinCategory === "minute" ? 16 :
                                uptimeBinCategory === "hour" ? 13 :
                                uptimeBinCategory === "day" ? 10 :
                                uptimeBinCategory === "week" ? 10 :
                                uptimeBinCategory === "month" ? 7 :
                                uptimeBinCategory === "year" ? 4 : 13;

        for(let device of devices) {
            const response = await elasticsearchService.aggregate<null, FetchDeviceMetricsAggregationResponse>(
                buildFetchDeviceMetricsQuery({
                    deviceId: device,
                    from: uptimeDateStart,
                    to: uptimeDateEnd,
                    unit: fetchUnit as "minute" | "hour" | "day" | "week" | "month" | "year"
                }),
                elasticIndices.deviceMetrics,
                selectedOrg.info.id,
                indexInfo.major_version
            );
            if(!response || !response.aggregations) {
                console.error("Failed to fetch device metrics:", response);
                continue;
            }
            const data = await parseFetchDeviceMetricsResponse(response.aggregations);
            
            // Group timestamp by hour and count entries
            const metricsMap:Record<string, number> = {};
            if(!data?.length) {
                uptimeResults.push({ device, metrics: [] });
                continue;
            }
            for(let hit of data) {
                const hourKey = hit.processing_timestamp.substring(0, substringIndex); // Group by hour
                if (metricsMap[hourKey] == undefined) {
                    metricsMap[hourKey] = 0;
                } else {
                    metricsMap[hourKey] += 1;
                }
            }
            uptimeResults.push({ 
                device, 
                metrics: Object.entries(metricsMap).map(([hour, entries]) => ({
                    timestamp: hour + ":00:00Z",
                    entries
                })).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) // Sort by timestamp 
            });
        }
        setIsFetchingUptime(false);
        return uptimeResults;
    }, [devices, uptimeDateStart, uptimeDateEnd, selectedOrg]);

    /* Component Specific Functions */

    useEffect(() => {
        fetchUniqueDevices();
    }, [selectedOrg]);

    useEffect(() => {
        fetchDistribution().then(distributions => {
            setDeviceMetrics(distributions);
        });
    }, [devices, selectedMetric, selectedOrg]);

    useEffect(() => {
        fetchDeviceMetrics().then(uptimeResults => {
            setUptimeData(uptimeResults);
        });
    }, [devices, uptimeDateStart, uptimeDateEnd, selectedOrg]);

    return <div className="p-6 flex flex-col gap-6">
        <div className="distribution-container">
            <div className="flex flex-row justify-between p-6 bg-[var(--color-background)] mb-6 distribution-header">
                <h4 className="text text-title">Device Metrics Distribution</h4>
                {showDistribution ?
                    <ChevronDown size={24} className="cursor-pointer" onClick={() => {setShowDistribution(false)}} />
                    : <ChevronUp size={24} className="cursor-pointer" onClick={() => {setShowDistribution(true)}} />
                }
            </div>
            {showDistribution && (<div className="flex flex-col">
                <div className="flex flex-row flex-wrap flex-start gap-4 distribution-filters">
                    <Dropdown 
                        label="Select Metric"
                        items={Object.values(availableMetrics).map(metric => ({name: metric.label, value: metric.field}))}
                        value={selectedMetric.field}
                        handler={(value) => {
                            const metric = Object.values(availableMetrics).find(m => m.field === value);
                            if (metric) setSelectedMetric(metric);
                        }}
                        className="w-auto"
                    />
                </div>
                {deviceMetrics && (<ProbabilityDistributionChart 
                    title="Metric Distribution Chart Across Devices"
                    data={deviceMetrics.map(({device, distribution}) => ({
                        label: device,
                        values: distribution.map(m => m.metric_value),
                        dataPointId: distribution.map(m => `${m.process_name}__${m.processing_timestamp}`)
                    }))}
                    xAxisTitle="Metric Value"
                    yAxisTitle="Frequency"
                />)}
            </div>)}
        </div>

        <div className="uptime-container">
            <div className="flex flex-row justify-between p-6 bg-[var(--color-background)] mb-6 distribution-header">
                <h4 className="text text-title">Device Uptime Statistics</h4>
                {showUptime ?
                    <ChevronDown size={24} className="cursor-pointer" onClick={() => {setShowUptime(false)}} />
                    : <ChevronUp size={24} className="cursor-pointer" onClick={() => {setShowUptime(true)}} />
                }
            </div>
            {showUptime && <div className="flex flex-col">
                <div className="flex flex-row flex-wrap flex-start gap-4 uptime-filters">
                    <TimeRange 
                        label="Select Time Range"
                        from={uptimeDateStart}
                        to={uptimeDateEnd}
                        handler={({from, to}) => {
                            if (from) setUptimeDateStart(from);
                            if (to) setUptimeDateEnd(to);
                        }}
                        className="w-full md:w-auto"
                    />
                    <Dropdown 
                    
                        label="View Chart By"
                        items={
                            Object.values(timeSeriesViewUnits).map(
                                unit => ({name: unit.label, value: unit.value})
                            )}
                        className="w-full lg:w-auto"
                        handler={(value:string) => { 
                            if(Object.values(timeSeriesViewUnits).find(unit => unit.value === value)) {
                                setUptimeBinCategory(value);
                            }
                         }}
                        value={uptimeBinCategory}
                    />
                </div>
                {uptimeData && (<LineChart 
                    title="Device Uptime Over Time"
                    data={uptimeData.map(({device, metrics}) => ({
                        label: device,
                        y: metrics.map(m => m.entries),
                        x: metrics.map(m => new Date(m.timestamp)),
                        dataPointId: metrics.map(m => m.timestamp)
                    }))}
                    xAxisTitle="Time"
                    yAxisTitle="Uptime"
                    timeSeriesUnit={uptimeBinCategory as "hour" | "day" | "week" | "month" | "year"}
                />)}
            </div>}
        </div>
    </div>;
}

export default DeviceInformationPage;