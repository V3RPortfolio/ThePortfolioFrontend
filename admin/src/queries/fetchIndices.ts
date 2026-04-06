/**
 * Elasticsearch DSL Query: Fetch all indices with their document count and storage size.
 * URL Path: /_search
 * Method: POST
 * Body:
 * {
 *  "aggregations": {
 *     "indices": {
 *       "buckets": [
 *        {
 *           "key": "index_name_1",
 *           "doc_count": { "value": 1000 },
 *           "storage_size": { "value": 104857600 }
 *         }
 *        ]
 *     }
 *   }
 * }
 */

export const fetchIndicesQuery = (pageNo:number, pageSize:number):any => {
    return {
    "size": pageSize,
    "from": (pageNo - 1) * pageSize,
        "aggs": {
            "indices": {
                "terms": {
                    "field": "_index",
                    "size": pageSize
                },
                "aggs": {
                    "doc_count": {
                        "value_count": {
                            "field": "_index"
                        }
                    },
                    "storage_size": {
                        "sum": {
                            "field": "_size"
                        }
                    }
                }
            }
        }
    }
};

export interface IndexInfo {
    key: string;
    doc_count:  {
        value: number;
    };
    storage_size: {
        value: number;
    };
}

export interface fetchIndicesResponse {
    indices: {
        buckets: IndexInfo[];
    }
}

export const parseFetchIndicesResponse = (response: fetchIndicesResponse):IndexInfo[] => {
    if(
        typeof response !== 'object' || 
        !response.indices || 
        !Array.isArray(response.indices.buckets  
        )
    ) {
        console.error("Invalid response format for fetchIndicesQuery:", response);
        return [];
    }
    const buckets = response.indices.buckets;

    const indices: IndexInfo[] = buckets
        .filter(
            (b: any) =>
                b &&
                typeof b === 'object' &&
                typeof b.key === 'string' &&
                b.doc_count &&
                typeof b.doc_count === 'object' &&
                typeof b.doc_count.value === 'number' &&
                b.storage_size &&
                typeof b.storage_size === 'object' &&
                typeof b.storage_size.value === 'number'
        )
        .map((b: any) => ({
            key: b.key,
            doc_count: { value: b.doc_count.value },
            storage_size: { value: b.storage_size.value }
        }));

    return indices;

}