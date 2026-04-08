import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ElasticSearchResponse,
  ElasticSearchAggregationResponse,
} from '../interfaces/backend/elasticsearch.interface';

@Injectable({ providedIn: 'root' })
export class ElasticsearchService {
  private readonly elasticsearchApi = `${environment.GATEWAY_BACKEND_API}/elastic`;

  constructor(private http: HttpClient) {}

  private buildUrl(index: string): string {
    return `${this.elasticsearchApi}${index.length ? `/${index}` : ''}/_search`;
  }

  private parseQuery(query: string): any | null {
    try {
      return JSON.parse(query);
    } catch (error) {
      console.error('Failed to parse query:', error);
      return null;
    }
  }

  search<T>(query: any, index: string): Observable<ElasticSearchResponse<T>> {
    const jsonData = typeof query === 'string' ? this.parseQuery(query) : query;
    if (!jsonData) {
      return throwError(() => new Error('Invalid JSON query'));
    }
    return this.http.post<ElasticSearchResponse<T>>(this.buildUrl(index), jsonData);
  }

  aggregate<P, Q>(query: any, index: string): Observable<ElasticSearchAggregationResponse<P, Q>> {
    const jsonData = typeof query === 'string' ? this.parseQuery(query) : query;
    if (!jsonData) {
      return throwError(() => new Error('Invalid JSON query'));
    }
    return this.http.post<ElasticSearchAggregationResponse<P, Q>>(this.buildUrl(index), jsonData);
  }
}
