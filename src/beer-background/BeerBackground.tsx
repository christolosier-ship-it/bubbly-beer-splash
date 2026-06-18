import { useMemo, type CSSProperties } from "react";

import { getBeerPalette, toHsl } from "./palette";
import {
  makeFoamBubbles,
  makeHeroBubbles,
  makeMainBubbles,
  makeMicroBubbles,
} from "./particles";
import type { BeerBackgroundProps, Triplet, ViewportTier } from "./types";
import { useAnimationEnvironment } from "./useAnimationEnvironment";

import "./beer-background.css";

type ParticleCaps = {
  micro: number;
  main: number;
  hero: number;
  foam: number;
};

type BeerStageStyle = CSSProperties & Record<`--${string}`, string>;

const PARTICLE_CAPS: Record<ViewportTier, ParticleCaps> = {
  sm: { micro: 50, main: 24, hero: 3, foam: 38 },
  md: { micro: 80, main: 40, hero: 4, foam: 60 },
  lg: { micro: 120, main: 60, hero: 6, foam: 85 },
};

export function BeerBackground({
  beerT,
  bubbleDensity,
  foamIntensity,
}: BeerBackgroundProps) {
  const { tier, visible, reducedMotion } = useAnimationEnvironment();
  const palette = useMemo(() => getBeerPalette(beerT), [beerT]);

  const densityStep = Math.round(bubbleDensity / 10) * 10;
  const foamStep = Math.round(foamIntensity / 10) * 10;
  const caps = PARTICLE_CAPS[tier];
  const densityRatio = densityStep / 100;

  const counts = {
    micro: Math.round(caps.micro * (0.35 + densityRatio * 0.65)),
    main: Math.round(caps.main * (0.25 + densityRatio * 0.75)),
    hero: Math.max(1, Math.round(caps.hero * (0.2 + densityRatio * 0.8))),
    foam: Math.round(caps.foam * (0.3 + (foamStep / 100) * 0.7)),
  };

  const microBubbles = useMemo(
    () => makeMicroBubbles(counts.micro, 101),
    [counts.micro],
  );
  const mainBubbles = useMemo(
    () => makeMainBubbles(counts.main, 202),
    [counts.main],
  );
  const heroBubbles = useMemo(
    () => makeHeroBubbles(counts.hero, 303),
    [counts.hero],
  );
  const foamBubbles = useMemo(
    () => makeFoamBubbles(counts.foam, 404),
    [counts.foam],
  );

  const lightness = palette.lightness;
  const foamHeight = 8 + (foamIntensity / 100) * 26;
  const microVisibility = 0.25 + lightness * 0.85;
  const causticOpacity = 0.18 + lightness * 0.45;
  const speedScale = (0.75 + lightness * 0.45) * (reducedMotion ? 0.25 : 1);
  const rimStrength = 0.35 + (1 - lightness) * 0.55;

  const stageStyle: BeerStageStyle = {
    "--liq-top": toHsl(palette.top),
    "--liq-mid": toHsl(palette.mid),
    "--liq-bot": toHsl(palette.bot),
    "--liq-glow": toHsl(palette.glow, 0.55),
    "--liq-glow-soft": toHsl(palette.glow, 0.22),
    "--liq-rim": toHsl(palette.rim, rimStrength),
    "--liq-deep": toHsl(
      [palette.bot[0], palette.bot[1], Math.max(2, palette.bot[2] - 4)] as Triplet,
      0.85,
    ),
    "--bub-tint": toHsl(palette.rim, 0.18),
    "--foam-hi": toHsl(palette.foamHi),
    "--foam-mid": toHsl(palette.foamMid),
    "--foam-lo": toHsl(palette.foamLo, 0.85),
    "--foam-lo-soft": toHsl(palette.foamLo, 0),
    "--speed": speedScale.toFixed(3),
    "--caustic-op": causticOpacity.toFixed(3),
    "--micro-vis": microVisibility.toFixed(3),
    "--foam-height": `${foamHeight}vh`,
  };

  const stageClassName = [
    "beer-stage",
    visible ? "" : "is-hidden",
    reducedMotion ? "is-reduced" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={stageClassName} style={stageStyle} aria-hidden="true">
      <div className="beer-liquid" />
      <div className="beer-depth" />
      <div className="beer-caustics c1" />
      <div className="beer-caustics c2" />
      <div className="beer-rim" />
      <div className="beer-vignette" />

      <div className="beer-shine s1" />
      <div className="beer-shine s2" />
      <div className="beer-shine s3" />

      <div className="beer-bubbles micro-layer">
        {microBubbles.map((bubble) => (
          <span
            key={bubble.i}
            className={`micro f${bubble.family}`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              opacity: bubble.opacity,
              ["--drift" as never]: `${bubble.drift}px`,
            }}
          />
        ))}
      </div>

      <div className="beer-bubbles main-layer">
        {mainBubbles.map((bubble) => (
          <span
            key={bubble.i}
            className={`bubble f${bubble.family}`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size * bubble.squash}px`,
              left: `${bubble.left}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              opacity: bubble.opacity,
              filter: bubble.blur > 0.2 ? `blur(${bubble.blur.toFixed(2)}px)` : undefined,
              ["--drift" as never]: `${bubble.drift}px`,
              ["--sx" as never]: `${bubble.shineX}%`,
              ["--sy" as never]: `${bubble.shineY}%`,
            }}
          />
        ))}
      </div>

      <div className="beer-bubbles hero-layer">
        {heroBubbles.map((bubble) => (
          <span
            key={bubble.i}
            className="hero-bubble"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              opacity: bubble.opacity,
              filter: `blur(${bubble.blur.toFixed(2)}px)`,
              ["--drift" as never]: `${bubble.drift}px`,
              ["--tilt" as never]: `${bubble.tilt}deg`,
            }}
          />
        ))}
      </div>

      <div className="beer-surface" style={{ top: "calc(var(--foam-height) - 6px)" }}>
        <div className="surface-line" />
        <div className="surface-ripple r1" />
        <div className="surface-ripple r2" />
      </div>

      <div
        className="beer-foam"
        style={{
          height: "var(--foam-height)",
          opacity: 0.5 + (foamIntensity / 100) * 0.5,
        }}
      >
        <div className="foam-layer lo" />
        <div className="foam-layer mid" />
        <div className="foam-layer hi" />
        <div className="foam-bubbles">
          {foamBubbles.map((bubble) => (
            <span
              key={bubble.i}
              className={`foam-bubble fl-${bubble.layer} fa-${bubble.family}`}
              style={{
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                left: `${bubble.left}%`,
                top: `${bubble.top}%`,
                opacity: bubble.opacity,
                animationDuration: `${bubble.duration}s`,
                animationDelay: `${bubble.delay}s`,
              }}
            />
          ))}
        </div>
        <div className="foam-edge" />
      </div>
    </div>
  );
}
