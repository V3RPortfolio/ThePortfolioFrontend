/**
 * Elasticsearch DSL Query: Fetch processes with memory leak metrics from the running_processes index.
 * Each document in running_processes holds pre-aggregated metrics per process per device.
 * Documents are filtered by device_id and timestamp range, sorted by avg_memory_leak descending,
 * and paginated with from/size.
 * URL Path: /running_processes/_search
 * Method: POST
 * Response:
 * {
 *   "hits": {
 *     "total": { "value": 100, "relation": "eq" },
 *     "hits": [
 *       {
 *         "_source": {
 *           "process_name": "my_process",
 *           "avg_memory_leak": 512.0,
 *           "deviation_memory_leak": 24.3
 *         }
 *       }
 *     ]
 *   }
 * }
 */

import type { ElasticSearchResponse } from "../interfaces/elasticsearch.interface";

export interface FetchMemoryLeakProcessesParams {
    deviceId: string;
    from: string;     // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;       // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
    page: number;     // 1-based page index
    pageSize: number; // number of processes per page
}

export const buildFetchMemoryLeakProcessesQuery = ({
    deviceId,
    from,
    to,
    page,
    pageSize
}: FetchMemoryLeakProcessesParams) => ({
    "size": pageSize,
    "from": (page - 1) * pageSize,
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
    "sort": [
        {
            "avg_memory_leak": {
                "order": "desc"
            }
        }
    ],
    "_source": [
        "process_name",
        "avg_memory_leak",
        "deviation_memory_leak"
    ]
});

export interface MemoryLeakProcess {
    process_name: string;
    /** Pre-aggregated average memory leak in megabytes */
    avg_memory_leak: number;
    /** Average deviation of memory leak from the mean */
    deviation_memory_leak: number;
}

export interface FetchMemoryLeakProcessesResult {
    items: MemoryLeakProcess[];
    /** Total number of matching documents (from hits.total.value) */
    total: number;
}

export const parseFetchMemoryLeakProcessesResponse = (
    response: ElasticSearchResponse<MemoryLeakProcess>
): FetchMemoryLeakProcessesResult => {
    if (
        !response ||
        !response.hits ||
        !Array.isArray(response.hits.hits)
    ) {
        console.error("Invalid response format for buildFetchMemoryLeakProcessesQuery:", response);
        return { items: [], total: 0 };
    }

    const items = response.hits.hits
        .filter((h) => h && h._source)
        .map((h) => ({
            process_name: h._source.process_name,
            avg_memory_leak: h._source.avg_memory_leak ?? 0,
            deviation_memory_leak: h._source.deviation_memory_leak ?? 0
        }));

    return {
        items,
        total: response.hits.total?.value ?? items.length
    };
};