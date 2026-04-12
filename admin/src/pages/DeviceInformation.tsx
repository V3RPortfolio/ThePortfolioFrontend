import React, { useEffect, useMemo, useState } from "react";
import ProbabilityDistributionChart from "../components/Charts/ProbabilityDistributionChart";
import TimeRange from "../components/Filters/TimeRange";
import elasticsearchService from "../services/elasticsearch.service";
import { fetchUniqueDevicesQuery, parseFetchUniqueDevicesResponse, type FetchUniqueDevicesResponse } from "../queries/fetchUniqueDevices";
import { elasticIndices } from "../constants";
import { fetchDistributionDataQuery, parseFetchDistributionDataResponse, type DistributionInfo, type fetchDistributionDataResponse } from "../queries/fetchDistributionData";
import Dropdown from "../components/Filters/Dropdown";


const DeviceInformationPage:React.FC = () => {
    // const today = new Date();
    // const past24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // const [fromDate, setFromDate] = useState(past24Hours.toISOString());
    // const [toDate, setToDate] = useState(today.toISOString());

    const availableMetrics:Record<string, {field: string, label: string}> = {
        cpuUsage: { field: "avg_cpu_consumption", label: "Average CPU Usage (%)" },
        memoryUsage: { field: "avg_memory_consumption", label: "Average Memory Usage (%)" },
    }
    const [devices, setDevices] = useState<string[]>([]);
    const [selectedMetric, setSelectedMetric] = useState(availableMetrics.memoryUsage);

    const [deviceMetrics, setDeviceMetrics] = useState<{device: string, distribution: DistributionInfo[]}[]>([]);
    const [isFetchingMetrics, setIsFetchingMetrics] = useState(false);  

    /* Elasticsearch Data Processing */
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
        setDevices(devices);
    };

    const fetchDistribution = useMemo(async () => {
        if(isFetchingMetrics) return [];
        const distributions:{device: string, distribution: DistributionInfo[]}[] = [];
        setIsFetchingMetrics(true);
        for (let device of devices) {
            const result = await elasticsearchService.aggregate<null, fetchDistributionDataResponse>(
                fetchDistributionDataQuery(device, selectedMetric.field),
                elasticIndices.runningProcesses
            );
            if(!result || !result.aggregations) {
                console.error("Failed to fetch distribution data:", result);
                return;
            }
            const distributionData = parseFetchDistributionDataResponse(selectedMetric.field, result);
            distributions.push({ device, distribution: distributionData });
        }
        setIsFetchingMetrics(false);
        return distributions
    }, [devices, selectedMetric]);

    /* Component Specific Functions */

    useEffect(() => {
        fetchUniqueDevices();
    }, []);

    useEffect(() => {
        fetchDistribution.then(distributions => {
            if(distributions) {
                setDeviceMetrics(distributions);
            }
        });
    }, [devices, selectedMetric]);

    return <div className="p-6 flex flex-col gap-6">
             <div className="flex flex-row flex-wrap flex-start gap-4 display-unique-device-dropdown">
                <Dropdown 
                    label="Select Metric"
                    items={Object.values(availableMetrics).map(metric => ({name: metric.label, value: metric.field}))}
                    value={selectedMetric.field}
                    handler={(value) => {
                        const metric = Object.values(availableMetrics).find(m => m.field === value);
                        console.log("Selected metric:", metric);
                        if (metric) setSelectedMetric(metric);
                    }}
                />
                 {/* <TimeRange 
                     label="Select Time Range"
                     from={fromDate}
                     to={toDate}
                     handler={({from, to}) => {
                         if (from) setFromDate(from);
                         if (to) setToDate(to);
                     }}
                     className="w-auto"

                 /> */}
             </div>
            {deviceMetrics && <ProbabilityDistributionChart 
                title="Metric Distribution Chart Across Devices"
                data={deviceMetrics.map(({device, distribution}) => ({
                    label: device,
                    values: distribution.map(m => m.metric_value),
                    dataPointId: distribution.map(m => `${m.process_name}__${m.processing_timestamp}`)
                }))}
                xAxisTitle="Metric Value"
                yAxisTitle="Frequency"
            />}
    </div>;
}

export default DeviceInformationPage;