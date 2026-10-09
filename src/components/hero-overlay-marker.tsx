"use client";

import { useLayoutEffect } from "react";

/**
 * Tells the site header it sits over a photo hero. Next keeps visited pages mounted but hidden,
 * so a DOM marker alone would leak onto other routes; effects are torn down while hidden.
 */
export function HeroOverlayMarker() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.dataset.hero = "on";
    return () => {
      delete html.dataset.hero;
    };
  }, []);
  return null;
}
