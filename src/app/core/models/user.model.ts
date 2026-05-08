export type DashboardType = 'competition' | 'performance' | 'tournaments' | 'equipments';

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  dashboard: DashboardType | null;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  user: User;
}

export interface RefreshResponse {
  access_token: string;
}
