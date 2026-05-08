import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EquipmentSummary, RevenueByVendor, PerformanceByPrice, Top5Vendors, RacketPerformance
} from '../models/equipment.model';
import { FilterParams, buildParams } from '../models/filter.model';

@Injectable({ providedIn: 'root' })
export class EquipmentsService {
  private readonly API = `${environment.apiUrl}/api/equipments`;

  constructor(private http: HttpClient) {}

  getSummary(filters?: FilterParams): Observable<EquipmentSummary> {
    return this.http.get<EquipmentSummary>(`${this.API}/summary`, { params: buildParams(filters) });
  }

  getRevenueByVendor(filters?: FilterParams): Observable<RevenueByVendor> {
    return this.http.get<RevenueByVendor>(`${this.API}/revenue-by-vendor`, { params: buildParams(filters) });
  }

  getPerformanceByPrice(filters?: FilterParams): Observable<PerformanceByPrice> {
    return this.http.get<PerformanceByPrice>(`${this.API}/performance-by-price`, { params: buildParams(filters) });
  }

  getTop5Vendors(filters?: FilterParams): Observable<Top5Vendors> {
    return this.http.get<Top5Vendors>(`${this.API}/top5-vendors`, { params: buildParams(filters) });
  }

  getRacketPerformance(filters?: FilterParams): Observable<RacketPerformance> {
    return this.http.get<RacketPerformance>(`${this.API}/racket-performance`, { params: buildParams(filters) });
  }
}
