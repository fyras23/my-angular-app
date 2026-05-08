import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TotalPlayers, Revenue, TotalMatches, MatchOutcomes,
  TopPeriods, GenderSplit, Top5Countries, WinRate
} from '../models/competition.model';
import { FilterParams, buildParams } from '../models/filter.model';

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private readonly API = `${environment.apiUrl}/api/competition`;

  constructor(private http: HttpClient) {}

  getTotalPlayers(filters?: FilterParams): Observable<TotalPlayers> {
    return this.http.get<TotalPlayers>(`${this.API}/total-players`, { params: buildParams(filters) });
  }

  getRevenue(filters?: FilterParams): Observable<Revenue> {
    return this.http.get<Revenue>(`${this.API}/revenue`, { params: buildParams(filters) });
  }

  getTotalMatches(filters?: FilterParams): Observable<TotalMatches> {
    return this.http.get<TotalMatches>(`${this.API}/total-matches`, { params: buildParams(filters) });
  }

  getMatchOutcomes(filters?: FilterParams): Observable<MatchOutcomes> {
    return this.http.get<MatchOutcomes>(`${this.API}/match-outcomes`, { params: buildParams(filters) });
  }

  getTopPeriods(filters?: FilterParams): Observable<TopPeriods> {
    return this.http.get<TopPeriods>(`${this.API}/top-periods`, { params: buildParams(filters) });
  }

  getGenderSplit(filters?: FilterParams): Observable<GenderSplit> {
    return this.http.get<GenderSplit>(`${this.API}/gender-split`, { params: buildParams(filters) });
  }

  getTop5Countries(filters?: FilterParams): Observable<Top5Countries> {
    return this.http.get<Top5Countries>(`${this.API}/top5-countries`, { params: buildParams(filters) });
  }

  getWinRate(filters?: FilterParams): Observable<WinRate> {
    return this.http.get<WinRate>(`${this.API}/win-rate`, { params: buildParams(filters) });
  }
}
