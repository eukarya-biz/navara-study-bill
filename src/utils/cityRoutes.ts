import type { City, Empire, TradeRoute } from "../data/types";

export type CityRouteInfo = {
  route: TradeRoute;
  otherCity: City;
  direction: "outbound" | "inbound";
};

export function findRoutesForCity(empire: Empire, cityId: string): CityRouteInfo[] {
  const cityById = new Map(empire.cities.map((city) => [city.id, city]));
  const results: CityRouteInfo[] = [];

  for (const route of empire.tradeRoutes) {
    if (route.from === cityId) {
      const otherCity = cityById.get(route.to);
      if (otherCity) results.push({ route, otherCity, direction: "outbound" });
    } else if (route.to === cityId) {
      const otherCity = cityById.get(route.from);
      if (otherCity) results.push({ route, otherCity, direction: "inbound" });
    }
  }

  return results;
}
