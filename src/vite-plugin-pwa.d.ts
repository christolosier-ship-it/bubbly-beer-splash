declare module "vite-plugin-pwa" {
  import type { Plugin } from "vite";
  export function VitePWA(options?: Record<string, unknown>): Plugin;
}
