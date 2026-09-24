import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// Dev: Vite serves the SPA on 5173 and proxies /api to the Express API on 3001.
export default defineConfig({
  plugins: [solid()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
