import type ThreeView from "@navaramap/three";
import type { LatLng } from "@navaramap/three";
import type { DefaultDescriptions } from "@navaramap/three-default-plugin";
import type { Empire } from "../data/types";

type View = ThreeView<DefaultDescriptions>;

// Frames the empire's cities from straight above. A newer flyTo interrupts any
// flight still in progress, so switching empires mid-flight needs no extra
// handling. Returns the framed center so callers can align other per-empire
// state (e.g. the sun) to it.
export function flyToEmpireBounds(view: View, empire: Empire): LatLng {
  const lngs = empire.cities.map((city) => city.lng);
  const lats = empire.cities.map((city) => city.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const center = { lng: (minLng + maxLng) / 2, lat: (minLat + maxLat) / 2 };
  const spanDeg = Math.max(maxLng - minLng, maxLat - minLat);
  const height = Math.min(9_000_000, Math.max(3_500_000, spanDeg * 130_000));

  view.flyTo({ ...center, height, pitch: -90, heading: 0 }, { duration: 3000 });
  return center;
}
