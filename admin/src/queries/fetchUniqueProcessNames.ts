/**
 * Elasticsearch DSL Query: Fetch the total number of unique process names
 * from the process_executions index, filtered by device_id and timestamp range.
 *
 * Index: process_executions
 * URL Path: /process_executions/_search
 * Method: POST
 *
 * Sample Response:
 * {
 *   "aggregations": {
 *     "unique_process_count": {
 *       "value": 42
 *     }
 *   }
 * }
 */

export const fetchUniqueProcessNamesQuery = (
    deviceId: string,
    from: string,
    to: string
): any => {
    return {
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
            "unique_process_count": {
                "cardinality": {
                    "field": "process_name"
                }
            }
        }
    };
};

export interface FetchUniqueProcessNamesAggregation {
    unique_process_count: {
        value: number;
    };
}

export const parseFetchUniqueProcessNamesResponse = (
    response: FetchUniqueProcessNamesAggregation
): number => {
    if (
        typeof response !== 'object' ||
        !response.unique_process_count ||
        typeof response.unique_process_count.value !== 'number'
    ) {
        console.error("Invalid response format for fetchUniqueProcessNamesQuery:", response);
        return 0;
    }

    return response.unique_process_count.value;
};
