# Pax Atlas

**Trade routes of history.**

Pax Atlas is an interactive 3D globe that visualizes how goods moved across
five historical empires at their territorial or cultural peak - Rome, the
Abbasid Caliphate, the Mongols, Qing China, and the British Empire. Trade
routes are drawn as animated, color-coded geodesic arcs (in the style of a
flight-path map) with a ship or camel caravan animating along each one
depending on whether that leg moved by sea or overland, with city markers,
name labels, a toggleable legend per trade good, and a timeline scrubber to
move between empires. Click a city to see the routes running through it, or
trace a single good to find which other empires also traded it.

Built on [Navara](https://navara-docs.netlify.app/), Re:Earth's WebGL globe
engine.

## Empires

| Empire | Peak | Goods shown |
| --- | --- | --- |
| Roman Empire | c. 117 AD | Grain, wine & oil, garum, silk & spice, metals & ore, marble & stone, textiles & dye |
| Abbasid Caliphate | c. 850 AD | Spices, silk, paper, frankincense & myrrh, glass & ceramics, textiles, East African trade |
| Mongol Empire | c. 1279 AD | Silk & textiles, spices & incense, paper & printing, horses & livestock, furs, precious metals & gems, porcelain & ceramics |
| Qing Dynasty | c. 1760 AD | Tea, silk, porcelain, silver, cotton & textiles, jade & gems, furs |
| British Empire | c. 1920 AD | Tea, cotton & textiles, wool, gold & diamonds, rubber/tin & spice, opium, coal, colonial produce |

## Controls

- **Drag** to rotate the globe, **scroll / pinch** to zoom.
- **Timeline scrubber** (bottom) switches between empires - drag it or tap
  an era label, and the camera flies to frame that empire's cities while
  the map rebuilds its routes.
- **Legend** (top-right) has an **Empire territory** toggle above the goods
  list, which shows or hides a dashed outline of the empire's extent at its
  peak, and then lists each trade good with a color swatch; untick one to
  hide that category's routes. Tap the header to collapse/expand it
  (collapsed by default on small screens). The **trace** button on a row
  isolates that good and, if any other empire traded the same good, lists
  them below so you can jump straight to that empire with the matching good
  already isolated.
- **Click a city marker** to open a card listing every trade route running
  through it; click elsewhere on the globe to close it.
- The current empire and active goods are reflected in the URL, so a
  specific view can be bookmarked or shared.

## Getting started

```sh
pnpm i
pnpm dev
```

Then open `http://localhost:8080/`.

```sh
pnpm build     # type-check + production build to dist/
pnpm preview   # preview the production build locally
```

Pushes to `main` deploy automatically to GitHub Pages (see
`.github/workflows/deploy.yml`).

## Project structure

```
src/
  main.ts              # scene setup: basemap, terrain, arc-line meshes,
                        # ship/camel markers, city layers, camera framing,
                        # and wiring for the UI below
  legend.ts             # floating legend panel (per-category toggle)
  empireSwitcher.ts      # bottom tab bar for switching the active empire
  style.css             # UI styling (dark, mobile-friendly)
  assets/
    models/             # ship.glb / camel.glb (see Tech for license/credit)
  data/
    types.ts            # shared City / TradeCategory / TradeRoute / Empire types
    romanEmpire.ts
    abbasidCaliphate.ts
    mongolEmpire.ts
    qingDynasty.ts
    britishEmpire.ts
    empires.ts           # registry consumed by main.ts and the switcher
```

### Adding another empire

1. Create `src/data/<empire>.ts` exporting an `Empire` (see `types.ts`):
   an id, display name, a `period` caption, a list of `cities`
   (`id`, `name`, `lng`, `lat`), a list of `categories` (goods, each with a
   color and an `arcHeightScale` so overlapping routes fan out visually), and
   a list of `tradeRoutes` (`from` / `to` city ids, a `category` key, and a
   `mode` of `"sea"` or `"land"` picking which animates along the arc).
2. Register it in `src/data/empires.ts`'s `empires` array.

Everything else - the arc meshes, ship/camel markers, city markers/labels,
legend, and camera framing - is generated from that data automatically.

## Tech

- [Navara](https://navara-docs.netlify.app/) (`@navara/three`) for the 3D
  globe, dark basemap tiles and terrain from
  [CARTO](https://carto.com/attributions) / [OpenStreetMap](https://www.openstreetmap.org/copyright),
  and the Cinzel / Inter type pairing from Google Fonts.
- Empire territory outlines are real historical boundaries from
  [historical-basemaps](https://github.com/aourednik/historical-basemaps)
  (`world_100`/`world_800`/`world_1279`/`world_1800`/`world_1920.geojson`),
  simplified for the globe. That dataset is **GPL-3.0 licensed** - the
  `territory` field in each `src/data/*Empire.ts` file is a derivative of it
  and carries the same license, independent of how the rest of this
  repository is licensed.
- The ship (`src/assets/models/ship.glb`) and camel
  (`src/assets/models/camel.glb`) models are from
  [Poly Pizza](https://poly.pizza): the ship by
  [Kenney](https://poly.pizza/m/SPxFN3Oazd) (CC0), the camel by
  [jeremy](https://poly.pizza/m/9mu4MbU4QtJ) (CC BY 3.0, attribution
  required).
