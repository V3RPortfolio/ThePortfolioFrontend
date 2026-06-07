import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ServiceGroupInfoOut, ServiceGroupOut, ServiceOut } from '../../interfaces/djadmin/documentation.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly baseUrl = environment.GATEWAY_BACKEND_API;
  private readonly documentationApi = `${this.baseUrl}/jarvis-documentation`;

  constructor(private http: HttpClient) {}

  getServiceGroups():Observable<ServiceGroupInfoOut[]> {
    return this.http.get<ServiceGroupInfoOut[]>(`${this.documentationApi}/groups/`)
  }

  getService(serviceId:string):Observable<ServiceOut> {
    const url = `${this.documentationApi}/service/${serviceId}/`;
    return this.http.get<ServiceOut>(url);
  }
}