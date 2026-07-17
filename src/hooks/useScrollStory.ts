import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { computeStormFactor, weatherState } from "../state/weatherState";

gsap.registerPlugin(ScrollTrigger);

/**
 * Drives weatherState.progress off the scroll position of the tall spacer
 * behind the pinned hero. Sticky positioning (see App.tsx) handles the
 * visual pin; ScrollTrigger here only measures progress through it.
 */
export function useScrollStory(spacerSelector: string) {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    weatherState.reducedMotion = mql.matches;
    const onChange = (e: MediaQueryListEvent) => {
      weatherState.reducedMotion = e.matches;
    };
    mql.addEventListener("change", onChange);

    if (mql.matches) {
      // Skip the scroll-driven story; render a fixed calm frame.
      weatherState.progress = 0;
      weatherState.stormFactor = 0;
      return () => mql.removeEventListener("change", onChange);
    }

    const trigger = ScrollTrigger.create({
      trigger: spacerSelector,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => {
        weatherState.progress = self.progress;
        weatherState.stormFactor = computeStormFactor(self.progress);
      },
    });

    return () => {
      trigger.kill();
      mql.removeEventListener("change", onChange);
    };
  }, [spacerSelector]);
}
