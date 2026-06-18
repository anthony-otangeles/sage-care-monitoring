import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5174;
const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "127.0.0.1",
    allowedHosts: true,
  },
  preview: {
    port,
    host: "127.0.0.1",
    allowedHosts: true,
  },
});
