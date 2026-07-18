import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { lerp, weatherState } from "../state/weatherState";

const STONE = { color: "#3d3a36", metalness: 0.1, roughness: 0.85 };

const MODEL_URL = "/models/weathervane/scene.gltf";
// Model is authored at a scale where the rooster silhouette spans ~50-60
// units; this brings it down to fit our ~2 unit tall pole.
const MODEL_SCALE = 0.017;
// The source FBX bakes a large offset into the node transforms (its origin
// isn't near the geometry), so the base's own bottom sits ~1.13 units below
// this group's origin at MODEL_SCALE. This places the base flush on the rod
// top (rod top is at local y=2.4 in the pedestal group below), with a slight
// embed so there's no visible gap. Re-measure via Box3 if MODEL_SCALE changes.
const MODEL_POSITION: [number, number, number] = [0, 3.48, 0];

export function Weathervane() {
  const { scene, nodes } = useGLTF(MODEL_URL);
  const spinSpeed = useRef(0.15);
  const roosterRef = useRef<THREE.Object3D | null>(null);

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

  useFrame((_, delta) => {
    const storm = weatherState.stormFactor;
    // Idle spin ramps up to a fast, slightly erratic spin at storm peak.
    const targetSpeed = lerp(0.15, 4.5, storm) + storm * Math.sin(Date.now() * 0.006) * 0.6;
    spinSpeed.current = lerp(spinSpeed.current, targetSpeed, 0.05);
    if (roosterRef.current) {
      roosterRef.current.rotation.y += spinSpeed.current * delta;
    }
  });

  return (
    <group position={[0, -1.4, 0]}>
      {/* Pedestal */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.9, 8]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      {/* Rod */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.5, 12]} />
        <meshStandardMaterial {...STONE} />
      </mesh>

      <group position={MODEL_POSITION}>
        <primitive object={scene} scale={MODEL_SCALE} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
