/**
 * Elasticsearch DSL Query: Fetch all unique device IDs from the process_executions index.
 * URL Path: /process_executions/_search
 * Method: POST
 * Body:
 * {
 *   "aggregations": {
 *     "unique_devices": {
 *       "buckets": [
 *         {
 *           "key": "device-abc-123",
 *           "doc_count": 500
 *         }
 *       ]
 *     }
 *   }
 * }
 */

export const fetchUniqueDevicesQuery = (pageNo: number, pageSize: number): any => {
    return {
        "size": pageSize,
        "from": (pageNo - 1) * pageSize,
        "aggs": {
            "unique_devices": {
                "terms": {
                    "field": "device_id",
                    "size": pageSize
                }
            }
        }
    };
};

export interface DeviceBucket {
    key: string;
    doc_count: number;
}

export interface FetchUniqueDevicesResponse {
    unique_devices: {
        buckets: DeviceBucket[];
    };
}

export const parseFetchUniqueDevicesResponse = (response: FetchUniqueDevicesResponse): string[] => {
    if (
        typeof response !== 'object' ||
        !response.unique_devices ||
        !Array.isArray(response.unique_devices.buckets)
    ) {
        console.error("Invalid response format for fetchUniqueDevicesQuery:", response);
        return [];
    }

    return response.unique_devices.buckets
        .filter(
            (b: any) =>
                b &&
                typeof b === 'object' &&
                typeof b.key === 'string'
        )
        .map((b: any) => b.key as string);
};