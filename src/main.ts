import ThreeView, {
  Color,
  fetchFontFamilyFromCss,
  type LatLng,
  type Layer,
  type MeshHandle,
} from "@navara/three";
import { DefaultDescriptions, DefaultPlugin } from "@navara/three_default_plugin";
import type { ArclineMeshDesc } from "@navara/three_default_descs";
import { AttributionPlugin } from "@navara/three_plugins";
import { empires } from "./data/empires";
import type { Empire } from "./data/types";
import { createLegend } from "./legend";
import { createEmpireSwitcher } from "./empireSwitcher";
import "./style.css";

const view = new ThreeView<DefaultDescriptions>();

// Plugins

const attribution = new AttributionPlugin();
view.addPlugin(attribution);

const defaultPlugin = new DefaultPlugin();
view.addPlugin(defaultPlugin);

// Initialization

await view.init();

// Setup scene
defaultPlugin.addDefaultPhotorealScene();

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

// const terrain = view.addSource({
//   type: "quantized-mesh",
//   url: "https://terrain.reearth.land/cesium-mesh/ellipsoid/{z}/{x}/{y}.terrain",
//   maxZoom: 18,
//   requestVertexNormals: true,
//   requestWaterMask: true,
// });

// view.addLayer({
//   type: "terrain",
//   source: terrain,
//   terrain: {},
// });

// Trade route visualization

const fontFamily = await fetchFontFamilyFromCss(
  "TradeRouteLabels",
  "https://fonts.googleapis.com/css2?family=Cinzel",
);
view.addFontFamily(fontFamily);

const DASH_SIZE = 200_000; // meters
const GAP_SIZE = 140_000; // meters
const DASH_FLOW_SPEED = 60_000; // meters per second

// Mutable scene state for whichever empire is currently displayed. Swapping
// empires tears these down and rebuilds them from the new dataset.
let arcMeshHandles = new Map<string, MeshHandle<ArclineMeshDesc>>();
let cityPointsLayer: Layer | undefined;
let cityLabelsLayer: Layer | undefined;

function toLatLng(cityById: Map<string, { lat: number; lng: number }>, cityId: string): LatLng {
  const city = cityById.get(cityId);
  if (!city) throw new Error(`Unknown city id: ${cityId}`);
  return { lat: city.lat, lng: city.lng };
}

function clearEmpireScene() {
  for (const handle of arcMeshHandles.values()) {
    handle.delete();
  }
  arcMeshHandles = new Map();
  cityPointsLayer?.delete();
  cityLabelsLayer?.delete();
  cityPointsLayer = undefined;
  cityLabelsLayer = undefined;
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

  createLegend(empire, arcMeshHandles);
  flyToEmpireBounds(empire);
}

// Animate the dash pattern flowing from source to target, like a flight-path map.
view.on("preRender", (updatedAt) => {
  const elapsedSeconds = updatedAt / 1000;
  const dashOffset = -((elapsedSeconds * DASH_FLOW_SPEED) % (DASH_SIZE + GAP_SIZE));
  for (const handle of arcMeshHandles.values()) {
    handle.update({ arcLines: [{ dashOffset }] });
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

createEmpireSwitcher(empires, empires[0].id, loadEmpire);
loadEmpire(empires[0]);

// Attribution

attribution.show([
  {
    attributionHtml: `Basemap by <a href="https://carto.com/attributions">CARTO</a>, data by <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>`,
    attributionUrl: "https://carto.com/attributions",
  },
]);
