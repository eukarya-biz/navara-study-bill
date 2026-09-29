import type { LatLng, LatLngHeight } from "@navaramap/three";

const DEG2RAD = Math.PI / 180;

// Initial bearing from `from` toward `to`, in radians, for positions in degrees.
export function bearingBetween(from: LatLngHeight, to: LatLngHeight): number {
  const fromLat = from.lat * DEG2RAD;
  const toLat = to.lat * DEG2RAD;
  const dLng = (to.lng - from.lng) * DEG2RAD;
  const y = Math.sin(dLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) - Math.sin(fromLat) * Math.cos(toLat) * Math.cos(dLng);
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

export function toLatLngHeight(
  cityById: Map<string, { lat: number; lng: number }>,
  cityId: string,
): LatLngHeight {
  const city = cityById.get(cityId);
  if (!city) throw new Error(`Unknown city id: ${cityId}`);
  return { lat: city.lat, lng: city.lng, height: 0 };
}
