export interface CompetitionFilters {
  countries: string[];
  player_countries: string[];
  years: number[];
  genders: string[];
}

export interface PerformanceFilters {
  genders: string[];
  countries: string[];
  years: number[];
}

export interface TournamentFilters {
  countries: string[];
  categories: string[];
  years: number[];
  tournament_names: string[];
}

export interface EquipmentFilters {
  vendors: string[];
  racket_types: string[];
  game_levels: string[];
  years: number[];
  price_range: { min: number; max: number };
}

export interface FilterParams {
  year?: number | null;
  country?: string | null;
  gender?: string | null;
  category?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  player_name?: string | null;
  vendor?: string | null;
  racket_type?: string | null;
  game_level?: string | null;
  price_min?: number | null;
  price_max?: number | null;
}

import { HttpParams } from '@angular/common/http';

/** Builds HttpParams from a FilterParams object, omitting null/undefined/empty values */
export function buildParams(filters?: FilterParams): HttpParams {
  let params = new HttpParams();
  if (!filters) return params;
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') {
      params = params.set(key, String(val));
    }
  });
  return params;
}
