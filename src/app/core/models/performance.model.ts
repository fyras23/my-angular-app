export interface PerformanceKpis {
  total_players: number;
  men: number;
  women: number;
}

export interface PlayerStats {
  name: string;
  matches: number;
  wins: number;
  points: number;
}

export interface Top10WinsItem {
  name: string;
  wins: number;
}

export interface Top10Wins {
  data: Top10WinsItem[];
}

export interface Top3OverviewItem {
  name: string;
  matches: number;
  wins: number;
  losses: number;
}

export interface Top3Overview {
  data: Top3OverviewItem[];
}

export interface GrowthResponse {
  growth_percent: number;
}

export interface ConsistencyResponse {
  consistency: number;
}

export interface PlayerSearchItem {
  id: number;
  name: string;
}

export interface PlayerSearchResponse {
  data: PlayerSearchItem[];
}
