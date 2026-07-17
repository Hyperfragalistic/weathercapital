import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { weatherState } from "../state/weatherState";
import { isLowPowerDevice } from "../state/deviceCapability";

const COUNT = isLowPowerDevice ? 500 : 1400;
const FIELD_RADIUS = 9;
const FIELD_HEIGHT = 14;

export function Rain() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * FIELD_RADIUS * 2;
      positions[i * 3 + 1] = Math.random() * FIELD_HEIGHT;
      positions[i * 3 + 2] = (Math.random() - 0.5) * FIELD_RADIUS * 2;
      speeds[i] = 6 + Math.random() * 4;
    }
    return { positions, speeds };
  }, []);

  useFrame((_, delta) => {
    const storm = weatherState.stormFactor;
    if (materialRef.current) {
      materialRef.current.opacity = storm * 0.55;
    }
    if (!pointsRef.current || storm < 0.01) return;

    const geom = pointsRef.current.geometry;
    const posAttr = geom.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      const idx = i * 3 + 1;
      arr[idx] -= speeds[i] * delta * (0.4 + storm);
      if (arr[idx] < -1) {
        arr[idx] = FIELD_HEIGHT;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        color="#cfe0f5"
        size={0.045}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  );
}
