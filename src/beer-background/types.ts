export type Triplet = [number, number, number];

export type BeerPalette = {
  name: string;
  top: Triplet;
  mid: Triplet;
  bot: Triplet;
  glow: Triplet;
  rim: Triplet;
  foamHi: Triplet;
  foamMid: Triplet;
  foamLo: Triplet;
  lightness: number;
};

export type BeerBackgroundProps = {
  beerT: number;
  bubbleDensity: number;
  foamIntensity: number;
};

export type ViewportTier = "sm" | "md" | "lg";
