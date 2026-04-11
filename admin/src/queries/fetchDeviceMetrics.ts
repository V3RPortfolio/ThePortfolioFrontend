/**
 * Elasticsearch DSL Query: Fetch the latest device metrics from the process_executions index,
 * filtered by device_id and a timestamp range, sorted by timestamp descending.
 * URL Path: /process_executions/_search
 * Method: POST
 * Response: Returns the most recent document matching the filters.
 * {
 *   "hits": {
 *     "total": { "value": 1, "relation": "eq" },
 *     "hits": [
 *       {
 *         "_source": {
 *           "device_id": "device-abc-123",
 *           "process_name": "my_process",
 *           "executed_by": "root",
 *           "cpu_usage": 12.5,
 *           "memory_usage": 45.3,
 *           "memory_megabytes": 1024.0,
 *           "timestamp": "2026-04-07T10:00:00Z"
 *         }
 *       }
 *     ]
 *   }
 * }
 */

import type { ElasticSearchResponse } from "../interfaces/elasticsearch.interface";

export interface FetchDeviceMetricsParams {
    deviceId: string;
    from: string; // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;   // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
}

export const buildFetchDeviceMetricsQuery = ({ deviceId, from, to }: FetchDeviceMetricsParams) => ({
    "size": 1,
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
            "timestamp": {
                "order": "desc"
            }
        }
    ],
    "_source": [
        "device_id",
        "process_name",
        "executed_by",
        "cpu_usage",
        "memory_usage",
        "memory_megabytes",
        "timestamp"
    ]
});

export interface FetchDeviceMetricsResponse {
    device_id: string;
    process_name: string;
    executed_by: string;
    cpu_usage: number;
    memory_usage: number;
    memory_megabytes: number;
    timestamp: string;
}

export const parseFetchDeviceMetricsResponse = (response: ElasticSearchResponse<FetchDeviceMetricsResponse>): FetchDeviceMetricsResponse | null => {
    if (
        typeof response !== 'object' ||
        !response.hits ||
        !Array.isArray(response.hits.hits) ||
        response.hits.hits.length === 0
    ) {
        console.error("Invalid or empty response format for buildFetchFetchDeviceMetricsResponseQuery:", response);
        return null;
    }

    const hit = response.hits.hits[0];

    if (
        !hit._source ||
        typeof hit._source.device_id !== 'string' ||
        typeof hit._source.cpu_usage !== 'number' ||
        typeof hit._source.memory_usage !== 'number' ||
        typeof hit._source.memory_megabytes !== 'number' ||
        typeof hit._source.timestamp !== 'string'
    ) {
        console.error("Unexpected _source shape in fetchFetchDeviceMetricsResponse response:", hit);
        return null;
    }

    return {
        device_id: hit._source.device_id,
        process_name: hit._source.process_name,
        executed_by: hit._source.executed_by,
        cpu_usage: hit._source.cpu_usage,
        memory_usage: hit._source.memory_usage,
        memory_megabytes: hit._source.memory_megabytes,
        timestamp: hit._source.timestamp
    };
};
