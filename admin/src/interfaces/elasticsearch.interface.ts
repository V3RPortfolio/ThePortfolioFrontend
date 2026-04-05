export interface ElasticSearchResponse<T> {
    took: number;
    timed_out: boolean;
    _shards: {
        total: number;
        successful: number;
        skipped: number;
        failed: number;
    };
    hits: {
        total: {
            value: number;
            relation: string;
        };
        max_score: number | null;
        hits: Array<{
            _index: string;
            _id: string;
            _score: number | null;
            _source: T; // You can replace 'any' with a more specific type based on your data structure
        }>;
    };
}

export interface ElasticSearchAggregationResponse<P, Q> extends ElasticSearchResponse<P> {
    aggregations?: Q; // You can replace 'any' with a more specific type based on your aggregation structure
}