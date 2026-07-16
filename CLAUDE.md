# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pax Atlas is an interactive 3D globe (built on Navara, Re:Earth's WebGL globe
engine) that visualizes historical trade routes across five empires at their
peak (Rome, Abbasid Caliphate, Mongols, Qing China, British Empire). Routes
render as animated geodesic arcs with a ship or camel model animating along
each leg depending on transport mode, plus city markers/labels, a toggleable
per-good legend, and a timeline scrubber to switch empires.

## Commands

```sh
pnpm i         # install deps (requires pnpm, see packageManager in package.json)
pnpm dev       # vite dev server on http://localhost:8080/
pnpm build     # tsc type-check, then production build to dist/
pnpm preview   # preview the production build locally
```

There is no test suite and no linter configured — `pnpm build`'s `tsc` step
(strict mode, `noUnusedLocals`/`noUnusedParameters`) is the only automated
check. There is no per-file/per-test way to narrow this; it always
type-checks the whole `src/` tree.

Pushes to `main` deploy automatically to GitHub Pages via
`.github/workflows/deploy.yml`.

## Navara dependency

`@navara/*` packages are vendored as tarballs in `externals/*.tgz` and wired
into `package.json` `dependencies`/`overrides` and `pnpm-workspace.yaml`
`overrides` by exact file path — not published to a registry. If a Navara
package needs updating, replace the tarball in `externals/` and keep all
three of those references (package.json dependencies, package.json
overrides/resolutions, pnpm-workspace.yaml overrides) pointing at consistent
versions, or pnpm will resolve mismatched copies.

`vite.config.ts` has a `closeBundle` plugin step that copies
`@navara/three`'s runtime asset directories (`atmosphere`, `cloud`, `noise`,
`water`) into `dist/assets/assets/*` after build. Navara resolves these at
runtime via a `new URL(...)` call Vite can't statically analyze, so without
this copy step the production build's atmosphere/cloud/water effects break
silently. Don't remove it when touching the Vite config.

## Architecture

Everything lives under `src/`, driven by one imperative entry point,
`main.ts`, which:

1. Boots a Navara `ThreeView`, adds the `DefaultPlugin` scene (basemap,
   terrain, ambient light) and `AttributionPlugin`.
2. Loads the ship/camel `.glb` models once as `InstancedGltfModelMeshDesc`
   meshes (`shipMeshHandle` / `camelMeshHandle`) shared across all empires —
   individual trade-route markers are *instances* added/removed from these,
   not separate meshes per route.
3. Exposes `loadEmpire(empire)`, which tears down and rebuilds the entire
   scene for one empire: one `ArclineMeshDesc` mesh per trade category (so
   the legend can show/hide a whole good's routes via one handle), one route
   marker instance per trade route positioned along an `EllipsoidGeodesic`,
   city point/label GeoJSON layers, and an optional territory outline layer.
4. Drives a `preRender` loop that animates the dash pattern flowing along
   each arc and slides every ship/camel instance along its geodesic in step
   with it (matched speed constants: `DASH_FLOW_SPEED` / `MARKER_SPEED`).

`main.ts` wires together three UI modules, each of which owns and
re-renders its own DOM subtree, keyed by a fixed element id (so calling the
create function again just replaces the previous instance):

- `legend.ts` — `createLegend()`: per-category checkboxes, the empire
  territory toggle, and the "trace" (solo) button that isolates a good and
  lists other empires trading a good with a matching `traceKey`.
- `timelineScrubber.ts` — `createTimelineScrubber()`: bottom range-input tab
  bar for switching the active empire.
- `urlState.ts` — reads/writes the current empire id and active category
  keys to/from the URL query string (`?empire=...&goods=...`), so a view is
  shareable/bookmarkable. Not a router — just serialized on every state
  change and read once at startup.

State that must survive an empire switch (the active trace, the territory
toggle) is held in module-level variables in `main.ts` rather than the URL,
because it doesn't map to that empire's category keys until
`resolveActiveKeys()` re-resolves it against the new empire's data.

### Data model (`src/data/`)

`types.ts` defines the shared shape: `City`, `TradeCategory` (a tradeable
good — color, `arcHeightScale` for visually fanning overlapping arcs, and an
optional `traceKey` used to link the "same good" across empires), `TradeRoute`
(`from`/`to` city ids, a `category` key, and `mode: "sea" | "land"` which
picks ship vs. camel), and `Empire` (id, name, `period` caption, `cities`,
`categories`, `tradeRoutes`, optional `territory` outline rings).

Each empire is one data file (`romanEmpire.ts`, `abbasidCaliphate.ts`,
`mongolEmpire.ts`, `qingDynasty.ts`, `britishEmpire.ts`) exporting a single
`Empire` object — pure data, no logic. `empires.ts` is the registry:
importing and ordering all five chronologically by peak, consumed by
`main.ts` and the timeline scrubber. **To add an empire**: create the data
file per `types.ts`'s shape and add it to the `empires` array in
`empires.ts` — the arc meshes, route markers, city layers, legend, and
camera framing are all generated from that data with no other code changes
needed.

`territory` rings in the empire data files are derived from
[historical-basemaps](https://github.com/aourednik/historical-basemaps)
(GPL-3.0) and carry that license independently of the rest of the repo,
which is otherwise unencumbered by it — keep that derivation separate if
extending territory data.
