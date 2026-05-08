import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TournamentSummary, PrizeByCategory, Top10Prize, ByCountry, ByCategory
} from '../models/tournament.model';
import { FilterParams, buildParams } from '../models/filter.model';

@Injectable({ providedIn: 'root' })
export class TournamentsService {
  private readonly API = `${environment.apiUrl}/api/tournaments`;

  constructor(private http: HttpClient) {}

  getSummary(filters?: FilterParams): Observable<TournamentSummary> {
    return this.http.get<TournamentSummary>(`${this.API}/summary`, { params: buildParams(filters) });
  }

  getPrizeByCategory(filters?: FilterParams): Observable<PrizeByCategory> {
    return this.http.get<PrizeByCategory>(`${this.API}/prize-by-category`, { params: buildParams(filters) });
  }

  getTop10Prize(filters?: FilterParams): Observable<Top10Prize> {
    return this.http.get<Top10Prize>(`${this.API}/top10-prize`, { params: buildParams(filters) });
  }

  getByCountry(filters?: FilterParams): Observable<ByCountry> {
    return this.http.get<ByCountry>(`${this.API}/by-country`, { params: buildParams(filters) });
  }

  getByCategory(filters?: FilterParams): Observable<ByCategory> {
    return this.http.get<ByCategory>(`${this.API}/by-category`, { params: buildParams(filters) });
  }
}
