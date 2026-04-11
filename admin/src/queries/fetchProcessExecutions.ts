/**
 * Elasticsearch DSL Query: Fetch process execution metrics from the process_executions index filtered 
 * by device_id, timestamp range, and a process name keyword. Results are sorted by timestamp descending and paginated with from/size.
 * URL Path: /process_executions/_search
 * Method: POST
 * Response:
 * {
 *   "hits": {
 *     "total": { "value": 100, "relation": "eq" },
 *     "hits": [
 *       "_index": "process_executions",
 *      "_id": "qQc6dp0BviHFpZbXUgrp",
 *      "_score": null,
 *      "_source": {
 *        "executed_by": "itachi",
 *        "processed_timestamp": "2026-04-10T14:18:41.201469+00:00",
 *        "memory_megabytes": 9268.515625,
 *        "device_id": "ryzen-desktop",
 *        "process_name": "/usr/bin/qemu-system-x86_64",
 *        "memory_usage": 28.9,
 *        "processing_status": "pending",
 *        "cpu_usage": 11.3,
 *        "timestamp": "2026-04-10T07:10:18.916257+00:00"
 *      },
 *     ]
 *   }
 * }
 */

import type { ElasticSearchResponse } from "../interfaces/elasticsearch.interface";

export interface FetchProcessExecutionsParams {
    deviceId: string;
    from: string;     // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;       // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
    processNameKeyword: string; // keyword to match in process_name
    page: number;     // 1-based page index
    pageSize: number; // number of executions per page
}

export const buildFetchProcessExecutionsQuery = ({
    deviceId,
    from,
    to,
    processNameKeyword,
    page,
    pageSize
}: FetchProcessExecutionsParams) => {
    return {
        "size": pageSize,
        "from": (page - 1) * pageSize,
        "query": {
            "bool": {
            "must": [
                {"range": {"processing_timestamp": {"gte": from, "lte": to}}},
                {"match": {"process_name": processNameKeyword}},
                {"match": {"device_id": deviceId}}
            ]
            }
        },
        "sort": [
            {"timestamp": {"order": "desc"}}
        ],
        "_source": [
            "process_name",
            "device_id",
            "memory_megabytes",
            "cpu_usage",
            "memory_usage",
            "timestamp",
            "processing_status",
            "process_id",
            "processing_timestamp"
        ]
    }
};

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

export interface FetchProcessExecutionsResponse extends ElasticSearchResponse<ProcessExecutionProcess> {

}   

export const parseFetchProcessExecutionsResponse = (response: FetchProcessExecutionsResponse) => {
    return response.hits.hits.map(hit => ({...hit._source, _id: hit._id}));
}