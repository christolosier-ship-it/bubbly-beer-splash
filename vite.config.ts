import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/bubbly-beer-splash/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Bubbly Beer Splash",
        short_name: "Beer Splash",
        display: "standalone",
        background_color: "#2a1604",
        theme_color: "#2a1604",
        start_url: "/bubbly-beer-splash/",
        scope: "/bubbly-beer-splash/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "/bubbly-beer-splash/index.html",
        globPatterns: ["**/*.{html,js,css,svg,png,webp,ico,json}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
