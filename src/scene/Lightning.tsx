import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { weatherState } from "../state/weatherState";

export function Lightning() {
  const lightRef = useRef<THREE.PointLight>(null);
  const nextStrikeAt = useRef(0);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    const storm = weatherState.stormFactor;

    // Decay any active flash.
    weatherState.flash = Math.max(0, weatherState.flash - delta * 3.2);

    if (storm > 0.55 && clockRef.current >= nextStrikeAt.current) {
      weatherState.flash = 0.85 + Math.random() * 0.15;
      // Next strike somewhere between 0.6s and 2.4s out, scaled by storm intensity.
      nextStrikeAt.current =
        clockRef.current + (0.6 + Math.random() * 1.8) / Math.max(storm, 0.3);
    }

    if (lightRef.current) {
      lightRef.current.intensity = weatherState.flash * 18;
    }
  });

  return (
    <pointLight
      ref={lightRef}
      position={[3, 6, -2]}
      color="#e8f0ff"
      intensity={0}
      distance={40}
    />
  );
}
