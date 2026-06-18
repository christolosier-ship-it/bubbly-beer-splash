import { useEffect, useState } from "react";

const STORAGE_KEYS = {
  beerT: "bubbly-beer-splash:beerT",
  bubbleDensity: "bubbly-beer-splash:bubbleDensity",
  foamIntensity: "bubbly-beer-splash:foamIntensity",
  panelOpen: "bubbly-beer-splash:panelOpen",
} as const;

function clampSetting(value: unknown, fallback: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, parsed));
}

function readNumber(key: string, fallback: number): number {
  try {
    return clampSetting(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function readBoolean(key: string, fallback: boolean): boolean {
  try {
    const value = window.localStorage.getItem(key);
    if (value === "true") return true;
    if (value === "false") return false;
  } catch {
    return fallback;
  }

  return fallback;
}

function writeSetting(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The prototype remains usable when storage is unavailable.
  }
}

export function usePrototypeSettings() {
  const [beerT, setBeerT] = useState(() => readNumber(STORAGE_KEYS.beerT, 60));
  const [bubbleDensity, setBubbleDensity] = useState(() =>
    readNumber(STORAGE_KEYS.bubbleDensity, 60),
  );
  const [foamIntensity, setFoamIntensity] = useState(() =>
    readNumber(STORAGE_KEYS.foamIntensity, 60),
  );
  const [panelOpen, setPanelOpen] = useState(() =>
    readBoolean(STORAGE_KEYS.panelOpen, true),
  );

  useEffect(() => {
    writeSetting(STORAGE_KEYS.beerT, String(clampSetting(beerT, 60)));
  }, [beerT]);

  useEffect(() => {
    writeSetting(
      STORAGE_KEYS.bubbleDensity,
      String(clampSetting(bubbleDensity, 60)),
    );
  }, [bubbleDensity]);

  useEffect(() => {
    writeSetting(
      STORAGE_KEYS.foamIntensity,
      String(clampSetting(foamIntensity, 60)),
    );
  }, [foamIntensity]);

  useEffect(() => {
    writeSetting(STORAGE_KEYS.panelOpen, String(panelOpen));
  }, [panelOpen]);

  return {
    beerT,
    setBeerT,
    bubbleDensity,
    setBubbleDensity,
    foamIntensity,
    setFoamIntensity,
    panelOpen,
    setPanelOpen,
  };
}
