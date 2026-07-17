const isNarrowViewport =
  typeof window !== "undefined" && window.innerWidth < 768;
const isLowCoreCount =
  typeof navigator !== "undefined" &&
  typeof navigator.hardwareConcurrency === "number" &&
  navigator.hardwareConcurrency <= 4;

export const isLowPowerDevice = isNarrowViewport || isLowCoreCount;
