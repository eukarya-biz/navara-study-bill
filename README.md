# Pax Atlas

**Trade routes of history.**

Pax Atlas is an interactive 3D globe that visualizes how goods moved across
five historical empires at their territorial or cultural peak - Rome, the
Abbasid Caliphate, the Mongols, Qing China, and the British Empire. Trade
routes are drawn as animated, color-coded geodesic arcs (in the style of a
flight-path map), with city markers, name labels, a toggleable legend per
trade good, and a switcher to jump between empires.

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
- **Bottom tab bar** switches between empires - the camera flies to frame
  that empire's cities and the map rebuilds its routes.
- **Legend** (top-right) lists each empire's trade goods with a color swatch;
  untick one to hide that category's routes. Tap the header to
  collapse/expand it (collapsed by default on small screens).

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
  main.ts              # scene setup: basemap, arc-line meshes, city layers,
                        # camera framing, and wiring for the UI below
  legend.ts             # floating legend panel (per-category toggle)
  empireSwitcher.ts      # bottom tab bar for switching the active empire
  style.css             # UI styling (dark, mobile-friendly)
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
   a list of `tradeRoutes` (`from` / `to` city ids + `category` key).
2. Register it in `src/data/empires.ts`'s `empires` array.

Everything else - the arc meshes, city markers/labels, legend, and camera
framing - is generated from that data automatically.

## Tech

- [Navara](https://navara-docs.netlify.app/) (`@navara/three`) for the 3D
  globe, terrain-free dark basemap tiles from
  [CARTO](https://carto.com/attributions) / [OpenStreetMap](https://www.openstreetmap.org/copyright),
  and the Cinzel / Inter type pairing from Google Fonts.
