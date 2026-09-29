import { EllipsoidGeodesic, geodeticToVector3 } from "@navaramap/three";
import type { PerspectiveCamera, Vector3 } from "three";
import type { Empire } from "../data/types";
import { toLatLngHeight } from "./geo";

const SAMPLE_COUNT = 20;

export type RouteHoverTarget = {
  categoryKey: string;
  categoryLabel: string;
  good: string;
  color: number;
  mode: "sea" | "land";
  fromName: string;
  toName: string;
  points: Vector3[];
};

// Samples points along each route's geodesic, lifted by a sine-shaped bump
// that approximates the GPU-drawn arc's height profile (peak height =
// chord distance * the category's arcHeightScale, zero at both ends) - close
// enough for hover hit-testing without reimplementing the arc shader in JS.
export function buildRouteHoverTargets(empire: Empire): RouteHoverTarget[] {
  const cityById = new Map(empire.cities.map((city) => [city.id, city]));
  const categoryByKey = new Map(empire.categories.map((category) => [category.key, category]));
  const targets: RouteHoverTarget[] = [];

  for (const route of empire.tradeRoutes) {
    const category = categoryByKey.get(route.category);
    const fromCity = cityById.get(route.from);
    const toCity = cityById.get(route.to);
    if (!category || !fromCity || !toCity) continue;

    const fromPosition = toLatLngHeight(cityById, route.from);
    const toPosition = toLatLngHeight(cityById, route.to);
    const chordDistance = geodeticToVector3(fromPosition).distanceTo(geodeticToVector3(toPosition));
    const apexHeight = chordDistance * category.arcHeightScale;

    const geodesic = new EllipsoidGeodesic(fromPosition, toPosition);
    const points: Vector3[] = [];
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const t = i / (SAMPLE_COUNT - 1);
      const { lat, lng } = geodesic.interpolateDistance(t * geodesic.distance);
      const height = apexHeight * Math.sin(Math.PI * t);
      points.push(geodeticToVector3({ lat, lng, height }));
    }
    geodesic.dispose();

    targets.push({
      categoryKey: category.key,
      categoryLabel: category.label,
      good: category.good,
      color: category.color,
      mode: route.mode,
      fromName: fromCity.name,
      toName: toCity.name,
      points,
    });
  }

  return targets;
}

function isFrontFacing(point: Vector3, cameraPosition: Vector3): boolean {
  // Tangent-plane horizon check: a surface point is visible from an external
  // camera only when the camera sits on the outward side of the plane
  // tangent to the point.
  return point.dot(cameraPosition) >= point.lengthSq();
}

function projectToScreen(
  point: Vector3,
  camera: PerspectiveCamera,
  screenWidth: number,
  screenHeight: number,
  scratch: Vector3,
): { x: number; y: number } | undefined {
  scratch.copy(point).project(camera);
  if (scratch.z < -1 || scratch.z > 1) return undefined;
  return {
    x: ((scratch.x + 1) / 2) * screenWidth,
    y: ((1 - scratch.y) / 2) * screenHeight,
  };
}

export function findHoveredRoute(
  targets: RouteHoverTarget[],
  screenX: number,
  screenY: number,
  camera: PerspectiveCamera,
  cameraPosition: Vector3,
  screenWidth: number,
  screenHeight: number,
  maxPixelDistance: number,
  scratch: Vector3,
): RouteHoverTarget | undefined {
  let closest: RouteHoverTarget | undefined;
  let closestDistance = maxPixelDistance;

  for (const target of targets) {
    for (const point of target.points) {
      if (!isFrontFacing(point, cameraPosition)) continue;
      const screen = projectToScreen(point, camera, screenWidth, screenHeight, scratch);
      if (!screen) continue;
      const distance = Math.hypot(screen.x - screenX, screen.y - screenY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = target;
      }
    }
  }

  return closest;
}
