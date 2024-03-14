import fs from "fs/promises";
import path from "path";
import checker from "vite-plugin-checker"
import { defineConfig } from "vite";

const afterBuildCleanUpPlugin = {
  name: "delete-after-build",
  resolveId: (s) => s == "virtual-module" ? s : null,
  writeBundle: (outputOptions) => {
    ["img_sources"].forEach(dir => fs.rm(path.resolve(outputOptions.dir, dir), { recursive: true }));
  }
}

const fullReloadPlugin = {
  name: "full-reload",
  handleHotUpdate({ server }) {
    server.ws.send({ type: "full-reload" })
    return [];
  }
}

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  define: {
    IS_DEV: mode == "development"
  },
  plugins: [
    checker({ typescript: true, overlay: { initialIsOpen: false } }),
    afterBuildCleanUpPlugin,
    fullReloadPlugin
  ],
  base: "./",
  build: {
    assetsDir: "",
    rollupOptions: {
      output: [
        { name: "web", dir: path.join(__dirname, "dist") },
        { name: "android", dir: path.join(__dirname, "android/app/src/main/assets") },
      ],
    },
    sourcemap: mode == "development",
    minify: mode !== "development",
    esbuild: {
      drop: mode !== "development" ? ["console", "debugger"] : [],
    },
  },
}));
