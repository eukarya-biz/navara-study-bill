import { createRequire } from "node:module";
import { dirname, extname, join } from "node:path";
import { cpSync, existsSync, readdirSync } from "node:fs";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);

// @navaramap/three resolves these directories at runtime via
// `new URL("./assets/<name>", import.meta.url)` from within its bundled
// chunk, which lands under dist/assets/assets/<name> — Vite can't statically
// analyze that call (it warns "doesn't exist at build time"), so we copy
// the directories into place ourselves after the build.
const navaraThreeAssetsDir = join(
  dirname(require.resolve("@navaramap/three/package.json")),
  "dist/assets",
);
const runtimeAssetDirs = ["atmosphere", "cloud", "noise", "water"];

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "copy-navara-three-runtime-assets",
      closeBundle() {
        for (const name of runtimeAssetDirs) {
          const src = join(navaraThreeAssetsDir, name);
          if (existsSync(src)) {
            cpSync(src, join("dist/assets/assets", name), { recursive: true });
          }
        }
        // The prebuilt @navaramap/three worker chunks (e.g. fontWorker-*.js)
        // are re-emitted by Vite as opaque assets, so it never sees the .wasm
        // they fetch relative to their own URL at runtime; copy those files
        // through verbatim next to the re-emitted chunks.
        for (const file of readdirSync(navaraThreeAssetsDir)) {
          if (extname(file) === ".wasm") {
            cpSync(join(navaraThreeAssetsDir, file), join("dist/assets", file));
          }
        }
      },
    },
  ],
});
