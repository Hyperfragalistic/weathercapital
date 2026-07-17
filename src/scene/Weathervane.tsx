import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerp, weatherState } from "../state/weatherState";

const METAL = { color: "#c9a24b", metalness: 0.9, roughness: 0.28 };
const STONE = { color: "#3d3a36", metalness: 0.1, roughness: 0.85 };

export function Weathervane() {
  const vaneGroup = useRef<THREE.Group>(null);
  const spinSpeed = useRef(0.15);

  useFrame((_, delta) => {
    const storm = weatherState.stormFactor;
    // Idle spin ramps up to a fast, slightly erratic spin at storm peak.
    const targetSpeed = lerp(0.15, 4.5, storm) + storm * Math.sin(Date.now() * 0.006) * 0.6;
    spinSpeed.current = lerp(spinSpeed.current, targetSpeed, 0.05);
    if (vaneGroup.current) {
      vaneGroup.current.rotation.y += spinSpeed.current * delta;
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
        <meshStandardMaterial {...METAL} />
      </mesh>

      {/* Fixed compass cross */}
      <group position={[0, 1.95, 0]}>
        {[0, Math.PI / 2].map((rot, i) => (
          <mesh key={i} rotation={[0, rot, 0]} castShadow>
            <boxGeometry args={[1.6, 0.03, 0.05]} />
            <meshStandardMaterial {...METAL} />
          </mesh>
        ))}
      </group>

      {/* Rotating arrow + tail fin, mounted above the compass cross */}
      <group ref={vaneGroup} position={[0, 2.35, 0]}>
        <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <coneGeometry args={[0.16, 0.5, 4]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
        <mesh position={[-0.55, 0, 0]} castShadow>
          <boxGeometry args={[0.5, 0.32, 0.03]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
        {/* Ornamental ball on top */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
      </group>
    </group>
  );
}
