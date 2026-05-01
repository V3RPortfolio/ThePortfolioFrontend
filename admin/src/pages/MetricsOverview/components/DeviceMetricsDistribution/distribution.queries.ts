/**
 * Elasticsearch DSL Query: Fetches processes with highest values given a device id and a range of timestamps.
 * URL Path: /_search
 * Method: POST
 * Body:
 * {
    "took": 243,
    "timed_out": false,
    "_shards": {
        "total": 1,
        "successful": 1,
        "skipped": 0,
        "failed": 0
    },
    "hits": {
        "total": {
        "value": 1376,
        "relation": "eq"
        },
        "max_score": null,
        "hits": []
    },
    "aggregations": {
        "processes": {
        "doc_count_error_upper_bound": 0,
        "sum_other_doc_count": 1276,
        "buckets": [
            {
            "key": "(sd-pam)",
            "doc_count": 1,
            "top": {
                "hits": {
                    "total": {
                        "value": 1,
                        "relation": "eq"
                    },
                    "max_score": null,
                    "hits": [
                        {
                        "_index": "running_processes",
                        "_id": "asus-home-laptop_(sd-pam)",
                        "_score": null,
                        "_source": {
                            "processing_timestamp": "2026-04-08T05:53:43.691036+00:00",
                            "process_name": "(sd-pam)",
                            "avg_memory_megabytes": 1
                        },
                        "sort": [
                            1
                        ]
                        }
                    ]
                }
            }
        ]
    }
   }
 */

import type { ElasticSearchAggregationResponse } from "../../../../interfaces/elasticsearch.interface";
import type { DistributionInfo } from "../../../../interfaces/metricsOverview.interface";

export const fetchDistributionDataQuery = (deviceId:string, metric:string):any => {
    return {
        "size": 0,
        "query": {
            "bool": {
            "filter": [
                {
                    "match": {
                        "device_id": deviceId
                    }
                }
            ]
            }
        },
        "aggs": {
            "processes": {
            "terms": {
                "field": "process_name",
                "size": 100
            },
            "aggs": {
                "top": {
                "top_hits": {
                    "size": 1,
                    "sort": {
                    [metric]: "desc"
                    },
                    "_source": {
                    "includes": [
                        "process_name",
                        metric,
                        "processing_timestamp"
                    ]
                    }
                }
                }
            }
            }
        },
        "sort": {
            [metric]: "desc"
        },
        "_source": [
            "process_name",
            metric,
            "processing_timestamp"
        ]
    }
}

export interface fetchDistributionDataResponse {
    processes: {
        buckets: Array<{
            key: string;
            doc_count: number;
            top: {
                hits: {
                    total: {
                        value: number;
                        relation: string;
                    }; 
                    hits: Array<{
                        _index: string;
                        _id: string;
                        _score: number | null;
                        _source: DistributionInfo
                        sort?: Array<number | string>;
                    }>;
                }
            }
        }>;
    }
}

export const parseFetchDistributionDataResponse = (metric:string, response: ElasticSearchAggregationResponse<null, fetchDistributionDataResponse>):DistributionInfo[] => {
    const buckets = response?.aggregations?.processes?.buckets ?? [];

    return buckets.map(bucket => {
        if(!bucket?.top?.hits?.hits || bucket.top.hits.hits.length === 0) {
            console.warn(`No hits found for process ${bucket.key}`);
            return null;
        }
        const topHit = bucket.top.hits.hits[0];
        return {
            process_name: topHit._source.process_name,
            metric_value: topHit._source[metric as keyof DistributionInfo] as number,
            processing_timestamp: topHit._source.processing_timestamp
        };
    }).filter((item): item is DistributionInfo => item !== null);
}