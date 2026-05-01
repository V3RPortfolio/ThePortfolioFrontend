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

import type { ElasticSearchResponse } from "../../../../interfaces/elasticsearch.interface";
import type { RunningDeviceStatsInfo } from "../../../../interfaces/metricsOverview.interface";

export interface FetchRunningDevicesStatsParams {
    deviceId: string;
    from?: string;     // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to?: string;       // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
    page: number;     // 1-based page index
    pageSize: number; // number of processes per page,
    order_by: "avg_memory_megabytes" | "avg_cpu_consumption" | "avg_memory_consumption" | "avg_memory_leak"; // field to sort by
    fields?: string[]; // optional list of additional fields to include in the response
    filters?: any[];
}

export const buildFetchRunningDevicesStatsQuery = ({
    deviceId,
    from,
    to,
    page,
    pageSize,
    order_by,
    fields,
    filters
}: FetchRunningDevicesStatsParams) => {
    if(!!fields && !fields.includes(order_by)) {
        fields.push(order_by);
    } else if(!fields) {
        fields = [
            "process_name",
            order_by,
            "processing_timestamp"
        ];
    }
    const query:any = {
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
                    ...(filters || [])
                ]
            }
        },
        "sort": [
            {
                [order_by]: {
                    "order": "desc"
                }
            }
        ],
        "_source": fields
    };
    if(from || to) {
        const rangeData:any = {
            "range": {
                "processing_timestamp": {
                }
            }
        };
        if(from) {
            rangeData["range"]["processing_timestamp"]["gte"] = from;
        }
        if(to) {
            rangeData["range"]["processing_timestamp"]["lte"] = to;
        }
        query["query"]["bool"]["filter"].push(rangeData);
    }
    return query;
};

export interface FetchRunningDevicesStatsResult {
    items: RunningDeviceStatsInfo[];
    /** Total number of matching documents (from hits.total.value) */
    total: number;
}

export const parseFetchRunningDevicesStatsResponse = (
    response: ElasticSearchResponse<RunningDeviceStatsInfo>
): FetchRunningDevicesStatsResult => {
    if (
        !response ||
        !response.hits ||
        !Array.isArray(response.hits.hits)
    ) {
        console.error("Invalid response format for buildFetchRunningDevicesStatsQuery:", response);
        return { items: [], total: 0 };
    }

    const items = response.hits.hits
        .filter((h) => h && h._source)
        .map((h) => ({
            process_name: h._source.process_name,
            avg_memory_megabytes: h._source.avg_memory_megabytes ?? 0,
            deviation_memory_consumption_megabytes: h._source.deviation_memory_consumption_megabytes ?? 0,

            avg_cpu_consumption: h._source.avg_cpu_consumption ?? 0,
            deviation_cpu_consumption: h._source.deviation_cpu_consumption ?? 0,

            avg_memory_consumption: h._source.avg_memory_consumption ?? 0,
            deviation_memory_consumption: h._source.deviation_memory_consumption ?? 0,

            avg_memory_leak: h._source.avg_memory_leak ?? 0,
            deviation_memory_leak: h._source.deviation_memory_leak ?? 0,
            
            processing_timestamp: h._source.processing_timestamp ?? ""
        }));

    return {
        items,
        total: response.hits.total?.value ?? items.length
    };
};

