import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  CompetitionFilters, PerformanceFilters,
  TournamentFilters, EquipmentFilters
} from '../models/filter.model';

@Injectable({ providedIn: 'root' })
export class FilterService {
  private readonly API = environment.apiUrl;
  private cache: Record<string, any> = {};

  constructor(private http: HttpClient) {}

  getCompetitionFilters(): Observable<CompetitionFilters> {
    return this.getCached<CompetitionFilters>('competition');
  }

  getPerformanceFilters(): Observable<PerformanceFilters> {
    return this.getCached<PerformanceFilters>('performance');
  }

  getTournamentFilters(): Observable<TournamentFilters> {
    return this.getCached<TournamentFilters>('tournaments');
  }

  getEquipmentFilters(): Observable<EquipmentFilters> {
    return this.getCached<EquipmentFilters>('equipments');
  }

  private getCached<T>(dashboard: string): Observable<T> {
    if (this.cache[dashboard]) {
      return of(this.cache[dashboard] as T);
    }
    return this.http.get<T>(`${this.API}/api/filters/${dashboard}`).pipe(
      tap(data => { this.cache[dashboard] = data; })
    );
  }
}
