import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { lerp, weatherState } from "../state/weatherState";
import { Sky } from "./Sky";
import { CloudLayer } from "./Clouds";
import { Rain } from "./Rain";
import { Lightning } from "./Lightning";
import { Weathervane } from "./Weathervane";
import { CameraRig } from "./CameraRig";

function SceneLights() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const calmColor = useRef(new THREE.Color("#fff2d6"));
  const stormColor = useRef(new THREE.Color("#8b93a8"));

  useFrame(() => {
    const storm = weatherState.stormFactor;
    if (sunRef.current) {
      sunRef.current.intensity = lerp(2.2, 0.5, storm);
      sunRef.current.color
        .copy(calmColor.current)
        .lerp(stormColor.current, storm);
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        ref={sunRef}
        position={[4, 6, 3]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
}

export function Experience() {
  return (
    <>
      <SceneLights />
      <Lightning />
      <CameraRig />
      <Sky />
      <CloudLayer />
      <Rain />
      <Weathervane />
      <ContactShadows
        position={[0, -1.42, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={3}
      />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.92}
          luminanceSmoothing={0.2}
          intensity={0.6}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </>
  );
}
