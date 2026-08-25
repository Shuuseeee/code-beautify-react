import gsap from "gsap";
import { useRef, useCallback } from "react";
import { useGsapReducedMotion } from "./useGsapReducedMotion";

export function useShakeAnimation() {
  const elementRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const { reducedMotion } = useGsapReducedMotion();

  const triggerShake = useCallback(() => {
    if (!elementRef.current) return;
    if (tlRef.current) tlRef.current.kill();

    if (reducedMotion) {
      gsap.fromTo(
        elementRef.current,
        { outline: "2px solid var(--danger, #ef4444)" },
        { outline: "2px solid transparent", duration: 0.4, clearProps: "outline" }
      );
      return;
    }

    tlRef.current = gsap
      .timeline()
      .to(elementRef.current, { x: -2, duration: 0.032 })
      .to(elementRef.current, { x: 4, duration: 0.032 })
      .to(elementRef.current, { x: -6, duration: 0.032 })
      .to(elementRef.current, { x: 6, duration: 0.032 })
      .to(elementRef.current, { x: -6, duration: 0.032 })
      .to(elementRef.current, { x: 6, duration: 0.032 })
      .to(elementRef.current, { x: -6, duration: 0.032 })
      .to(elementRef.current, { x: 0, duration: 0.064, ease: "elastic.out(1, 0.5)" });
  }, [reducedMotion]);

  return { elementRef, triggerShake };
}
