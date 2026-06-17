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

function Index() {
  const [hue, setHue] = useState(38); // 0-60: rouge ambré -> jaune pâle
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

  // Couleurs du liquide dérivées de la teinte (hue)
  const liquidStyle = {
    ["--beer-h" as never]: `${hue}`,
  } as React.CSSProperties;

  return (
    <main className="beer-stage" style={liquidStyle}>
      <div className="beer-liquid" aria-hidden />
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
              max={60}
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
            />
            <small>
              {hue < 20 ? "Brune" : hue < 40 ? "Ambrée" : "Blonde"}
            </small>
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
