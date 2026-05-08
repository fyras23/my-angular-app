export interface TotalPlayers {
  total_players: number;
}

export interface Revenue {
  revenue_2024: number;
  revenue_2025: number;
}

export interface TotalMatches {
  total_matches: number;
}

export interface MatchOutcomeItem {
  month: string;
  wins: number;
  losses: number;
}

export interface MatchOutcomes {
  data: MatchOutcomeItem[];
}

export interface TopPeriodItem {
  month: string;
  year: number;
  total: number;
}

export interface TopPeriods {
  data: TopPeriodItem[];
}

export interface GenderSplit {
  men: number;
  women: number;
}

export interface CountryItem {
  country: string;
  count: number;
}

export interface Top5Countries {
  data: CountryItem[];
}

export interface WinRate {
  win_rate: number;
}
