// vite.config.ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
  server: { allowedHosts: ["swamp.lavrentious.ru", "localhost"] },
  plugins: [react()],
  resolve: {
    alias: {
      src: "/src",
    },
  },
  define: {
    global: "window",
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
