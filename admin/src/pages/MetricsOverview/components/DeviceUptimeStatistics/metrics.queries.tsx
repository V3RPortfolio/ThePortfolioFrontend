/**
 * Elasticsearch DSL Query: Fetch the latest device metrics from the device_metrics index,
 * filtered by device_id and a timestamp range, sorted by timestamp descending.
 * URL Path: /device_metrics/_search
 * Method: POST
 * Response: Returns the most recent document matching the filters.
 * {
 *  "aggs": {
 *   "metrics_over_time": {
 *      "buckets": [
 *          {
 *              "key_as_string": "2026-04-07T10:00:00Z",
 *             "average_cpu_usage": {
 *                "value": 25.5
 *              },
 *              "average_memory_usage": {
 *                "value": 45.3
 *              },
 *              "average_memory_megabytes": {
 *                "value": 1024.0
 *              }
 *          }
 *      ]
 *   }
 * }
 */

import type { ElasticSearchAggregationResponse } from "../../../../interfaces/elasticsearch.interface";

export interface FetchDeviceMetricsParams {
    deviceId: string;
    from: string; // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;   // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
    unit?: "minute" | "hour" | "day" | "week" | "month" | "year";
}

export const buildFetchDeviceMetricsQuery = ({ deviceId, from, to, unit }: FetchDeviceMetricsParams) => ({
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
                        "processing_timestamp": {
                            "gte": from,
                            "lte": to
                        }
                    }
                }
            ]
        }
    },
    "aggs": {
        "metrics_over_time": {
                "date_histogram": {
                    "field": "processing_timestamp",
                    "calendar_interval": unit || "hour",
                    "format": "yyyy-MM-dd'T'HH:mm:ssZ",
                },
                "aggs": {
                    "average_cpu_usage": {
                        "avg": {
                            "field": "cpu_usage"
                        }
                    },
                    "average_memory_usage": {
                        "avg": {
                            "field": "memory_usage"
                        }
                    },
                    "average_memory_megabytes": {
                        "avg": {
                            "field": "memory_megabytes"
                        }
                    }
                }            
        }
    },
    "_source": [
        "cpu_usage",
        "memory_usage",
        "memory_megabytes",
        "processing_timestamp",
    ]
});

export interface FetchDeviceMetricsResponse {
    cpu_usage: number;
    memory_usage: number;
    memory_megabytes: number;
    processing_timestamp: string;
}

export interface FetchDeviceMetricsAggregationResponse extends ElasticSearchAggregationResponse<null, FetchDeviceMetricsResponse> {
    metrics_over_time: {
        buckets: {
            key_as_string: string; // e.g. "2026-04-07T10:00:00Z"
            key: number; // timestamp in milliseconds
            average_memory_usage: {
                value: number;
            };
            average_memory_megabytes: {
                value: number;
            };
            average_cpu_usage: {
                value: number;
            };
        }[];
    }
}

export const parseFetchDeviceMetricsResponse = (response: FetchDeviceMetricsAggregationResponse): FetchDeviceMetricsResponse[] => {
    if (
        typeof response !== 'object' ||
        !response?.metrics_over_time?.buckets?.length
    ) {
        console.error("Invalid or empty response format for buildFetchFetchDeviceMetricsResponseQuery:", response);
        return [];
    }

    return response.metrics_over_time.buckets.map(bucket => {
        return {
            cpu_usage: bucket.average_cpu_usage.value || 0,
            memory_usage: bucket.average_memory_usage.value || 0,
            memory_megabytes: bucket.average_memory_megabytes.value || 0,
            processing_timestamp: bucket.key_as_string
        }
    });
};
