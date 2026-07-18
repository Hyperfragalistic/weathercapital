const WOOD = { color: "#8c2f2b", metalness: 0.05, roughness: 0.78 };
const TIN = { color: "#9aa3ab", metalness: 0.75, roughness: 0.32 };
const TRIM = { color: "#5c1f1c", metalness: 0.05, roughness: 0.8 };

// Barn proportions are tuned so the ridge (where the vane mounts) lands at
// local y=1.6 - matching the old pedestal+rod stack height so the vane's
// existing MODEL_POSITION in Weathervane.tsx didn't need re-deriving.
const WALL_HEIGHT = 0.7;
const ROOF_RISE = 0.42;
const HALF_WIDTH = 0.62;
const DEPTH = 1.0;
const OVERHANG = 0.1;

const SLOPE_RUN = HALF_WIDTH + OVERHANG;
const SLOPE_LENGTH = Math.sqrt(SLOPE_RUN ** 2 + ROOF_RISE ** 2);
const SLOPE_ANGLE = Math.atan2(ROOF_RISE, SLOPE_RUN);
const ROOF_DEPTH = DEPTH + OVERHANG * 2;
const RIDGE_Y = WALL_HEIGHT + ROOF_RISE;

export function Barn() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, WALL_HEIGHT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[HALF_WIDTH * 2, WALL_HEIGHT, DEPTH]} />
        <meshStandardMaterial {...WOOD} />
      </mesh>

      {/* Roof slopes */}
      <mesh
        position={[SLOPE_RUN / 2, WALL_HEIGHT + ROOF_RISE / 2, 0]}
        rotation={[0, 0, -SLOPE_ANGLE]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[SLOPE_LENGTH, 0.06, ROOF_DEPTH]} />
        <meshStandardMaterial {...TIN} />
      </mesh>
      <mesh
        position={[-SLOPE_RUN / 2, WALL_HEIGHT + ROOF_RISE / 2, 0]}
        rotation={[0, 0, SLOPE_ANGLE]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[SLOPE_LENGTH, 0.06, ROOF_DEPTH]} />
        <meshStandardMaterial {...TIN} />
      </mesh>

      {/* Ridge cap */}
      <mesh position={[0, RIDGE_Y, 0]} castShadow>
        <boxGeometry args={[0.14, 0.1, ROOF_DEPTH]} />
        <meshStandardMaterial {...TIN} />
      </mesh>

      {/* Gable trim strip under the eaves */}
      <mesh position={[0, WALL_HEIGHT, 0]}>
        <boxGeometry args={[HALF_WIDTH * 2 + OVERHANG, 0.08, DEPTH + OVERHANG]} />
        <meshStandardMaterial {...TRIM} />
      </mesh>
    </group>
  );
}

export const BARN_RIDGE_Y = RIDGE_Y;
