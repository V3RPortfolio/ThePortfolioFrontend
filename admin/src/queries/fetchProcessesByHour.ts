/**
 * Elasticsearch DSL Query: Group processes by hour and find the average memory usage for each process within 
 * each time bucket. The query filters the data based on device_id and a specified time range.
 *
 * Index: process_executions
 * URL Path: /process_executions/_search
 * Method: POST
 * Response:
 * {
 *  "aggregations": {
        "usage_per_hour": {
            "buckets": [
                {
                    "key_as_string": "2026-04-02T10:00:00.000Z",
                    "key": 1775124000000,
                    "doc_count": 2601,
                    "group_by_process": {
                        "doc_count_error_upper_bound": 0,
                        "sum_other_doc_count": 2241,
                        "buckets": [
                            {
                                "key": "nginx:",
                                "doc_count": 114,
                                "avg_usage": {
                                "value": 0
                                }
                            },
                            {
                                "key": "/opt/google/chrome/chrome",
                                "doc_count": 92,
                                "avg_usage": {
                                "value": 1.040217387125544
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
}
 */

export interface FetchProcessByHourParams {
    deviceId: string;
    from: string;     // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;       // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
    sortField: string; // Optional field to sort by, e.g. "avg_memory_usage"
    sortOrder: "asc" | "desc"; // Optional sort order, either "asc" or "desc"
}

export const buildFetchProcessesByHourQuery = ({ 
    deviceId, 
    from, 
    to, 
    sortField,
    sortOrder 
}: FetchProcessByHourParams) => ({
    "size": 0,
    "query": {
        "bool": {
            "filter": [
                {
                    "term": {
                        "device_id": deviceId
                    }
                },
                {
                    "range": {
                        "timestamp": {
                            "gte": from,
                            "lte": to
                        }
                    }
                },
                {
                    "exists": {
                       "field": sortField
                    }
                },
                {
                    "range": {
                        [sortField]: {
                            "gt": 0
                        }
                    }
                }
            ]
        }
    },
    "aggs": {
        "usage_per_hour": {
            "date_histogram": {
                "field": "timestamp",
                "calendar_interval": "hour"
            },
            "aggs": {
                "group_by_process": {
                    "terms": {
                        "field": "process_name",
                        "size": 1000,
                        "order": {
                            "avg_usage": sortOrder
                        }
                    },
                    "aggs": {
                        "avg_usage": {
                            "max": {
                                "field": sortField
                            }
                        }
                    }
                },
            }

        }
    }
});

/**
 * Parsed/usable model for the UI.
 */
export interface ProcessesByHour {
    /** epoch millis for the hour bucket */
    timestamp: Date;
    process_name: string;
    avg_usage: number;
}

/**
 * Raw Elasticsearch response interfaces.
 * Some clients return aggregations under `aggregations`, others may unwrap it.
 */
export interface FetchProcessesByHourResponse {
    usage_per_hour?: MemoryUsagePerHourAgg;
}

export interface MemoryUsagePerHourAgg {
    buckets: MemoryUsagePerHourBucket[];
}

export interface MemoryUsagePerHourBucket {
    key_as_string: string;
    key: number;
    doc_count: number;
    group_by_process?: {
        buckets: Array<{
            key: string;
            doc_count: number;
            avg_usage?: { value: number | null };
        }>;
    };
}

export const parseFetchProcessesByHourResponse = (
    response: FetchProcessesByHourResponse
): ProcessesByHour[] => {
    if (typeof response !== "object" || response === null) {
        console.error("Invalid response format for fetchProcessesByHour:", response);
        return [];
    }

    const agg = response.usage_per_hour;

    if (!agg || !Array.isArray(agg.buckets)) {
        console.error("Missing/invalid usage_per_hour buckets:", response);
        return [];
    }

    const data = agg.buckets
        .filter((b: any) => b && typeof b === "object")
        .map((b: any) => {
            const processBuckets = Array.isArray(b.group_by_process?.buckets)
                ? b.group_by_process.buckets
                : [];

            return processBuckets
                .map((pb: any) => ({
                    process_name: pb.key,
                    avg_usage:
                        typeof pb.avg_usage?.value === "number"
                            ? pb.avg_usage.value
                            : 0,
                    timestamp: new Date(b.key)
                } as ProcessesByHour));
        }).flat();
    return data;
};