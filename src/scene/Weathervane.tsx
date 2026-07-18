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

  // Gust-driven wind physics: a slow prevailing-direction drift the vane
  // settles toward, punctuated by irregular random gust impulses (same
  // random-interval idiom as the lightning strikes in Lightning.tsx) rather
  // than smooth continuous wobble. Only rotation.y is ever touched - no
  // position or other-axis motion, so the vane never bobs or tilts.
  const angle = useRef(0);
  const angularVelocity = useRef(0);
  const phase = useRef(Math.random() * Math.PI * 2);
  const clock = useRef(0);
  const nextGustAt = useRef(1 + Math.random() * 2);

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
    clock.current += delta;

    // Prevailing wind direction: one slow sine, not several stacked - the
    // vane's "home" heading that it settles toward between gusts.
    const baseline =
      Math.sin(state.clock.elapsedTime * lerp(0.03, 0.15, storm) + phase.current) *
      lerp(0.6, 2.5, storm);

    // Irregular gust impulses, not a continuous force - this is what actually
    // reads as wind hitting it, rather than mechanical wobble.
    if (clock.current >= nextGustAt.current) {
      const gustStrength = lerp(0.8, 6, storm) * (0.5 + Math.random());
      const gustDir = Math.random() < 0.5 ? -1 : 1;
      angularVelocity.current += gustDir * gustStrength;
      nextGustAt.current =
        clock.current + lerp(2.5, 0.4, storm) * (0.5 + Math.random());
    }

    // Settling spring pulls back toward the prevailing baseline between gusts.
    let diff = (baseline - angle.current) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    const stiffness = lerp(3, 8, storm);
    const damping = lerp(2.5, 1.4, storm);
    angularVelocity.current += diff * stiffness * delta;
    angularVelocity.current *= Math.max(0, 1 - damping * delta);
    angle.current += angularVelocity.current * delta;

    if (roosterRef.current) {
      roosterRef.current.rotation.y = angle.current;
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
