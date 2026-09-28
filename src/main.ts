import ThreeView, {
  Color,
  fetchFontFamilyFromCss,
  type LatLng,
  type Layer,
  type MeshHandle,
  type Source,
  type VectorLayer,
} from "@navaramap/three";
import { DefaultDescriptions, DefaultPlugin } from "@navaramap/three-default-plugin";
import type {
  AmbientLightDesc,
  ArclineMeshDesc,
  InstancedGltfModelMeshDesc,
} from "@navaramap/three-default-descs";
import { Vector3 } from "three";
import { empires } from "./data/empires";
import type { Empire } from "./data/types";
import { closeCityCard, createCityCard } from "./cityCard";
import { createLegend } from "./legend";
import { createTimelineScrubber } from "./timelineScrubber";
import { readInitialUrlState, writeUrlState } from "./urlState";
import { hideRouteTooltip, showRouteTooltip } from "./routeTooltip";
import { flyToEmpireBounds } from "./utils/camera";
import { findRoutesForCity } from "./utils/cityRoutes";
import { toLatLng } from "./utils/geo";
import { buildCityFeatureCollection, buildTerritoryFeatureCollection } from "./utils/geojson";
import { buildRouteHoverTargets, findHoveredRoute, type RouteHoverTarget } from "./utils/routeHover";
import {
  createRouteMarker,
  disposeRouteMarkers,
  updateRouteMarkers,
  type RouteMarker,
} from "./utils/routeMarkers";
import shipModelUrl from "./assets/models/ship.glb?url";
import camelModelUrl from "./assets/models/camel.glb?url";
import "./style.css";

const view = new ThreeView<DefaultDescriptions>();
(window as any).__view = view;

// Plugins

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

const MARKER_SPEED = DASH_FLOW_SPEED; // meters per second, matched to the dash flow

let routeMarkers: RouteMarker[] = [];
let routeHoverTargets: RouteHoverTarget[] = [];

let currentEmpire: Empire | undefined;
let currentActiveKeys: string[] = [];

// Mutable scene state for whichever empire is currently displayed. Swapping
// empires tears these down and rebuilds them from the new dataset.
let arcMeshHandles = new Map<string, MeshHandle<ArclineMeshDesc>>();
let citySource: Source | undefined;
let cityPointsLayer: Layer | undefined;
let cityLabelsLayer: Layer | undefined;
let territory: { source: Source; layer: Layer } | undefined;

let pendingActiveKeys: string[] | undefined;

let currentTraceKey: string | undefined;

// Whether the territory outline is shown, carried across empire switches
// (like currentTraceKey) so the user's toggle choice persists.
let territoryVisible = true;

const TERRITORY_COLOR = 0xd4af6e;

function territoryLayerDescription(source: Source, show: boolean): VectorLayer {
  return {
    type: "vector",
    source,
    polyline: {
      color: new Color().setHex(TERRITORY_COLOR),
      width: 2,
      clampToGround: true,
      show,
    },
  };
}

function clearRouteMarkers() {
  disposeRouteMarkers(routeMarkers, { ship: shipMeshHandle.ref, camel: camelMeshHandle.ref });
  routeMarkers = [];
}

// (Re)builds routeMarkers for currentEmpire, skipping routes whose model
// hasn't loaded yet - called from loadEmpire() and again from each model's
// "load" handler so routes that were skipped get backfilled once ready.
function syncRouteMarkers() {
  if (!currentEmpire) return;
  clearRouteMarkers();

  const cityById = new Map(currentEmpire.cities.map((city) => [city.id, city]));
  const meshes = { ship: shipMeshHandle.ref, camel: camelMeshHandle.ref };
  const scales = { ship: SHIP_SCALE, camel: CAMEL_SCALE };
  for (const route of currentEmpire.tradeRoutes) {
    if (route.mode === "sea" && !shipReady) continue;
    if (route.mode === "land" && !camelReady) continue;
    routeMarkers.push(
      createRouteMarker(cityById, route, meshes, scales, currentActiveKeys.includes(route.category)),
    );
  }
}

function clearEmpireScene() {
  for (const handle of arcMeshHandles.values()) {
    handle.delete();
  }
  arcMeshHandles = new Map();
  // A source can't be deleted while a layer still references it, so the
  // layers go first.
  cityPointsLayer?.delete();
  cityLabelsLayer?.delete();
  citySource?.delete();
  territory?.layer.delete();
  territory?.source.delete();
  cityPointsLayer = undefined;
  cityLabelsLayer = undefined;
  citySource = undefined;
  territory = undefined;

  clearRouteMarkers();
}

