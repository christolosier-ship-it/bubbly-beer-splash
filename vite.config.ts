import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "Bubbly Beer Splash",
        short_name: "Beer Splash",
        display: "standalone",
        background_color: "#2a1604",
        theme_color: "#2a1604",
        start_url: "./",
        scope: "./",
      },
      workbox: {
        cacheId: "bubbly-beer-splash-v2-portable",
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "index.html",
        globPatterns: ["**/*.{html,js,css,svg,webp,ico,json,webmanifest}"],
      },
    }),
  ],
});
