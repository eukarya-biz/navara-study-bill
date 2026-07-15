import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { cpSync, existsSync } from "node:fs";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);

// @navara/three resolves these directories at runtime via
// `new URL("./assets/<name>", import.meta.url)` from within its bundled
// chunk, which lands under dist/assets/assets/<name> — Vite can't statically
// analyze that call (it warns "doesn't exist at build time"), so we copy
// the directories into place ourselves after the build.
const navaraThreeAssetsDir = join(
  dirname(require.resolve("@navara/three/package.json")),
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
      },
    },
  ],
});
