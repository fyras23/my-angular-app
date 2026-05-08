export interface TournamentSummary {
  players_per_tournament: number;
  win_rate: number;
  total_prize: number;
}

export interface PrizeByCategoryItem {
  category: string;
  prize: number;
}

export interface PrizeByCategory {
  data: PrizeByCategoryItem[];
}

export interface Top10PrizeItem {
  name: string;
  prize: number;
}

export interface Top10Prize {
  data: Top10PrizeItem[];
}

export interface ByCountryItem {
  country: string;
  prize: number;
}

export interface ByCountry {
  data: ByCountryItem[];
}

export interface ByCategoryItem {
  category: string;
  count: number;
}

export interface ByCategory {
  data: ByCategoryItem[];
}
