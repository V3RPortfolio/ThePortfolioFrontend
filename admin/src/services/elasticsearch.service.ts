import httpService from "./http.service";
import { elasticsearchEndpoint } from "../constants";
import type { ElasticSearchAggregationResponse, ElasticSearchResponse } from "../interfaces/elasticsearch.interface";

export class ElasticsearchService {

    parseQuery(query: string): any {
        try {
            return JSON.parse(query);
        } catch (error) {
            console.error("Failed to parse query:", error);
            return null;
        }
    }

    search<T>(query: any, index: string, organizationId?: string, majorVersion?: number): Promise<ElasticSearchResponse<T>> {
        let jsonData = typeof query === 'string' ? this.parseQuery(query) : query;
        if(!jsonData) {
            return Promise.reject(new Error("Invalid JSON query"));
        }

        const basePath = `${elasticsearchEndpoint}${index.length ? `/${index}` : ""}/_search`;
        const url = organizationId !== undefined && majorVersion !== undefined
            ? `${basePath}/${organizationId}/${majorVersion}`
            : basePath;
        return httpService.post<ElasticSearchResponse<T>>(url, {
            method: 'POST',
            body: JSON.stringify(jsonData),
        }, true); // true to include auth token
    }

    aggregate<P, Q>(query: any, index: string, organizationId?: string, majorVersion?: number): Promise<ElasticSearchAggregationResponse<P,Q>> {
        let jsonData = typeof query === 'string' ? this.parseQuery(query) : query;
        if(!jsonData) {
            return Promise.reject(new Error("Invalid JSON query"));
        }

        const basePath = `${elasticsearchEndpoint}${index.length ? `/${index}` : ""}/_search`;
        const url = organizationId !== undefined && majorVersion !== undefined
            ? `${basePath}/${organizationId}/${majorVersion}`
            : basePath;
        return httpService.post<ElasticSearchAggregationResponse<P,Q>>(url, {
            method: 'POST',
            body: JSON.stringify(jsonData),
        }, true); // true to include auth token
    }
}

export default new ElasticsearchService();