import gsap from "gsap";
import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useGsapReducedMotion } from "./useGsapReducedMotion";

export function useChevronAnimation(open: boolean) {
  const chevronRef = useRef<SVGSVGElement>(null);
  const { reducedMotion } = useGsapReducedMotion();

  useIsomorphicLayoutEffect(() => {
    if (!chevronRef.current) return;
    gsap.to(chevronRef.current, {
      rotation: open ? 180 : 0,
      duration: reducedMotion ? 0 : 0.15,
      ease: "power2.inOut",
      transformOrigin: "center",
    });
  }, [open, reducedMotion]);

  return chevronRef;
}
