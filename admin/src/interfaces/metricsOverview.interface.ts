export interface ProcessTreeInfo {
    timestamp: string;
    processing_timestamp: string;
    device_id: string;
    pid: string;
    parent_pid?: string|null;
    process_name: string;
}

export interface DistributionInfo {
    process_name: string;
    metric_value: number;
    processing_timestamp: string;
}

export interface IoDeviceBucket {
    key: string;
    doc_count: number;
}

export interface DeviceMetricsInfo {
    cpu_usage: number;
    memory_usage: number;
    memory_megabytes: number;
    processing_timestamp: string;
}

export interface RunningDeviceStatsInfo {
    process_name: string;
    /** Pre-aggregated average memory consumption in megabytes */
    avg_memory_megabytes?: number;
    /** Average deviation of memory consumption from the mean (percentage) */
    deviation_memory_consumption_megabytes?: number;
    /** Pre-aggregated average CPU usage percentage */
    avg_cpu_consumption?: number;
    deviation_cpu_consumption?: number;

    avg_memory_consumption?: number;
    deviation_memory_consumption?: number;

    avg_memory_leak?: number;
    deviation_memory_leak?: number;

    processing_timestamp: string; // ISO 8601 date string
}

export interface ProcessExecutionProcess {
    _id: string;
    process_name: string;
    device_id: string;
    memory_megabytes: number;
    cpu_usage: number;
    memory_usage: number;
    timestamp: string; // ISO 8601 date string
    processing_status: string;
    process_id: string;
    processing_timestamp: string; // ISO 8601 date string
}