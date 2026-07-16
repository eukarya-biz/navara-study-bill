import type { LatLng, LatLngHeight } from "@navara/three";

export const DEG2RAD = Math.PI / 180;

export function bearingBetween(from: LatLngHeight, to: LatLngHeight): number {
  const dLng = to.lng - from.lng;
  const y = Math.sin(dLng) * Math.cos(to.lat);
  const x =
    Math.cos(from.lat) * Math.sin(to.lat) -
    Math.sin(from.lat) * Math.cos(to.lat) * Math.cos(dLng);
  return Math.atan2(y, x);
}

export function toLatLng(
  cityById: Map<string, { lat: number; lng: number }>,
  cityId: string,
): LatLng {
  const city = cityById.get(cityId);
  if (!city) throw new Error(`Unknown city id: ${cityId}`);
  return { lat: city.lat, lng: city.lng };
}

export function toLatLngRad(
  cityById: Map<string, { lat: number; lng: number }>,
  cityId: string,
): LatLngHeight {
  const city = cityById.get(cityId);
  if (!city) throw new Error(`Unknown city id: ${cityId}`);
  return { lat: city.lat * DEG2RAD, lng: city.lng * DEG2RAD, height: 0 };
}
