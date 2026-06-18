import { useEffect, useState } from "react";

import type { ViewportTier } from "./types";

function getViewportTier(width: number): ViewportTier {
  if (width < 480) return "sm";
  if (width < 1024) return "md";
  return "lg";
}

function useViewportTier(): ViewportTier {
  const [tier, setTier] = useState<ViewportTier>(() => getViewportTier(window.innerWidth));

  useEffect(() => {
    const handleResize = () => setTier(getViewportTier(window.innerWidth));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return tier;
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return visible;
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReducedMotion(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  return reducedMotion;
}

export function useAnimationEnvironment() {
  return {
    tier: useViewportTier(),
    visible: usePageVisible(),
    reducedMotion: useReducedMotion(),
  };
}
