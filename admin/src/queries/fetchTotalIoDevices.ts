/**
 * Elasticsearch DSL Query: Fetch the list of unique IO device names from the io_devices index,
 * filtered by a specific device_id and a timestamp range.
 * URL Path: /io_devices/_search
 * Method: POST
 * Body:
 * {
 *   "aggregations": {
 *     "unique_io_devices": {
 *       "buckets": [
 *         {
 *           "key": "USB Keyboard",
 *           "doc_count": 12
 *         }
 *       ]
 *     }
 *   }
 * }
 */

export interface FetchTotalIoDevicesParams {
    deviceId: string;
    from: string; // ISO 8601 date string, e.g. "2026-01-01T00:00:00Z"
    to: string;   // ISO 8601 date string, e.g. "2026-12-31T23:59:59Z"
}

export const buildFetchTotalIoDevicesQuery = ({ deviceId, from, to }: FetchTotalIoDevicesParams) => ({
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
        "unique_io_devices": {
            "terms": {
                "field": "io_device_name",
                "size": 1000
            }
        }
    }
});

export interface IoDeviceBucket {
    key: string;
    doc_count: number;
}

export interface FetchTotalIoDevicesResponse {
    unique_io_devices: {
        buckets: IoDeviceBucket[];
    };
}

export const parseFetchTotalIoDevicesResponse = (response: FetchTotalIoDevicesResponse): string[] => {
    if (
        typeof response !== 'object' ||
        !response.unique_io_devices ||
        !Array.isArray(response.unique_io_devices.buckets)
    ) {
        console.error("Invalid response format for buildFetchTotalIoDevicesQuery:", response);
        return [];
    }

    return response.unique_io_devices.buckets
        .filter(
            (b: any) =>
                b &&
                typeof b === 'object' &&
                typeof b.key === 'string'
        )
        .map((b: any) => b.key as string);
};
