/**
 * Elasticsearch DSL Query: Fetch the process tree with parent-child relationships.
 * URL Path: /_search
 * Method: POST
 * Response Body:
 * {
    "aggregations": {
    "hits": {
        "total": {
        "value": 1132,
        "relation": "eq"
        },
        "max_score": null,
        "hits": []
    },
    "aggregations": {
        "processes": {
        "doc_count_error_upper_bound": 0,
        "sum_other_doc_count": 0,
        "buckets": [
            {
                "key": "1",
                "doc_count": 4,
                "doc": {
                    "hits": {
                    "total": {
                        "value": 4,
                        "relation": "eq"
                    },
                    "max_score": 1.0000119,
                    "hits": [
                        {
                        "_index": "process_tree",
                        "_id": "M7YDfJ0B32dVPt5iHxBi",
                        "_score": 1.0000119,
                        "_source": {
                            "timestamp": "2026-04-11T10:07:52.669190+00:00",
                            "processing_timestamp": "2026-04-11T09:52:23.232856",
                            "device_id": "ryzen-desktop",
                            "process_name": "systemd",
                            "pid": "1",
                            "executed_command": "splash"
                        }
                    ]
                }
            }
        ]
    }
 *}
 */

import type { ElasticSearchAggregationResponse } from "../../../../interfaces/elasticsearch.interface";

export const fetchProcessTreeQuery = (
    deviceId:string, 
    processing_timestamp:string
):any => {
    return {
        "query": {
            "bool": {
                "must": [
                    { "match": { "device_id": deviceId } },
                    { "match": { "processing_timestamp": processing_timestamp } }
                ]
            }
        },
        "aggs": {
            "processes": {
                "terms": {
                    "field": "pid",
                    "size": 1000
                },
                "aggs": {
                    "doc": {
                        "top_hits": {
                            "size": 1
                        }
                    }
                }
            }
        }
    }
}

export interface ProcessTreeInfo {
    timestamp: string;
    processing_timestamp: string;
    device_id: string;
    pid: string;
    parent_pid?: string|null;
    process_name: string;
}

export interface fetchProcessTreeResponse extends ElasticSearchAggregationResponse<null, ProcessTreeInfo> {
}

export const mapProcessTreeResponse = (response:fetchProcessTreeResponse): ProcessTreeInfo[] => {
    if(!response || !response.aggregations) {
        return [];
    }

    const aggregations = response.aggregations as any;
    const buckets: any[] = aggregations?.processes?.buckets ?? [];

    return buckets
        .map((bucket: any) => bucket?.doc?.hits?.hits?.[0]?._source)
        .filter((source: any) => source != null) as ProcessTreeInfo[];
}