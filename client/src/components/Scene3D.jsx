import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, memo } from 'react';
import ThreeErrorBoundary from './ThreeErrorBoundary';

/**
 * Base 3D scene component with Canvas and lighting setup
 * Provides responsive canvas sizing and camera configuration
 * Optimized with performance settings and memoization
 * Includes error boundary for graceful degradation
 */
const Scene3D = memo(({ children, enableControls = false, cameraPosition = [0, 0, 5] }) => {
  return (
    <ThreeErrorBoundary>
      <Canvas
      camera={{ position: cameraPosition, fov: 75 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance', // Optimize for performance
        stencil: false, // Disable stencil buffer if not needed
        depth: true
      }}
      dpr={[1, 2]} // Limit device pixel ratio for performance
      frameloop="demand" // Only render when needed
      performance={{ min: 0.5 }} // Adaptive performance
    >
      {/* Ambient light for overall scene illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Directional light for shadows and depth */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
      />
      
      {/* Additional directional light from opposite side for balanced lighting */}
      <directionalLight
        position={[-10, -10, -5]}
        intensity={0.3}
      />
      
      {/* Point light for accent lighting */}
      <pointLight position={[0, 5, 0]} intensity={0.5} />
      
      {/* Suspense wrapper for lazy loading 3D content */}
      <Suspense fallback={null}>
        {children}
      </Suspense>
      
      {/* Optional orbit controls for interactive camera movement */}
      {enableControls && (
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
        />
      )}
      </Canvas>
    </ThreeErrorBoundary>
  );
});

Scene3D.displayName = 'Scene3D';

export default Scene3D;
