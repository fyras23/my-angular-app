import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PerformanceKpis, PlayerStats, Top10Wins, Top3Overview,
  GrowthResponse, ConsistencyResponse, PlayerSearchResponse
} from '../models/performance.model';
import { FilterParams, buildParams } from '../models/filter.model';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly API = `${environment.apiUrl}/api/performance`;

  constructor(private http: HttpClient) {}

  getKpis(filters?: FilterParams): Observable<PerformanceKpis> {
    return this.http.get<PerformanceKpis>(`${this.API}/kpis`, { params: buildParams(filters) });
  }

  getPlayerStats(playerId: number): Observable<PlayerStats> {
    return this.http.get<PlayerStats>(`${this.API}/player-stats`, {
      params: new HttpParams().set('player_id', String(playerId))
    });
  }

  getTop10Wins(filters?: FilterParams): Observable<Top10Wins> {
    return this.http.get<Top10Wins>(`${this.API}/top10-wins`, { params: buildParams(filters) });
  }

  getTop3Overview(filters?: FilterParams): Observable<Top3Overview> {
    return this.http.get<Top3Overview>(`${this.API}/top3-overview`, { params: buildParams(filters) });
  }

  getGrowth(filters?: FilterParams): Observable<GrowthResponse> {
    return this.http.get<GrowthResponse>(`${this.API}/growth`, { params: buildParams(filters) });
  }

  getConsistency(filters?: FilterParams): Observable<ConsistencyResponse> {
    return this.http.get<ConsistencyResponse>(`${this.API}/consistency`, { params: buildParams(filters) });
  }

  searchPlayers(query: string): Observable<PlayerSearchResponse> {
    return this.http.get<PlayerSearchResponse>(`${this.API}/search`, {
      params: new HttpParams().set('q', query)
    });
  }
}
