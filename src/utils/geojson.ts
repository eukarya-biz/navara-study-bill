import type { City, Empire } from "../data/types";

export function buildTerritoryFeatureCollection(territory: Empire["territory"]) {
  return {
    type: "FeatureCollection" as const,
    features: (territory ?? []).map((ring) => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: [...ring, ring[0]] },
    })),
  };
}

export function buildCityFeatureCollection(cities: City[]) {
  return {
    type: "FeatureCollection" as const,
    features: cities.map((city) => ({
      type: "Feature" as const,
      properties: { id: city.id, name: city.name },
      geometry: { type: "Point" as const, coordinates: [city.lng, city.lat] },
    })),
  };
}
