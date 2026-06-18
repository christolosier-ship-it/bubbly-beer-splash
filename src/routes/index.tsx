import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bière – Animation" },
      { name: "description", content: "Fond animé immersif de bière : liquide, bulles, mousse." },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { property: "og:title", content: "Bière – Animation" },
      { property: "og:description", content: "Fond animé immersif de bière." },
    ],
  }),
  component: Index,
});

/* ============================================================
 * Palette de bières – interpolée le long du slider 0..100
 * ============================================================ */
type Triplet = [number, number, number];
type BeerStop = {
  t: number;
  name: string;
  top: Triplet;
  mid: Triplet;
  bot: Triplet;
  glow: Triplet;
  rim: Triplet;
  foamHi: Triplet;
  foamMid: Triplet;
  foamLo: Triplet;
  /** 0 = très sombre/dense, 1 = très claire/pétillante */
  lightness: number;
};

const BEER_STOPS: BeerStop[] = [
  { t: 0,   name: "Stout",       top: [22, 55, 10], mid: [20, 70, 5],  bot: [20, 85, 2],  glow: [28, 70, 22], rim: [35, 80, 35], foamHi: [32, 25, 78], foamMid: [30, 30, 68], foamLo: [28, 35, 55], lightness: 0.05 },
  { t: 15,  name: "Brune",       top: [24, 75, 20], mid: [22, 80, 12], bot: [20, 85, 6],  glow: [34, 75, 35], rim: [38, 85, 48], foamHi: [34, 35, 84], foamMid: [32, 38, 74], foamLo: [30, 40, 62], lightness: 0.18 },
  { t: 30,  name: "Kriek",       top: [4,  78, 32], mid: [2,  85, 20], bot: [358,90, 10], glow: [12, 85, 50], rim: [18, 90, 60], foamHi: [14, 55, 90], foamMid: [12, 55, 82], foamLo: [10, 50, 70], lightness: 0.35 },
  { t: 45,  name: "Sour orange", top: [24, 90, 52], mid: [22, 92, 36], bot: [20, 92, 20], glow: [32, 95, 65], rim: [38, 95, 72], foamHi: [30, 80, 94], foamMid: [28, 75, 88], foamLo: [26, 70, 78], lightness: 0.55 },
  { t: 60,  name: "Ambrée",      top: [38, 90, 56], mid: [34, 88, 42], bot: [30, 85, 24], glow: [44, 95, 70], rim: [48, 95, 78], foamHi: [42, 80, 95], foamMid: [40, 75, 90], foamLo: [36, 65, 80], lightness: 0.65 },
  { t: 80,  name: "Blonde",      top: [48, 95, 64], mid: [44, 92, 50], bot: [40, 88, 30], glow: [52, 95, 80], rim: [54, 95, 86], foamHi: [50, 85, 97], foamMid: [48, 80, 92], foamLo: [44, 70, 84], lightness: 0.82 },
  { t: 100, name: "Pâle",        top: [56, 90, 84], mid: [52, 80, 70], bot: [48, 70, 48], glow: [58, 95, 92], rim: [58, 95, 95], foamHi: [54, 60, 98], foamMid: [52, 55, 95], foamLo: [50, 45, 88], lightness: 0.98 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: Triplet, b: Triplet, t: number): Triplet => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const hsl = ([h, s, l]: Triplet, alpha = 1) =>
  alpha < 1 ? `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}% / ${alpha})` : `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;

function pickBeer(t: number) {
  const c = Math.max(0, Math.min(100, t));
  let a = BEER_STOPS[0];
  let b = BEER_STOPS[BEER_STOPS.length - 1];
  for (let i = 0; i < BEER_STOPS.length - 1; i++) {
    if (c >= BEER_STOPS[i].t && c <= BEER_STOPS[i + 1].t) {
      a = BEER_STOPS[i];
      b = BEER_STOPS[i + 1];
      break;
    }
  }
  const lt = (c - a.t) / Math.max(1, b.t - a.t);
  return {
    name: lt < 0.5 ? a.name : b.name,
    top: lerp3(a.top, b.top, lt),
    mid: lerp3(a.mid, b.mid, lt),
    bot: lerp3(a.bot, b.bot, lt),
    glow: lerp3(a.glow, b.glow, lt),
    rim: lerp3(a.rim, b.rim, lt),
    foamHi: lerp3(a.foamHi, b.foamHi, lt),
    foamMid: lerp3(a.foamMid, b.foamMid, lt),
    foamLo: lerp3(a.foamLo, b.foamLo, lt),
    lightness: lerp(a.lightness, b.lightness, lt),
  };
}

/* ============================================================
 * PRNG déterministe (mulberry32) – stabilité React
 * ============================================================ */
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================================================
 * Particules – types
 * ============================================================ */
type MicroBubble = { i: number; size: number; left: number; duration: number; delay: number; drift: number; opacity: number; family: 1 | 2 | 3 | 4 };
type MainBubble = {
  i: number; size: number; left: number; duration: number; delay: number;
  drift: number; opacity: number; blur: number; squash: number; family: 1 | 2 | 3 | 4;
  shineX: number; shineY: number; tint: number;
};
type HeroBubble = { i: number; size: number; left: number; duration: number; delay: number; drift: number; opacity: number; blur: number; tilt: number };
type FoamBubble = {
  i: number; size: number; left: number; top: number; opacity: number;
  duration: number; delay: number; family: 1 | 2 | 3 | 4; layer: "hi" | "mid" | "lo"; tint: number;
};

function makeMicro(count: number, seed: number): MicroBubble[] {
  const r = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    i,
    size: 1.2 + r() * 3.2,
    left: r() * 100,
    duration: 14 + r() * 18,
    delay: -r() * 30,
    drift: (r() - 0.5) * 18,
    opacity: 0.12 + r() * 0.35,
    family: (1 + Math.floor(r() * 4)) as 1 | 2 | 3 | 4,
  }));
}

function makeMain(count: number, seed: number): MainBubble[] {
  const r = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const depth = r(); // 0 = loin, 1 = proche
    return {
      i,
      size: 5 + depth * 22 + r() * 6,
      left: r() * 100,
      duration: 7 + (1 - depth) * 8 + r() * 4,
      delay: -r() * 22,
      drift: (r() - 0.5) * 60,
      opacity: 0.35 + depth * 0.5,
      blur: (1 - depth) * 1.6,
      squash: 0.92 + r() * 0.16,
      family: (1 + Math.floor(r() * 4)) as 1 | 2 | 3 | 4,
      shineX: 22 + r() * 24,
      shineY: 20 + r() * 22,
      tint: r(),
    };
  });
}

function makeHero(count: number, seed: number): HeroBubble[] {
  const r = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    i,
    size: 36 + r() * 44,
    left: r() * 100,
    duration: 5 + r() * 4,
    delay: -r() * 12,
    drift: (r() - 0.5) * 120,
    opacity: 0.18 + r() * 0.18,
    blur: 2 + r() * 3,
    tilt: (r() - 0.5) * 30,
  }));
}

function makeFoam(count: number, seed: number): FoamBubble[] {
  const r = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const topPct = r() * 100;
    const layer: FoamBubble["layer"] = topPct < 35 ? "hi" : topPct < 75 ? "mid" : "lo";
    const baseSize = layer === "hi" ? 4 + r() * 10 : layer === "mid" ? 8 + r() * 22 : 14 + r() * 34;
    return {
      i,
      size: baseSize,
      left: r() * 100,
      top: topPct,
      opacity: layer === "hi" ? 0.7 + r() * 0.3 : layer === "mid" ? 0.55 + r() * 0.4 : 0.35 + r() * 0.45,
      duration: 4 + r() * 8,
      delay: -r() * 10,
      family: (1 + Math.floor(r() * 4)) as 1 | 2 | 3 | 4,
      layer,
      tint: r(),
    };
  });
}

/* ============================================================
 * Hooks
 * ============================================================ */
function useViewportTier(): "sm" | "md" | "lg" {
  const [tier, setTier] = useState<"sm" | "md" | "lg">("lg");
  useEffect(() => {
    const w0 = window.innerWidth;
    setTier(w0 < 480 ? "sm" : w0 < 1024 ? "md" : "lg");
    const onR = () => {
      const w = window.innerWidth;
      setTier(w < 480 ? "sm" : w < 1024 ? "md" : "lg");
    };
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return tier;
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const on = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return visible;
}

function useReducedMotion(): boolean {
  const [rm, setRm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setRm(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return rm;
}

/* ============================================================
 * Composant principal
 * ============================================================ */
function Index() {
  const [beerT, setBeerT] = useState(60);
  const [bubbleDensity, setBubbleDensity] = useState(60);
  const [foamIntensity, setFoamIntensity] = useState(60);
  const [panelOpen, setPanelOpen] = useState(true);

  const tier = useViewportTier();
  const visible = usePageVisible();
  const reducedMotion = useReducedMotion();

  /* Paliers internes pour ne pas regénérer à chaque pixel du slider */
  const densityStep = Math.round(bubbleDensity / 10) * 10; // pas de 10
  const foamStep = Math.round(foamIntensity / 10) * 10;

  /* Plafonds adaptatifs */
  const caps = useMemo(() => {
    if (tier === "sm") return { micro: 50, main: 24, hero: 3, foam: 38 };
    if (tier === "md") return { micro: 80, main: 40, hero: 4, foam: 60 };
    return { micro: 120, main: 60, hero: 6, foam: 85 };
  }, [tier]);

  /* Quantités */
  const counts = useMemo(() => {
    const d = densityStep / 100;
    return {
      micro: Math.round(caps.micro * (0.35 + d * 0.65)),
      main: Math.round(caps.main * (0.25 + d * 0.75)),
      hero: Math.max(1, Math.round(caps.hero * (0.2 + d * 0.8))),
      foam: Math.round(caps.foam * (0.3 + (foamStep / 100) * 0.7)),
    };
  }, [densityStep, foamStep, caps]);

  /* Particules – stables tant que counts ne change pas */
  const micro = useMemo(() => makeMicro(counts.micro, 101), [counts.micro]);
  const main = useMemo(() => makeMain(counts.main, 202), [counts.main]);
  const hero = useMemo(() => makeHero(counts.hero, 303), [counts.hero]);
  const foam = useMemo(() => makeFoam(counts.foam, 404), [counts.foam]);

  const colors = useMemo(() => pickBeer(beerT), [beerT]);

  /* Hauteur de mousse pilotée par l'intensité */
  const foamHeightVh = 8 + (foamIntensity / 100) * 26;

  /* Comportement adapté à la couleur :
   * - sombre : moins de microbulles visibles, reflets plus chauds, mouvements ralentis
   * - claire : microbulles plus visibles, caustiques plus présentes
   */
  const L = colors.lightness;
  const microVisibility = 0.25 + L * 0.85;       // 0.25 -> 1.1
  const causticOpacity = 0.18 + L * 0.45;        // 0.18 -> 0.63
  const speedScale = (0.75 + L * 0.45) * (reducedMotion ? 0.25 : 1); // sombre = lent
  const rimStrength = 0.35 + (1 - L) * 0.55;     // sombre = rim plus fort

  /* Variables CSS — regroupées : liquide / bulles / mousse */
  const stageStyle = {
    /* --- LIQUIDE --- */
    ["--liq-top" as never]: hsl(colors.top),
    ["--liq-mid" as never]: hsl(colors.mid),
    ["--liq-bot" as never]: hsl(colors.bot),
    ["--liq-glow" as never]: hsl(colors.glow, 0.55),
    ["--liq-glow-soft" as never]: hsl(colors.glow, 0.22),
    ["--liq-rim" as never]: hsl(colors.rim, rimStrength),
    ["--liq-deep" as never]: hsl([colors.bot[0], colors.bot[1], Math.max(2, colors.bot[2] - 4)] as Triplet, 0.85),
    /* --- BULLES --- */
    ["--bub-tint" as never]: hsl(colors.rim, 0.18),
    ["--bub-core" as never]: hsl([colors.rim[0], 40, 96] as Triplet, 0.9),
    /* --- MOUSSE --- */
    ["--foam-hi" as never]: hsl(colors.foamHi),
    ["--foam-mid" as never]: hsl(colors.foamMid),
    ["--foam-lo" as never]: hsl(colors.foamLo, 0.85),
    ["--foam-lo-soft" as never]: hsl(colors.foamLo, 0),
    /* --- DIVERS --- */
    ["--speed" as never]: speedScale.toFixed(3),
    ["--caustic-op" as never]: causticOpacity.toFixed(3),
    ["--micro-vis" as never]: microVisibility.toFixed(3),
    ["--foam-height" as never]: `${foamHeightVh}vh`,
    animationPlayState: visible ? "running" : "paused",
  } as React.CSSProperties;

  /* Pause CSS globale quand l'onglet est caché ou prefers-reduced-motion */
  const stageClass = [
    "beer-stage",
    visible ? "" : "is-hidden",
    reducedMotion ? "is-reduced" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className={stageClass} style={stageStyle}>
      {/* === LIQUIDE === */}
      <div className="beer-liquid" aria-hidden />
      <div className="beer-depth" aria-hidden />
      <div className="beer-caustics c1" aria-hidden />
      <div className="beer-caustics c2" aria-hidden />
      <div className="beer-rim" aria-hidden />
      <div className="beer-vignette" aria-hidden />

      {/* === REFLETS subtils, plusieurs, non synchronisés === */}
      <div className="beer-shine s1" aria-hidden />
      <div className="beer-shine s2" aria-hidden />
      <div className="beer-shine s3" aria-hidden />

      {/* === MICRO-BULLES (arrière-plan) === */}
      <div className="beer-bubbles micro-layer" aria-hidden>
        {micro.map((b) => (
          <span
            key={b.i}
            className={`micro f${b.family}`}
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              opacity: b.opacity,
              ["--drift" as never]: `${b.drift}px`,
            }}
          />
        ))}
      </div>

      {/* === BULLES PRINCIPALES === */}
      <div className="beer-bubbles main-layer" aria-hidden>
        {main.map((b) => (
          <span
            key={b.i}
            className={`bubble f${b.family}`}
            style={{
              width: `${b.size}px`,
              height: `${b.size * b.squash}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              opacity: b.opacity,
              filter: b.blur > 0.2 ? `blur(${b.blur.toFixed(2)}px)` : undefined,
              ["--drift" as never]: `${b.drift}px`,
              ["--sx" as never]: `${b.shineX}%`,
              ["--sy" as never]: `${b.shineY}%`,
              ["--tint" as never]: b.tint.toFixed(2),
            }}
          />
        ))}
      </div>

      {/* === BULLES DE PREMIER PLAN === */}
      <div className="beer-bubbles hero-layer" aria-hidden>
        {hero.map((b) => (
          <span
            key={b.i}
            className="hero-bubble"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
              opacity: b.opacity,
              filter: `blur(${b.blur.toFixed(2)}px)`,
              ["--drift" as never]: `${b.drift}px`,
              ["--tilt" as never]: `${b.tilt}deg`,
            }}
          />
        ))}
      </div>

      {/* === SURFACE === */}
      <div className="beer-surface" aria-hidden style={{ top: `calc(var(--foam-height) - 6px)` }}>
        <div className="surface-line" />
        <div className="surface-ripple r1" />
        <div className="surface-ripple r2" />
      </div>

      {/* === MOUSSE multi-couches === */}
      <div
        className="beer-foam"
        aria-hidden
        style={{ height: `var(--foam-height)`, opacity: 0.5 + (foamIntensity / 100) * 0.5 }}
      >
        <div className="foam-layer lo" />
        <div className="foam-layer mid" />
        <div className="foam-layer hi" />
        <div className="foam-bubbles">
          {foam.map((b) => (
            <span
              key={b.i}
              className={`foam-bubble fl-${b.layer} fa-${b.family}`}
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                left: `${b.left}%`,
                top: `${b.top}%`,
                opacity: b.opacity,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="foam-edge" />
      </div>

      {/* === PANNEAU DE RÉGLAGES === */}
      <button
        type="button"
        className="beer-toggle"
        onClick={() => setPanelOpen((v) => !v)}
        aria-expanded={panelOpen}
        aria-controls="beer-controls"
      >
        {panelOpen ? "Masquer" : "Réglages"}
      </button>

      {panelOpen && (
        <section id="beer-controls" className="beer-controls" aria-label="Réglages de la bière">
          <header>
            <h1>Réglages</h1>
          </header>

          <label>
            <span>Couleur du liquide</span>
            <input
              type="range"
              min={0}
              max={100}
              value={beerT}
              onChange={(e) => setBeerT(Number(e.target.value))}
              aria-label="Couleur du liquide"
            />
            <small>{colors.name}</small>
          </label>

          <label>
            <span>Densité des bulles</span>
            <input
              type="range"
              min={0}
              max={100}
              value={bubbleDensity}
              onChange={(e) => setBubbleDensity(Number(e.target.value))}
              aria-label="Densité des bulles"
            />
            <small>{bubbleDensity}%</small>
          </label>

          <label>
            <span>Intensité de la mousse</span>
            <input
              type="range"
              min={0}
              max={100}
              value={foamIntensity}
              onChange={(e) => setFoamIntensity(Number(e.target.value))}
              aria-label="Intensité de la mousse"
            />
            <small>{foamIntensity}%</small>
          </label>
        </section>
      )}
    </main>
  );
}