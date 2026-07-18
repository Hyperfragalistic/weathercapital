import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { lerp, weatherState } from "../state/weatherState";
import { Barn, BARN_RIDGE_Y } from "./Barn";

const POLE = { color: "#2b2a28", metalness: 0.6, roughness: 0.4 };

const MODEL_URL = "/models/weathervane/scene.gltf";
// Model is authored at a scale where the rooster silhouette spans ~50-60
// units; this brings it down to fit our ~2 unit tall pole.
const MODEL_SCALE = 0.017;
// The source FBX bakes a large offset into the node transforms (its origin
// isn't near the geometry), so the base's own bottom sits ~1.13 units below
// this group's origin at MODEL_SCALE. This places the base flush on the pole
// top (see POLE_HEIGHT below), with a slight embed so there's no visible gap.
// Re-measure via Box3 if MODEL_SCALE changes.
const POLE_HEIGHT = 0.6;
const POLE_TOP = BARN_RIDGE_Y + POLE_HEIGHT;
const MODEL_POSITION: [number, number, number] = [0, POLE_TOP + 1.08, 0];

export function Weathervane() {
  const { scene, nodes } = useGLTF(MODEL_URL);
  const roosterRef = useRef<THREE.Object3D | null>(null);

  // Wind-gust spring: the vane doesn't spin continuously, it settles/wobbles
  // toward a slowly wandering "wind direction" target, same as a real vane.
  const windAngle = useRef(0);
  const windVelocity = useRef(0);
  const noisePhase = useRef({
    a: Math.random() * Math.PI * 2,
    b: Math.random() * Math.PI * 2,
    c: Math.random() * Math.PI * 2,
  });

  useEffect(() => {
    const named = nodes as Record<string, THREE.Object3D>;
    roosterRef.current = named["Rooster"] ?? null;

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene, nodes]);

  useFrame((state, delta) => {
    const storm = weatherState.stormFactor;
    const t = state.clock.elapsedTime;
    const { a, b, c } = noisePhase.current;

    // Wandering wind-direction target: three slow sine waves at different
    // frequencies/phases stand in for gusty, non-periodic wind. Storm widens
    // the swing (can exceed a full turn) and speeds up the gusts.
    const amplitude = lerp(0.5, Math.PI * 2.2, storm);
    const target =
      Math.sin(t * lerp(0.12, 0.9, storm) + a) * amplitude * 0.6 +
      Math.sin(t * lerp(0.05, 0.5, storm) + b) * amplitude * 0.3 +
      Math.sin(t * lerp(0.3, 2.2, storm) + c) * amplitude * 0.1;

    // Shortest-path angular difference so corrections don't take the long way.
    let diff = (target - windAngle.current) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    // Spring-damper: storm makes it snappier and less damped (more whip/overshoot).
    const stiffness = lerp(6, 22, storm);
    const damping = lerp(4.5, 2.2, storm);
    windVelocity.current += diff * stiffness * delta;
    windVelocity.current *= Math.max(0, 1 - damping * delta);
    windAngle.current += windVelocity.current * delta;

    if (roosterRef.current) {
      roosterRef.current.rotation.y = windAngle.current;
    }
  });

  return (
    <group position={[0, -1.4, 0]}>
      <Barn />

      {/* Pole from the ridge up to the vane mount */}
      <mesh position={[0, BARN_RIDGE_Y + POLE_HEIGHT / 2, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, POLE_HEIGHT, 12]} />
        <meshStandardMaterial {...POLE} />
      </mesh>

      <group position={MODEL_POSITION}>
        <primitive object={scene} scale={MODEL_SCALE} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
