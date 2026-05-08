export interface EquipmentSummary {
  market_revenue: number;
  product_revenue: number;
  active_players: number;
}

export interface RevenueByVendorItem {
  vendor: string;
  year: number;
  revenue: number;
}

export interface RevenueByVendor {
  data: RevenueByVendorItem[];
}

export interface PerformanceByPriceItem {
  type: string;
  price: number;
  win_rate: number;
}

export interface PerformanceByPrice {
  data: PerformanceByPriceItem[];
}

export interface Top5VendorItem {
  vendor: string;
  revenue_2023: number;
  revenue_2024: number;
  revenue_2025: number;
}

export interface Top5Vendors {
  data: Top5VendorItem[];
}

export interface RacketPerformanceItem {
  type: string;
  actual: number;
  target: number;
}

export interface RacketPerformance {
  data: RacketPerformanceItem[];
}
