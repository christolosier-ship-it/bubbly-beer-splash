import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bière – Animation" },
      { name: "description", content: "Fond animé de bière avec bulles et mousse." },
      { property: "og:title", content: "Bière – Animation" },
      { property: "og:description", content: "Fond animé de bière avec bulles et mousse." },
    ],
  }),
  component: Index,
});

// Palette de bières le long du slider 0..100
// Chaque arrêt définit les couleurs clé du liquide.
type BeerStop = {
  t: number;
  name: string;
  top: [number, number, number];
  mid: [number, number, number];
  bot: [number, number, number];
  glow: [number, number, number];
  foam: [number, number, number];
};

const BEER_STOPS: BeerStop[] = [
  // Stout très foncée
  { t: 0,   name: "Stout",       top: [20, 60, 8],  mid: [20, 70, 4],  bot: [20, 80, 2],  glow: [30, 60, 18], foam: [30, 35, 70] },
  // Brown ale
  { t: 15,  name: "Brune",       top: [22, 75, 18], mid: [22, 80, 10], bot: [20, 85, 5],  glow: [32, 70, 32], foam: [32, 40, 80] },
  // Kriek (rouge cerise)
  { t: 30,  name: "Kriek",       top: [2,  75, 32], mid: [2,  85, 20], bot: [0,  90, 10], glow: [10, 80, 50], foam: [12, 55, 88] },
  // Sour orange
  { t: 45,  name: "Sour orange", top: [22, 90, 50], mid: [22, 90, 35], bot: [20, 90, 18], glow: [30, 95, 65], foam: [28, 80, 92] },
  // Ambrée
  { t: 60,  name: "Ambrée",      top: [36, 90, 55], mid: [34, 85, 40], bot: [30, 85, 22], glow: [42, 95, 70], foam: [40, 80, 94] },
  // Blonde
  { t: 80,  name: "Blonde",      top: [48, 95, 62], mid: [44, 90, 48], bot: [40, 85, 28], glow: [52, 95, 78], foam: [48, 85, 96] },
  // Très pâle, presque blanche
  { t: 100, name: "Pâle",        top: [55, 90, 82], mid: [52, 80, 68], bot: [48, 70, 45], glow: [58, 95, 90], foam: [55, 60, 98] },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function lerpHsl(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}
function hsl([h, s, l]: [number, number, number], alpha = 1) {
  return alpha < 1 ? `hsl(${h} ${s}% ${l}% / ${alpha})` : `hsl(${h} ${s}% ${l}%)`;
}
function pickBeerColors(t: number) {
  const clamped = Math.max(0, Math.min(100, t));
  let a = BEER_STOPS[0];
  let b = BEER_STOPS[BEER_STOPS.length - 1];
  for (let i = 0; i < BEER_STOPS.length - 1; i++) {
    if (clamped >= BEER_STOPS[i].t && clamped <= BEER_STOPS[i + 1].t) {
      a = BEER_STOPS[i];
      b = BEER_STOPS[i + 1];
      break;
    }
  }
  const localT = (clamped - a.t) / Math.max(1, b.t - a.t);
  return {
    name: localT < 0.5 ? a.name : b.name,
    top: lerpHsl(a.top, b.top, localT),
    mid: lerpHsl(a.mid, b.mid, localT),
    bot: lerpHsl(a.bot, b.bot, localT),
    glow: lerpHsl(a.glow, b.glow, localT),
    foam: lerpHsl(a.foam, b.foam, localT),
  };
}

function Index() {
  const [beerT, setBeerT] = useState(60); // 0 stout -> 100 très pâle
  const [bubbleDensity, setBubbleDensity] = useState(40); // nb de bulles
  const [foamIntensity, setFoamIntensity] = useState(60); // 0-100
  const [panelOpen, setPanelOpen] = useState(true);

  // Régénère les bulles quand la densité change
  const bubbles = useMemo(
    () =>
      Array.from({ length: bubbleDensity }, (_, i) => ({
        i,
        size: 6 + Math.random() * 22,
        left: Math.random() * 100,
        duration: 4 + Math.random() * 8,
        delay: Math.random() * 10,
        drift: (Math.random() - 0.5) * 40,
      })),
    [bubbleDensity]
  );

  const foamBubbles = useMemo(
    () =>
      Array.from({ length: Math.round(20 + foamIntensity * 0.8) }, (_, i) => ({
        i,
        size: 14 + Math.random() * 46,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: 0.55 + Math.random() * 0.45,
      })),
    [foamIntensity]
  );

  // Hauteur de la mousse pilotée par l'intensité
  const foamHeightVh = 8 + (foamIntensity / 100) * 26; // 8vh -> 34vh

  const colors = useMemo(() => pickBeerColors(beerT), [beerT]);

  // Variables CSS pour le rendu du liquide
  const liquidStyle = {
    ["--liq-top" as never]: hsl(colors.top),
    ["--liq-mid" as never]: hsl(colors.mid),
    ["--liq-bot" as never]: hsl(colors.bot),
    ["--liq-glow" as never]: hsl(colors.glow, 0.55),
    ["--liq-glow-soft" as never]: hsl(colors.glow, 0.25),
    ["--foam-color" as never]: hsl(colors.foam),
    ["--foam-color-soft" as never]: hsl(colors.foam, 0.0),
  } as React.CSSProperties;

  return (
    <main className="beer-stage" style={liquidStyle}>
      <div className="beer-liquid" aria-hidden />
      <div className="beer-caustics" aria-hidden />
      <div className="beer-surface" aria-hidden />
      <div className="beer-shine" aria-hidden />
      <div className="beer-bubbles" aria-hidden>
        {bubbles.map((b) => (
          <span
            key={b.i}
            className="bubble"
            style={{
              width: `${b.size}px`,
              height: `${b.size}px`,
              left: `${b.left}%`,
              animationDuration: `${b.duration}s`,
              animationDelay: `-${b.delay}s`,
              ["--drift" as never]: `${b.drift}px`,
            }}
          />
        ))}
      </div>
      <div
        className="beer-foam"
        aria-hidden
        style={{ height: `${foamHeightVh}vh`, opacity: 0.4 + (foamIntensity / 100) * 0.6 }}
      >
        <div className="foam-base" />
        <div className="foam-bubbles">
          {foamBubbles.map((b) => (
            <span
              key={b.i}
              style={{
                width: `${b.size}px`,
                height: `${b.size}px`,
                left: `${b.left}%`,
                top: `${b.top}%`,
                opacity: b.opacity,
              }}
            />
          ))}
        </div>
      </div>

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
            />
            <small>{colors.name}</small>
          </label>

          <label>
            <span>Densité des bulles</span>
            <input
              type="range"
              min={0}
              max={150}
              value={bubbleDensity}
              onChange={(e) => setBubbleDensity(Number(e.target.value))}
            />
            <small>{bubbleDensity} bulles</small>
          </label>

          <label>
            <span>Intensité de la mousse</span>
            <input
              type="range"
              min={0}
              max={100}
              value={foamIntensity}
              onChange={(e) => setFoamIntensity(Number(e.target.value))}
            />
            <small>{foamIntensity}%</small>
          </label>
        </section>
      )}
    </main>
  );
}
