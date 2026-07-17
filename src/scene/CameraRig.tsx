import { useFrame, useThree } from "@react-three/fiber";
import { weatherState } from "../state/weatherState";

const BASE_POSITION = { x: 0, y: 0.4, z: 6.2 };

export function CameraRig() {
  const { camera } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const storm = weatherState.stormFactor;
    const sway = weatherState.reducedMotion ? 0 : 1;

    camera.position.x = BASE_POSITION.x + Math.sin(t * 0.15) * 0.18 * sway;
    camera.position.y = BASE_POSITION.y + Math.sin(t * 0.1) * 0.08 * sway;
    // Subtle push-in during the storm for drama.
    camera.position.z = BASE_POSITION.z - storm * 0.6;
    camera.lookAt(0, 0.6, 0);
  });

  return null;
}
