import { useState, useEffect } from "react";

export function useGsapReducedMotion() {
  // Start as false (SSR-safe) — the effect corrects it on the client before
  // the first animation frame so there is no visible flicker.
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return { reducedMotion };
}
