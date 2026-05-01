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

export const fetchTotalUniqueDevicesQuery = (): any => {
    return {
        "size": 0,
        "aggs": {
            "unique_devices": {
                "cardinality": {
                    "field": "device_id"
                }
            }
        }
    };  
}

export interface DeviceBucket {
    key: string;
    doc_count: number;
}

export interface FetchUniqueDevicesResponse {
    unique_devices: {
        buckets: DeviceBucket[];
    };
}

export interface FetchTotalUniqueDevicesResponse {
    unique_devices: {
        value: number;
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

export const parseFetchTotalUniqueDevicesResponse = (response: FetchTotalUniqueDevicesResponse): number => {
    if (
        typeof response !== 'object' ||
        !response.unique_devices ||
        typeof response.unique_devices.value !== 'number'
    ) {
        console.error("Invalid response format for fetchTotalUniqueDevicesQuery:", response);
        return 0;
    }

    return response.unique_devices.value;
};