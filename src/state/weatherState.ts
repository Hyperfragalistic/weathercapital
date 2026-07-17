// Singleton, mutated directly by the GSAP scroll timeline and read inside
// r3f useFrame loops. Keeping this outside React state avoids a re-render
// on every scroll tick — only the render loop needs the value.
export const weatherState = {
  /** Raw scroll progress through the hero story, 0 -> 1, set by ScrollTrigger. */
  progress: 0,
  /** Eased copy of progress, updated once per frame for smoother motion. */
  smoothProgress: 0,
  /** 0 -> 1 -> 0 storm intensity derived from progress. */
  stormFactor: 0,
  /** 0 -> 1 lightning flash intensity, decays every frame. */
  flash: 0,
  reducedMotion: false,
};

/** Smoothstep-based triangle: calm at the edges, full storm in the middle third. */
export function computeStormFactor(progress: number): number {
  const buildUp = smoothstep(0.22, 0.42, progress);
  const windDown = 1 - smoothstep(0.68, 0.88, progress);
  return Math.min(buildUp, windDown);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
