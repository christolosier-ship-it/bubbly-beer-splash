export function VitePWA(options = {}) {
  const manifest = options.manifest ?? {};
  const workbox = options.workbox ?? {};
  const registerType = options.registerType ?? "autoUpdate";
  let base = "/";
  return {
    name: "local-vite-plugin-pwa",
    apply: "build",
    configResolved(config) {
      base = config.base || "/";
    },
    transformIndexHtml(html) {
      const manifestHref = `${base.replace(/\/$/, "")}/manifest.webmanifest`;
      const registerScript =
        registerType === "autoUpdate"
          ? `<script>if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('${base}sw.js').catch(()=>{}));}</script>`
          : "";
      return html.replace(
        "</head>",
        `<link rel="manifest" href="${manifestHref}">${registerScript}</head>`,
      );
    },
    generateBundle(_, bundle) {
      this.emitFile({
        type: "asset",
        fileName: "manifest.webmanifest",
        source: JSON.stringify(manifest, null, 2),
      });
      const files = Object.keys(bundle).filter((file) =>
        /\.(html|js|css|svg|png|webp|ico|json|webmanifest)$/.test(file),
      );
      const precache = JSON.stringify(
        ["./", "index.html", "manifest.webmanifest", ...files].filter(
          (v, i, a) => a.indexOf(v) === i,
        ),
      );
      const sw = `const CACHE='bubbly-beer-splash-v1';\nconst PRECACHE=${precache};\nself.skipWaiting();\nself.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(PRECACHE)));});\nself.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});\nself.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{const copy=response.clone();if(url.origin===self.location.origin&&/\\.(html|js|css|svg|png|webp|ico|json|webmanifest)$/.test(url.pathname)){caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>{if(event.request.mode==='navigate')return caches.match('${workbox.navigateFallback || `${base}index.html`}').then(r=>r||caches.match('index.html'));return caches.match('index.html');})));});\n`;
      this.emitFile({ type: "asset", fileName: "sw.js", source: sw });
    },
  };
}
