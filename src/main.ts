import ThreeView, {
  Color,
  eastNorthUpToFixedFrame,
  EllipsoidGeodesic,
  fetchFontFamilyFromCss,
  geodeticToVector3,
  type LatLng,
  type LatLngHeight,
  type Layer,
  type MeshHandle,
} from "@navara/three";
import { DefaultDescriptions, DefaultPlugin } from "@navara/three_default_plugin";
import type {
  AmbientLightDesc,
  ArclineMeshDesc,
  InstancedGltfModelMeshDesc,
} from "@navara/three_default_descs";
import { AttributionPlugin } from "@navara/three_plugins";
import { Matrix4, Vector3 } from "three";
import { empires } from "./data/empires";
import type { Empire, TradeRoute } from "./data/types";
import { createLegend } from "./legend";
import { createTimelineScrubber } from "./timelineScrubber";
import { readInitialUrlState, writeUrlState } from "./urlState";
import shipModelUrl from "./assets/models/ship.glb?url";
import camelModelUrl from "./assets/models/camel.glb?url";
import "./style.css";

const view = new ThreeView<DefaultDescriptions>();
(window as any).__view = view;

// Plugins

const attribution = new AttributionPlugin();
view.addPlugin(attribution);

const defaultPlugin = new DefaultPlugin();
view.addPlugin(defaultPlugin);

// Initialization

await view.init();

// Setup scene
defaultPlugin.addDefaultPhotorealScene();

view.addLight<AmbientLightDesc>({
  ambient: { intensity: 20, color: new Color().setHex(0xffffff) },
});

view.atmosphere.date.setHours(8);
view.toneMappingExposure = 1.2;

// Layer declarations

const raster = view.addSource({
  type: "raster-tile",
  url: "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
  maxZoom: 20,
});

view.addLayer({
  type: "raster",
  source: raster,
  raster: {},
});

const terrain = view.addSource({
  type: "quantized-mesh",
  url: "https://terrain.reearth.land/cesium-mesh/ellipsoid/{z}/{x}/{y}.terrain",
  maxZoom: 18,
  requestVertexNormals: true,
  requestWaterMask: true,
});

view.addLayer({
  type: "terrain",
  source: terrain,
  terrain: {},
});

// Trade route visualization

const fontFamily = await fetchFontFamilyFromCss(
  "TradeRouteLabels",
  "https://fonts.googleapis.com/css2?family=Cinzel",
);
view.addFontFamily(fontFamily);

const DASH_SIZE = 200_000; // meters
const GAP_SIZE = 140_000; // meters
const DASH_FLOW_SPEED = 60_000; // meters per second
const DEG2RAD = Math.PI / 180;

const shipMeshHandle = view.addMesh<InstancedGltfModelMeshDesc>({
  gltfModels: { url: shipModelUrl, children: [] },
});
const camelMeshHandle = view.addMesh<InstancedGltfModelMeshDesc>({
  gltfModels: { url: camelModelUrl, children: [] },
});

let shipReady = false;
let camelReady = false;
shipMeshHandle.ref.on("load", () => {
  shipReady = true;
  syncRouteMarkers();
});
camelMeshHandle.ref.on("load", () => {
  camelReady = true;
  syncRouteMarkers();
});

const SHIP_TARGET_LENGTH = 180_000;
const SHIP_NATIVE_LENGTH = 80.976;
const SHIP_SCALE = SHIP_TARGET_LENGTH / SHIP_NATIVE_LENGTH;
const CAMEL_TARGET_LENGTH = 130_000;
const CAMEL_NATIVE_LENGTH = 11.57;
const CAMEL_SCALE = CAMEL_TARGET_LENGTH / CAMEL_NATIVE_LENGTH;

const SHIP_FORWARD_SIGN = 1;
const CAMEL_FORWARD_SIGN = 1;
const MARKER_HEIGHT = 20_000; // meters above the ellipsoid, clear of terrain relief
const MARKER_SPEED = DASH_FLOW_SPEED; // meters per second, matched to the dash flow
const MARKER_LOOKAHEAD = 50_000; // meters, for estimating heading of travel

