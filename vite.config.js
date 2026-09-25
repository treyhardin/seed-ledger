import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

// DEMO_MODE=true at build time (e.g. a Vercel env var) builds a self-contained,
// read-only demo: built-in demo data, no API calls, no seed editing.
const DEMO_MODE = /^(1|true|yes)$/i.test(process.env.DEMO_MODE || "");

// Dev: Vite serves the SPA on 5173 and proxies /api to the Express API on 3001.
export default defineConfig({
  plugins: [solid()],
  define: { __DEMO_MODE__: JSON.stringify(DEMO_MODE) },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
