type AnimationFamily = 1 | 2 | 3 | 4;

type MicroBubble = {
  i: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  family: AnimationFamily;
};

type MainBubble = {
  i: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  blur: number;
  squash: number;
  family: AnimationFamily;
  shineX: number;
  shineY: number;
};

type HeroBubble = {
  i: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  blur: number;
  tilt: number;
};

type FoamBubble = {
  i: number;
  size: number;
  left: number;
  top: number;
  opacity: number;
  duration: number;
  delay: number;
  family: AnimationFamily;
  layer: "hi" | "mid" | "lo";
};

function mulberry32(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const randomFamily = (random: () => number) =>
  (1 + Math.floor(random() * 4)) as AnimationFamily;

export function makeMicroBubbles(count: number, seed: number): MicroBubble[] {
  const random = mulberry32(seed);

  return Array.from({ length: count }, (_, i) => ({
    i,
    size: 1.2 + random() * 3.2,
    left: random() * 100,
    duration: 14 + random() * 18,
    delay: -random() * 30,
    drift: (random() - 0.5) * 18,
    opacity: 0.12 + random() * 0.35,
    family: randomFamily(random),
  }));
}

export function makeMainBubbles(count: number, seed: number): MainBubble[] {
  const random = mulberry32(seed);

  return Array.from({ length: count }, (_, i) => {
    const depth = random();

    return {
      i,
      size: 5 + depth * 22 + random() * 6,
      left: random() * 100,
      duration: 7 + (1 - depth) * 8 + random() * 4,
      delay: -random() * 22,
      drift: (random() - 0.5) * 60,
      opacity: 0.35 + depth * 0.5,
      blur: (1 - depth) * 1.6,
      squash: 0.92 + random() * 0.16,
      family: randomFamily(random),
      shineX: 22 + random() * 24,
      shineY: 20 + random() * 22,
    };
  });
}

export function makeHeroBubbles(count: number, seed: number): HeroBubble[] {
  const random = mulberry32(seed);

  return Array.from({ length: count }, (_, i) => ({
    i,
    size: 36 + random() * 44,
    left: random() * 100,
    duration: 5 + random() * 4,
    delay: -random() * 12,
    drift: (random() - 0.5) * 120,
    opacity: 0.18 + random() * 0.18,
    blur: 2 + random() * 3,
    tilt: (random() - 0.5) * 30,
  }));
}

export function makeFoamBubbles(count: number, seed: number): FoamBubble[] {
  const random = mulberry32(seed);

  return Array.from({ length: count }, (_, i) => {
    const top = random() * 100;
    const layer: FoamBubble["layer"] = top < 35 ? "hi" : top < 75 ? "mid" : "lo";
    const size = layer === "hi" ? 4 + random() * 10 : layer === "mid" ? 8 + random() * 22 : 14 + random() * 34;

    return {
      i,
      size,
      left: random() * 100,
      top,
      opacity:
        layer === "hi"
          ? 0.7 + random() * 0.3
          : layer === "mid"
            ? 0.55 + random() * 0.4
            : 0.35 + random() * 0.45,
      duration: 4 + random() * 8,
      delay: -random() * 10,
      family: randomFamily(random),
      layer,
    };
  });
}