type RouteMarker = {
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

let routeMarkers: RouteMarker[] = [];

let currentEmpire: Empire | undefined;
let currentActiveKeys: string[] = [];

function bearingBetween(from: LatLngHeight, to: LatLngHeight): number {
  const dLng = to.lng - from.lng;
  const y = Math.sin(dLng) * Math.cos(to.lat);
  const x = Math.cos(from.lat) * Math.sin(to.lat) - Math.sin(from.lat) * Math.cos(to.lat) * Math.cos(dLng);
  return Math.atan2(y, x);
}

// Mutable scene state for whichever empire is currently displayed. Swapping
// empires tears these down and rebuilds them from the new dataset.
let arcMeshHandles = new Map<string, MeshHandle<ArclineMeshDesc>>();
let cityPointsLayer: Layer | undefined;
let cityLabelsLayer: Layer | undefined;
let territoryLayer: Layer | undefined;

let pendingActiveKeys: string[] | undefined;

let currentTraceKey: string | undefined;

// Whether the territory outline is shown, carried across empire switches
// (like currentTraceKey) so the user's toggle choice persists.
let territoryVisible = true;

const TERRITORY_COLOR = 0xd4af6e;

function buildTerritoryFeatureCollection(territory: Empire["territory"]) {
  return {
    type: "FeatureCollection" as const,
    features: (territory ?? []).map((ring) => ({
      type: "Feature" as const,
      properties: {},
      geometry: { type: "LineString" as const, coordinates: [...ring, ring[0]] },
    })),
  };
}

function toLatLng(cityById: Map<string, { lat: number; lng: number }>, cityId: string): LatLng {
  const city = cityById.get(cityId);
  if (!city) throw new Error(`Unknown city id: ${cityId}`);
  return { lat: city.lat, lng: city.lng };
}

function toLatLngRad(cityById: Map<string, { lat: number; lng: number }>, cityId: string): LatLngHeight {
  const city = cityById.get(cityId);
  if (!city) throw new Error(`Unknown city id: ${cityId}`);
  return { lat: city.lat * DEG2RAD, lng: city.lng * DEG2RAD, height: 0 };
}

function createRouteMarker(
  cityById: Map<string, { lat: number; lng: number }>,
  route: TradeRoute,
  visible: boolean,
): RouteMarker {
  const geodesic = new EllipsoidGeodesic(
    toLatLngRad(cityById, route.from),
    toLatLngRad(cityById, route.to),
  );
  const mesh = route.mode === "sea" ? shipMeshHandle.ref : camelMeshHandle.ref;
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
    baseScale: route.mode === "sea" ? SHIP_SCALE : CAMEL_SCALE,
    forwardSign: route.mode === "sea" ? SHIP_FORWARD_SIGN : CAMEL_FORWARD_SIGN,
    visible,
  };
}

function clearRouteMarkers() {
  for (const marker of routeMarkers) {
    marker.geodesic.dispose();
  }
  routeMarkers = [];
  shipMeshHandle.ref.clear();
  camelMeshHandle.ref.clear();
}

// (Re)builds routeMarkers for currentEmpire, skipping routes whose model
// hasn't loaded yet - called from loadEmpire() and again from each model's
// "load" handler so routes that were skipped get backfilled once ready.
function syncRouteMarkers() {
  if (!currentEmpire) return;
  clearRouteMarkers();

  const cityById = new Map(currentEmpire.cities.map((city) => [city.id, city]));
  for (const route of currentEmpire.tradeRoutes) {
    if (route.mode === "sea" && !shipReady) continue;
    if (route.mode === "land" && !camelReady) continue;
    routeMarkers.push(createRouteMarker(cityById, route, currentActiveKeys.includes(route.category)));
  }
}

function clearEmpireScene() {
  for (const handle of arcMeshHandles.values()) {
    handle.delete();
  }
  arcMeshHandles = new Map();
  cityPointsLayer?.delete();
  cityLabelsLayer?.delete();
  territoryLayer?.delete();
  cityPointsLayer = undefined;
  cityLabelsLayer = undefined;
  territoryLayer = undefined;

  clearRouteMarkers();
}

