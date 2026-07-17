import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./scene/Experience";
import { HeroOverlay } from "./components/HeroOverlay";
import { useScrollStory } from "./hooks/useScrollStory";
import { isLowPowerDevice } from "./state/deviceCapability";

function App() {
  useScrollStory(".hero-spacer");

  return (
    <div className="page">
      <div className="hero-spacer">
        <div className="hero-pin">
          <Canvas
            className="hero-canvas"
            shadows={!isLowPowerDevice}
            dpr={isLowPowerDevice ? [1, 1] : [1, 1.75]}
            camera={{ position: [0, 0.4, 6.2], fov: 42 }}
          >
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </Canvas>
          <HeroOverlay />
        </div>
      </div>
    </div>
  );
}

export default App;
