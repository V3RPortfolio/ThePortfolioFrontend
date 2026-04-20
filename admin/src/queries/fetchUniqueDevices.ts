/**
 * Elasticsearch DSL Query: Fetch all unique device IDs from the process_executions index.
 * URL Path: /running_processes/_search
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

export const fetchUniqueDevicesQuery = (partition: number, totalPartitions: number): any => {
    return {
        "size": 0,
        "aggs": {
            "unique_devices": {
                "terms": {
                    "field": "device_id",
                    "include": {
                        "partition": partition,
                        "num_partitions": totalPartitions
                    }
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