// Pins the camera to wherever it currently is, discarding any in-progress
// flyTo animation. The engine has no direct "cancel flight" call, so without
// this, switching empires mid-flight leaves the previous flight's target and
// timing racing the new one instead of cleanly restarting.
function stopCameraFlight() {
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

function flyToEmpireBounds(empire: Empire) {
  const lngs = empire.cities.map((city) => city.lng);
  const lats = empire.cities.map((city) => city.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const centerLng = (minLng + maxLng) / 2;
  const centerLat = (minLat + maxLat) / 2;
  const spanDeg = Math.max(maxLng - minLng, maxLat - minLat);
  const height = Math.min(9_000_000, Math.max(3_500_000, spanDeg * 130_000));

  stopCameraFlight();
  view.flyTo(
    { lng: centerLng, lat: centerLat, height, pitch: -90, heading: 0 },
    3000,
  );
}

function loadEmpire(empire: Empire) {
  clearEmpireScene();

  const cityById = new Map(empire.cities.map((city) => [city.id, city]));
  const activeKeys = resolveActiveKeys(empire);

  // One arc-line mesh per category (rather than one mesh holding every
  // config) so the legend can show/hide each trade good independently.
  for (const category of empire.categories) {
    const geometry: LatLng[] = [];
    for (const route of empire.tradeRoutes) {
      if (route.category !== category.key) continue;
      geometry.push(toLatLng(cityById, route.from), toLatLng(cityById, route.to));
    }

    const handle = view.addMesh<ArclineMeshDesc>({
      arcLines: [
        {
          geometry,
          srcColor: new Color().setHex(category.color),
          tgtColor: new Color().setHex(category.color),
          thickness: 2,
          segments: 64,
          arcHeightScale: category.arcHeightScale,
          gradation: 0.5,
          dashed: true,
          dashSize: DASH_SIZE,
          gapSize: GAP_SIZE,
        },
      ],
    });

    arcMeshHandles.set(category.key, handle);
  }

  // A ship or camel instance per trade route, animated along its geodesic in
  // the preRender loop below. Visibility is kept in sync with the legend's
  // per-category checkboxes via onVisibilityChange.
  currentEmpire = empire;
  currentActiveKeys = activeKeys;
  syncRouteMarkers();

  // Two layers sharing the same GeoJSON data: one for the marker dot, one
  // for the name label, so both render independently of each other.
  const cityFeatureCollection = {
    type: "FeatureCollection" as const,
    features: empire.cities.map((city) => ({
      type: "Feature" as const,
      properties: { name: city.name },
      geometry: { type: "Point" as const, coordinates: [city.lng, city.lat] },
    })),
  };

  cityPointsLayer = view.addLayer({
    type: "geojson",
    data: cityFeatureCollection,
    point: {
      color: new Color().setHex(0xffe066),
      size: 8,
      sizeInMeters: false,
      clampToGround: true,
      offsetDepth: true,
    },
  });

  cityLabelsLayer = view.addLayer({
    type: "geojson",
    data: cityFeatureCollection,
    text: {
      font: "TradeRouteLabels",
      size: 16,
      sizeInMeters: false,
      color: new Color().setHex(0xffffff),
      outlineColor: new Color().setHex(0x1a1208),
      outlineWidth: 2,
      textAlign: "left",
      center: { x: 0.65, y: 0 },
      clampToGround: true,
      offsetDepth: true,
    },
  });

  cityLabelsLayer.on("featureCreated", ({ evaluator }) => {
    evaluator.evaluate(({ properties }) => ({
      text: (properties?.name as string) ?? "",
    }));
  });

  territoryLayer = empire.territory
    ? view.addLayer({
        type: "geojson",
        data: buildTerritoryFeatureCollection(empire.territory),
        polyline: {
          color: new Color().setHex(TERRITORY_COLOR),
          width: 2,
          clampToGround: true,
          show: territoryVisible,
        },
      })
    : undefined;

  createLegend(empire, arcMeshHandles, empires, jumpToEmpireWithTrace, {
    initialActiveKeys: activeKeys,
    onVisibilityChange: (keys, soloedTraceKey) => {
      currentTraceKey = soloedTraceKey;
      currentActiveKeys = keys;
      for (const marker of routeMarkers) {
        marker.visible = keys.includes(marker.categoryKey);
      }
      writeUrlState({ empireId: empire.id, categoryKeys: keys });
    },
    showTerritoryToggle: !!empire.territory,
    initialTerritoryVisible: territoryVisible,
    onTerritoryVisibilityChange: (visible) => {
      territoryVisible = visible;
      territoryLayer?.update({
        type: "geojson",
        data: buildTerritoryFeatureCollection(empire.territory),
        polyline: {
          color: new Color().setHex(TERRITORY_COLOR),
          width: 2,
          clampToGround: true,
          show: visible,
        },
      });
    },
  });
  createTimelineScrubber(empires, empire.id, loadEmpire);

  writeUrlState({ empireId: empire.id, categoryKeys: activeKeys });
  flyToEmpireBounds(empire);
}

// Picks which categories should be active on load: an explicit one-off
// override (initial URL state) wins first, then whichever category
// currently traces to `currentTraceKey` (so tracing a good survives
// switching empires), falling back to every category visible.
function resolveActiveKeys(empire: Empire): string[] {
  if (pendingActiveKeys) {
    const keys = pendingActiveKeys;
    pendingActiveKeys = undefined;
    return keys;
  }
  if (currentTraceKey) {
    const match = empire.categories.find((category) => category.traceKey === currentTraceKey);
    if (match) return [match.key];
  }
  return empire.categories.map((category) => category.key);
}

// Jumps to another empire, tracing the given tag there too (via
// resolveActiveKeys) so "Also traded by" chips land on the matching good
// rather than the new empire's default fully-visible legend.
function jumpToEmpireWithTrace(target: Empire, traceKey: string) {
  currentTraceKey = traceKey;
  loadEmpire(target);
}

// Scratch objects reused every frame so animating markers doesn't allocate.
const scratchRotation = new Matrix4();
const scratchScale = new Matrix4();
const scratchRight = new Vector3();
const scratchUp = new Vector3(0, 0, 1);
const scratchForward = new Vector3();

// Animate the dash pattern flowing from source to target, like a flight-path
// map, and slide each ship/camel marker along its route in step with it.
view.on("preRender", (updatedAt) => {
  const elapsedSeconds = updatedAt / 1000;
  const dashOffset = -((elapsedSeconds * DASH_FLOW_SPEED) % (DASH_SIZE + GAP_SIZE));
  for (const handle of arcMeshHandles.values()) {
    handle.update({ arcLines: [{ dashOffset }] });
  }

  const elapsedMeters = elapsedSeconds * MARKER_SPEED;
  for (const marker of routeMarkers) {
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
});
view.animation = true;

const brand = document.createElement("div");
brand.className = "app-brand";
brand.innerHTML = `
  <span class="app-brand__name">Pax Atlas</span>
  <span class="app-brand__tagline">Trade routes of history</span>
`;
document.body.appendChild(brand);

const initialUrlState = readInitialUrlState();
const initialEmpire =
  empires.find((empire) => empire.id === initialUrlState.empireId) ?? empires[0];
pendingActiveKeys = initialUrlState.categoryKeys;
loadEmpire(initialEmpire);

// Attribution

attribution.show([
  {
    attributionHtml: `Basemap by <a href="https://carto.com/attributions">CARTO</a>, data by <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>`,
    attributionUrl: "https://carto.com/attributions",
  },
  {
    attributionHtml: `Territory outlines from <a href="https://github.com/aourednik/historical-basemaps">historical-basemaps</a> (GPL-3.0)`,
    attributionUrl: "https://github.com/aourednik/historical-basemaps",
  },
  {
    attributionHtml: `Ship model by <a href="https://poly.pizza/m/SPxFN3Oazd">Kenney</a> (CC0), camel model by <a href="https://poly.pizza/m/9mu4MbU4QtJ">jeremy</a> (CC BY 3.0), via <a href="https://poly.pizza">Poly Pizza</a>`,
    attributionUrl: "https://poly.pizza",
  },
]);
