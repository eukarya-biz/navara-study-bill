export type City = {
  id: string;
  name: string;
  lng: number;
  lat: number;
};

export type TradeCategory = {
  key: string;
  label: string;
  good: string;
  color: number;
  arcHeightScale: number;
};

export type TradeRoute = {
  from: string;
  to: string;
  category: string;
};

export type Empire = {
  id: string;
  name: string;
  /** Shown under the name in the legend, e.g. the period at peak extent. */
  period: string;
  cities: City[];
  categories: TradeCategory[];
  tradeRoutes: TradeRoute[];
};
