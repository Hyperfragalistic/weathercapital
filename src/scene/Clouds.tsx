import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Clouds, Cloud } from "@react-three/drei";
import * as THREE from "three";
import { weatherState } from "../state/weatherState";
import { isLowPowerDevice } from "../state/deviceCapability";

const CALM_COLOR = new THREE.Color("#ffffff");
const STORM_COLOR = new THREE.Color("#5c6069");

const PUFF_COUNT = isLowPowerDevice ? 5 : 9;

type Puff = {
  position: [number, number, number];
  seed: number;
  scale: number;
};

function generatePuffs(count: number): Puff[] {
  const puffs: Puff[] = [];
  for (let i = 0; i < count; i++) {
    puffs.push({
      position: [
        (Math.random() - 0.5) * 70,
        8 + Math.random() * 10,
        -40 - Math.random() * 30,
      ],
      seed: Math.floor(Math.random() * 1000),
      scale: 1.4 + Math.random() * 1,
    });
  }
  return puffs;
}

export function CloudLayer() {
  const puffs = useMemo(() => generatePuffs(PUFF_COUNT), []);
  const [color, setColor] = useState(`#${CALM_COLOR.getHexString()}`);
  const [opacity, setOpacity] = useState(0.4);
  const frameCount = useRef(0);
  const workingColor = useRef(CALM_COLOR.clone());

  useFrame(() => {
    frameCount.current += 1;
    // Cloud color/opacity change slowly (tied to the scroll story), so a
    // throttled React state update is plenty smooth without re-rendering
    // every frame like the ref-mutated Sky/Rain/Lightning shaders do.
    if (frameCount.current % 6 !== 0) return;
    const storm = weatherState.stormFactor;
    workingColor.current.copy(CALM_COLOR).lerp(STORM_COLOR, storm);
    setColor(`#${workingColor.current.getHexString()}`);
    setOpacity(0.35 + storm * 0.35);
  });

  return (
    <Clouds limit={200} range={100}>
      {puffs.map((puff, i) => (
        <Cloud
          key={i}
          position={puff.position}
          seed={puff.seed}
          scale={puff.scale}
          segments={10}
          volume={2.5}
          bounds={[1.8, 0.7, 0.7]}
          opacity={opacity}
          color={color}
          fade={25}
          speed={0.05}
          growth={1}
        />
      ))}
    </Clouds>
  );
}
