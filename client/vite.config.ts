import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

const useHttps =
  process.env.VITE_HTTPS === "1" || process.env.VITE_HTTPS === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(useHttps ? [basicSsl()] : []),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts")) return "vendor-charts";
          if (id.includes("react-dnd") || id.includes("dnd-core") || id.includes("react-dnd-html5-backend")) return "vendor-dnd";
          if (id.includes("@mui")) return "vendor-mui";
          if (id.includes("@radix-ui") || id.includes("cmdk") || id.includes("vaul") || id.includes("embla-carousel-react")) return "vendor-ui";
          if (id.includes("date-fns") || id.includes("react-day-picker")) return "vendor-date";
          if (id.includes("motion")) return "vendor-motion";
          if (id.includes("zustand") || id.includes("next-themes")) return "vendor-state";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("lucide-react")) return "vendor-icons";
          return "vendor";
        },
      },
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
  server: {
    https: useHttps,
    host: true,
    allowedHosts: ["molecular-samiyah-unowned.ngrok-free.dev"],
    proxy: {
      "/api/auth": "http://localhost:4000",
      "/api/system": "http://localhost:4000",
      "/api/utilities": "http://localhost:4000",
      "/api/capa": "http://localhost:4000",
      "/api/audits": "http://localhost:4000",
      "/api/reports": "http://localhost:4000",
      "/api/documents": "http://localhost:4000",
      "/api/chemicals": "http://localhost:4000",
      "/api/sds": "http://localhost:4000",
      "/api/waste": "http://localhost:4000",
      "/api/wastewater": "http://localhost:4000",
      "/cdn": "http://localhost:4000",
    },
  },
});
