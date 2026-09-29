import { createRequire } from "node:module";
import { dirname, extname, join } from "node:path";
import { cpSync, readdirSync } from "node:fs";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);

// @navaramap/three's runtime textures (atmosphere/cloud/noise/water) are each
// referenced via a static `new URL(..., import.meta.url)`, so Vite bundles
// them on its own. Its prebuilt worker chunks (e.g. fontWorker-*.js) are
// different: Vite re-emits them as opaque assets and never sees the .wasm
// they fetch relative to their own URL at runtime, so those files are copied
// through verbatim next to the re-emitted chunks after the build.
const navaraThreeAssetsDir = join(
  dirname(require.resolve("@navaramap/three/package.json")),
  "dist/assets",
);

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "copy-navara-three-worker-wasm",
      closeBundle() {
        for (const file of readdirSync(navaraThreeAssetsDir)) {
          if (extname(file) === ".wasm") {
            cpSync(join(navaraThreeAssetsDir, file), join("dist/assets", file));
          }
        }
      },
    },
  ],
});
