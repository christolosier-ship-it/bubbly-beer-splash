import type { BeerPalette, Triplet } from "./types";

type BeerStop = BeerPalette & {
  t: number;
};

const BEER_STOPS: BeerStop[] = [
  {
    t: 0,
    name: "Stout",
    top: [22, 55, 10],
    mid: [20, 70, 5],
    bot: [20, 85, 2],
    glow: [28, 70, 22],
    rim: [35, 80, 35],
    foamHi: [32, 25, 78],
    foamMid: [30, 30, 68],
    foamLo: [28, 35, 55],
    lightness: 0.05,
  },
  {
    t: 15,
    name: "Brune",
    top: [24, 75, 20],
    mid: [22, 80, 12],
    bot: [20, 85, 6],
    glow: [34, 75, 35],
    rim: [38, 85, 48],
    foamHi: [34, 35, 84],
    foamMid: [32, 38, 74],
    foamLo: [30, 40, 62],
    lightness: 0.18,
  },
  {
    t: 30,
    name: "Kriek",
    top: [4, 78, 32],
    mid: [2, 85, 20],
    bot: [358, 90, 10],
    glow: [12, 85, 50],
    rim: [18, 90, 60],
    foamHi: [14, 55, 90],
    foamMid: [12, 55, 82],
    foamLo: [10, 50, 70],
    lightness: 0.35,
  },
  {
    t: 45,
    name: "Sour orange",
    top: [24, 90, 52],
    mid: [22, 92, 36],
    bot: [20, 92, 20],
    glow: [32, 95, 65],
    rim: [38, 95, 72],
    foamHi: [30, 80, 94],
    foamMid: [28, 75, 88],
    foamLo: [26, 70, 78],
    lightness: 0.55,
  },
  {
    t: 60,
    name: "Ambrée",
    top: [38, 90, 56],
    mid: [34, 88, 42],
    bot: [30, 85, 24],
    glow: [44, 95, 70],
    rim: [48, 95, 78],
    foamHi: [42, 80, 95],
    foamMid: [40, 75, 90],
    foamLo: [36, 65, 80],
    lightness: 0.65,
  },
  {
    t: 80,
    name: "Blonde",
    top: [48, 95, 64],
    mid: [44, 92, 50],
    bot: [40, 88, 30],
    glow: [52, 95, 80],
    rim: [54, 95, 86],
    foamHi: [50, 85, 97],
    foamMid: [48, 80, 92],
    foamLo: [44, 70, 84],
    lightness: 0.82,
  },
  {
    t: 100,
    name: "Pâle",
    top: [56, 90, 84],
    mid: [52, 80, 70],
    bot: [48, 70, 48],
    glow: [58, 95, 92],
    rim: [58, 95, 95],
    foamHi: [54, 60, 98],
    foamMid: [52, 55, 95],
    foamLo: [50, 45, 88],
    lightness: 0.98,
  },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpTriplet = (a: Triplet, b: Triplet, t: number): Triplet => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export function toHsl([h, s, l]: Triplet, alpha = 1): string {
  return alpha < 1
    ? `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}% / ${alpha})`
    : `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;
}

export function getBeerPalette(value: number): BeerPalette {
  const clamped = Math.max(0, Math.min(100, value));
  let start = BEER_STOPS[0];
  let end = BEER_STOPS[BEER_STOPS.length - 1];

  for (let index = 0; index < BEER_STOPS.length - 1; index += 1) {
    if (clamped >= BEER_STOPS[index].t && clamped <= BEER_STOPS[index + 1].t) {
      start = BEER_STOPS[index];
      end = BEER_STOPS[index + 1];
      break;
    }
  }

  const progress = (clamped - start.t) / Math.max(1, end.t - start.t);

  return {
    name: progress < 0.5 ? start.name : end.name,
    top: lerpTriplet(start.top, end.top, progress),
    mid: lerpTriplet(start.mid, end.mid, progress),
    bot: lerpTriplet(start.bot, end.bot, progress),
    glow: lerpTriplet(start.glow, end.glow, progress),
    rim: lerpTriplet(start.rim, end.rim, progress),
    foamHi: lerpTriplet(start.foamHi, end.foamHi, progress),
    foamMid: lerpTriplet(start.foamMid, end.foamMid, progress),
    foamLo: lerpTriplet(start.foamLo, end.foamLo, progress),
    lightness: lerp(start.lightness, end.lightness, progress),
  };
}
