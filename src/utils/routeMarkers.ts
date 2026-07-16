import {
  eastNorthUpToFixedFrame,
  EllipsoidGeodesic,
  geodeticToVector3,
} from "@navara/three";
import type { InstancedGltfModelMeshDesc } from "@navara/three_default_descs";
import { Matrix4, Vector3 } from "three";
import type { TradeRoute } from "../data/types";
import { bearingBetween, toLatLngRad } from "./geo";

const SHIP_FORWARD_SIGN = -1;
const CAMEL_FORWARD_SIGN = 1;
const MARKER_HEIGHT = 20_000; // meters above the ellipsoid, clear of terrain relief
const MARKER_LOOKAHEAD = 50_000; // meters, for estimating heading of travel

export type RouteMarker = {
  categoryKey: string;
  mesh: InstancedGltfModelMeshDesc;
  index: number;
  geodesic: EllipsoidGeodesic;
  totalDistance: number;
  phaseOffset: number;
  baseScale: number;
  forwardSign: number;
  visible: boolean;
};

export type RouteMarkerMeshes = {
  ship: InstancedGltfModelMeshDesc;
  camel: InstancedGltfModelMeshDesc;
};

export type RouteMarkerScales = {
  ship: number;
  camel: number;
};

export function createRouteMarker(
  cityById: Map<string, { lat: number; lng: number }>,
  route: TradeRoute,
  meshes: RouteMarkerMeshes,
  scales: RouteMarkerScales,
  visible: boolean,
): RouteMarker {
  const geodesic = new EllipsoidGeodesic(
    toLatLngRad(cityById, route.from),
    toLatLngRad(cityById, route.to),
  );
  const mesh = route.mode === "sea" ? meshes.ship : meshes.camel;
  const index = mesh.add({});
  return {
    categoryKey: route.category,
    mesh,
    index,
    geodesic,
    totalDistance: geodesic.distance,
    // Stagger start position along the route so markers on the same route
    // don't all bunch up at the same point.
    phaseOffset: Math.random() * geodesic.distance,
    baseScale: route.mode === "sea" ? scales.ship : scales.camel,
    forwardSign: route.mode === "sea" ? SHIP_FORWARD_SIGN : CAMEL_FORWARD_SIGN,
    visible,
  };
}

export function disposeRouteMarkers(markers: RouteMarker[], meshes: RouteMarkerMeshes): void {
  for (const marker of markers) {
    marker.geodesic.dispose();
  }
  meshes.ship.clear();
  meshes.camel.clear();
}

// Scratch objects reused every frame so animating markers doesn't allocate.
const scratchRotation = new Matrix4();
const scratchScale = new Matrix4();
const scratchRight = new Vector3();
const scratchUp = new Vector3(0, 0, 1);
const scratchForward = new Vector3();

export function updateRouteMarkers(
  markers: RouteMarker[],
  elapsedSeconds: number,
  markerSpeed: number,
): void {
  const elapsedMeters = elapsedSeconds * markerSpeed;
  for (const marker of markers) {
    const distance = (elapsedMeters + marker.phaseOffset) % marker.totalDistance;
    const lookaheadDistance = Math.min(distance + MARKER_LOOKAHEAD, marker.totalDistance);
    const point = marker.geodesic.interpolateDistance(distance);
    const lookahead = marker.geodesic.interpolateDistance(lookaheadDistance);
    const heading = bearingBetween(point, lookahead);

    const origin = geodeticToVector3({ lat: point.lat, lng: point.lng, height: MARKER_HEIGHT });
    const enu = eastNorthUpToFixedFrame(origin);

    const sinH = Math.sin(heading);
    const cosH = Math.cos(heading);
    const sign = marker.forwardSign;
    scratchRight.set(-cosH * sign, sinH * sign, 0);
    scratchForward.set(sinH * sign, cosH * sign, 0);
    scratchRotation.makeBasis(scratchRight, scratchUp, scratchForward);

    const scale = marker.visible ? marker.baseScale : 0;
    scratchScale.makeScale(scale, scale, scale);

    const matrix = enu.multiply(scratchRotation).multiply(scratchScale);
    marker.mesh.updateAt(marker.index, { matrix });
  }
}
