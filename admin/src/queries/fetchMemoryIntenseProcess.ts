/**
 * Elasticsearch DSL Query: Fetch the most memory-intensive processes from the running_processes index.
 * The running_processes index stores one pre-aggregated document per process per device,
 * so no terms aggregation is needed. Documents are filtered by device_id and timestamp range,
 * then sorted by avg_memory_megabytes descending and paginated with from/size.
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
 *           "avg_memory_megabytes": 3072.0,
 *           "deviation_memory_consumption": 12.5,
 *           "avg_cpu_consumption": 18.3
 *         }
 *       }
 *     ]
 *   }
 * }
 */

import type { ElasticSearchResponse } from "../interfaces/elasticsearch.interface";

export interface FetchMemoryIntenseProcessParams {
    deviceId: string;
    from: string;     // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;       // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
    page: number;     // 1-based page index
    pageSize: number; // number of processes per page
}

export const buildFetchMemoryIntenseProcessQuery = ({
    deviceId,
    from,
    to,
    page,
    pageSize
}: FetchMemoryIntenseProcessParams) => ({
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
                        "processing_timestamp": {
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
            "avg_memory_megabytes": {
                "order": "desc"
            }
        }
    ],
    "_source": [
        "process_name",
        "avg_memory_megabytes",
        "deviation_memory_consumption",
        "avg_cpu_consumption",
        "processing_timestamp"
    ]
});

export interface MemoryIntenseProcess {
    process_name: string;
    /** Pre-aggregated average memory consumption in megabytes */
    avg_memory_megabytes: number;
    /** Average deviation of memory consumption from the mean (percentage) */
    deviation_memory_consumption: number;
    /** Pre-aggregated average CPU usage percentage */
    avg_cpu_consumption: number;
    processing_timestamp: string; // ISO 8601 date string
}

export interface FetchMemoryIntenseProcessResult {
    items: MemoryIntenseProcess[];
    /** Total number of matching documents (from hits.total.value) */
    total: number;
}

export const parseFetchMemoryIntenseProcessResponse = (
    response: ElasticSearchResponse<MemoryIntenseProcess>
): FetchMemoryIntenseProcessResult => {
    if (
        !response ||
        !response.hits ||
        !Array.isArray(response.hits.hits)
    ) {
        console.error("Invalid response format for buildFetchMemoryIntenseProcessQuery:", response);
        return { items: [], total: 0 };
    }

    const items = response.hits.hits
        .filter((h) => h && h._source)
        .map((h) => ({
            process_name: h._source.process_name,
            avg_memory_megabytes: h._source.avg_memory_megabytes ?? 0,
            deviation_memory_consumption: h._source.deviation_memory_consumption ?? 0,
            avg_cpu_consumption: h._source.avg_cpu_consumption ?? 0,
            processing_timestamp: h._source.processing_timestamp ?? ""
        }));

    return {
        items,
        total: response.hits.total?.value ?? items.length
    };
};