function loadEmpire(empire: Empire) {
  clearEmpireScene();
  closeCityCard();
  hideRouteTooltip();

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
  routeHoverTargets = buildRouteHoverTargets(empire);
  syncRouteMarkers();

  // Two layers sharing one GeoJSON source: one for the marker dot, one for
  // the name label, so both render independently of each other.
  citySource = view.addSource({
    type: "geojson",
    data: buildCityFeatureCollection(empire.cities),
  });

  // Screen-space decluttering is on by default and runs across layers, so a
  // dot and the label anchored at the same city would suppress each other
  // (most labels silently vanished). Every city is meant to be labelled, so
  // both layers opt out.
  cityPointsLayer = view.addLayer({
    type: "vector",
    source: citySource,
    point: {
      color: new Color().setHex(0xffe066),
      size: 8,
      sizeInMeters: false,
      clampToGround: true,
      offsetDepth: true,
      declutter: false,
    },
  });

  cityLabelsLayer = view.addLayer({
    type: "vector",
    source: citySource,
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
      declutter: false,
    },
  });

  cityLabelsLayer.on("featureCreated", ({ evaluator }) => {
    evaluator.evaluate(({ properties }) => ({
      text: (properties?.name as string) ?? "",
    }));
  });

  if (empire.territory) {
    const source = view.addSource({
      type: "geojson",
      data: buildTerritoryFeatureCollection(empire.territory),
    });
    territory = { source, layer: view.addLayer(territoryLayerDescription(source, territoryVisible)) };
  }

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
      territory?.layer.update(territoryLayerDescription(territory.source, visible));
    },
  });
  createTimelineScrubber(empires, empire.id, loadEmpire);

  writeUrlState({ empireId: empire.id, categoryKeys: activeKeys });
  flyToEmpireBounds(view, empire);
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

// Animate the dash pattern flowing from source to target, like a flight-path
// map, and slide each ship/camel marker along its route in step with it.
view.on("preRender", (updatedAt) => {
  const elapsedSeconds = updatedAt / 1000;
  const dashOffset = -((elapsedSeconds * DASH_FLOW_SPEED) % (DASH_SIZE + GAP_SIZE));
  for (const handle of arcMeshHandles.values()) {
    handle.update({ arcLines: [{ dashOffset }] });
  }

  updateRouteMarkers(routeMarkers, elapsedSeconds, MARKER_SPEED);
});
view.animation = true;

// City click & route hover interactions

const HOVER_PIXEL_RADIUS = 14; // CSS pixels
const hoverScratch = new Vector3();

view.on("pointermove", (event) => {
  const canvas = event.target as HTMLElement | null;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const screenX = event.clientX - rect.left;
  const screenY = event.clientY - rect.top;

  const visibleTargets = routeHoverTargets.filter((target) =>
    currentActiveKeys.includes(target.categoryKey),
  );
  const hovered = findHoveredRoute(
    visibleTargets,
    screenX,
    screenY,
    view.camera.raw,
    view.camera.raw.position,
    view.screenSize.x,
    view.screenSize.y,
    HOVER_PIXEL_RADIUS,
    hoverScratch,
  );

  if (hovered) {
    showRouteTooltip(hovered, event.clientX, event.clientY);
  } else {
    hideRouteTooltip();
  }
});

// Clicking a city marker or label opens a card listing every trade route
// through it; clicking anything else (an empty patch of globe, an arc)
// closes it, since `featureClick` fires with `null` when nothing was hit.
view.on("featureClick", (info) => {
  if (!info || !currentEmpire) {
    closeCityCard();
    return;
  }
  if (info.layerId !== cityPointsLayer?.id && info.layerId !== cityLabelsLayer?.id) {
    closeCityCard();
    return;
  }

  const cityId = info.properties?.id as string | undefined;
  const city = cityId ? currentEmpire.cities.find((candidate) => candidate.id === cityId) : undefined;
  if (!city) {
    closeCityCard();
    return;
  }

  const routes = findRoutesForCity(currentEmpire, city.id);
  const categoriesByKey = new Map(currentEmpire.categories.map((category) => [category.key, category]));
  createCityCard(city, routes, categoriesByKey);
});

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

view.attribution?.add([
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
