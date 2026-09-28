import type ThreeView from "@navaramap/three";
import type { LatLng } from "@navaramap/three";
import type { DefaultDescriptions } from "@navaramap/three-default-plugin";
import type { Empire } from "../data/types";

type View = ThreeView<DefaultDescriptions>;

// The engine has no direct "cancel flight" call, so without this, switching
// empires mid-flight leaves the previous flight's target and timing racing
// the new one instead of cleanly restarting.
export function stopCameraFlight(view: View): void {
  const position = view.camera.positionGeographic;
  const orientation = view.camera.orientation;
  view.setCamera({
    lng: position.lng,
    lat: position.lat,
    height: position.height,
    pitch: orientation.pitch,
    heading: orientation.heading,
    roll: orientation.roll,
  });
}

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

  stopCameraFlight(view);
  view.flyTo({ ...center, height, pitch: -90, heading: 0 }, { duration: 3000 });
  return center;
}
