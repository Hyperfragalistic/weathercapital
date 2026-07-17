import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lerp, weatherState } from "../state/weatherState";

const CALM_TOP = new THREE.Color("#fbe8c0");
const CALM_BOTTOM = new THREE.Color("#ffd9a0");
const STORM_TOP = new THREE.Color("#2a2f3d");
const STORM_BOTTOM = new THREE.Color("#565f72");

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float flash;
  varying vec3 vWorldPosition;

  void main() {
    float h = normalize(vWorldPosition).y;
    float t = clamp(pow(max(h * 0.5 + 0.5, 0.0), 0.7), 0.0, 1.0);
    vec3 sky = mix(bottomColor, topColor, t);
    sky = mix(sky, vec3(1.0), flash);
    gl_FragColor = vec4(sky, 1.0);
  }
`;

export function Sky() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useRef({
    topColor: { value: CALM_TOP.clone() },
    bottomColor: { value: CALM_BOTTOM.clone() },
    flash: { value: 0 },
  });

  useFrame(() => {
    const mat = materialRef.current;
    if (!mat) return;
    const storm = weatherState.stormFactor;

    const top = uniforms.current.topColor.value as THREE.Color;
    const bottom = uniforms.current.bottomColor.value as THREE.Color;
    top.copy(CALM_TOP).lerp(STORM_TOP, storm);
    bottom.copy(CALM_BOTTOM).lerp(STORM_BOTTOM, storm);

    uniforms.current.flash.value = lerp(
      uniforms.current.flash.value,
      weatherState.flash,
      0.5,
    );
  });

  return (
    <mesh scale={[1, 1, 1]}>
      <sphereGeometry args={[80, 32, 16]} />
      <shaderMaterial
        ref={materialRef}
        side={THREE.BackSide}
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
