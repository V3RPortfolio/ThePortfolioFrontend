/**
 * Elasticsearch DSL Query: Fetch the most memory-intensive processes from the process_executions index.
 * Processes are grouped by process_name, ordered by their peak memory_usage descending.
 * The top document (highest memory_usage) is returned for each group as a paginated list.
 * URL Path: /process_executions/_search
 * Method: POST
 * Response:
 * {
 *   "aggregations": {
 *     "processes": {
 *       "buckets": [
 *         {
 *           "key": "my_process",
 *           "doc_count": 250,
 *           "peak_memory_usage": { "value": 92.4 },
 *           "top_hit": {
 *             "hits": {
 *               "hits": [
 *                 {
 *                   "_source": {
 *                     "process_name": "my_process",
 *                     "executed_by": "root",
 *                     "cpu_usage": 18.3,
 *                     "memory_usage": 92.4,
 *                     "memory_megabytes": 3072.0,
 *                     "timestamp": "2026-04-07T10:00:00Z"
 *                   }
 *                 }
 *               ]
 *             }
 *           }
 *         }
 *       ]
 *     }
 *   }
 * }
 */

export interface FetchMemoryIntenseProcessParams {
    deviceId: string;
    from: string;     // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;       // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
    page: number;     // 0-based page index
    pageSize: number; // number of process groups per page
}

export const buildFetchMemoryIntenseProcessQuery = ({
    deviceId,
    from,
    to,
    page,
    pageSize
}: FetchMemoryIntenseProcessParams) => ({
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
                }
            ]
        }
    },
    "aggs": {
        "processes": {
            "terms": {
                "field": "process_name",
                "size": 10000, // large enough to allow bucket_sort to paginate
                "order": {
                    "peak_memory_usage": "desc"
                }
            },
            "aggs": {
                // Used to order the terms buckets by peak memory usage
                "peak_memory_usage": {
                    "max": {
                        "field": "memory_megabytes"
                    }
                },
                // Returns the single document with the highest memory_usage per process
                "top_hit": {
                    "top_hits": {
                        "size": 1,
                        "sort": [
                            {
                                "memory_megabytes": {
                                    "order": "desc"
                                }
                            }
                        ],
                        "_source": [
                            "process_name",
                            "memory_usage",
                            "memory_megabytes",
                            "timestamp"
                        ]
                    }
                },
                // Applies offset-based pagination to the buckets
                "pagination": {
                    "bucket_sort": {
                        "from": (page - 1) * pageSize,
                        "size": pageSize
                    }
                }
            }
        }
    }
});

export interface MemoryIntenseProcess {
    process_name: string;
    memory_usage: number;
    memory_megabytes: number;
    timestamp: string;
}

export interface FetchMemoryIntenseProcessResponse {
    processes: {
        buckets: Array<{
            key: string;
            doc_count: number;
            peak_memory_usage: { value: number };
            top_hit: {
                hits: {
                    hits: Array<{
                        _source: MemoryIntenseProcess;
                    }>;
                };
            };
        }>;
    };
}

export const parseFetchMemoryIntenseProcessResponse = (
    response: FetchMemoryIntenseProcessResponse
): MemoryIntenseProcess[] => {
    if (
        typeof response !== 'object' ||
        !response.processes ||
        !Array.isArray(response.processes.buckets)
    ) {
        console.error("Invalid response format for buildFetchMemoryIntenseProcessQuery:", response);
        return [];
    }

    return response.processes.buckets
        .filter(
            (b: any) =>
                b &&
                typeof b === 'object' &&
                typeof b.key === 'string' &&
                b.top_hit?.hits?.hits?.length > 0 &&
                b.top_hit.hits.hits[0]._source
        )
        .map((b: any) => {
            const source = b.top_hit.hits.hits[0]._source;
            return {
                process_name: source.process_name,
                executed_by: source.executed_by,
                cpu_usage: source.cpu_usage,
                memory_usage: source.memory_usage,
                memory_megabytes: source.memory_megabytes,
                timestamp: source.timestamp
            } as MemoryIntenseProcess;
        });
};
