import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import Scene3D from './Scene3D';

/**
 * 3D Spinner Ring Component
 * Memoized for performance optimization
 */
const SpinnerRing = memo(({ radius, color, speed, axis = 'y' }) => {
  const ringRef = useRef();

  useFrame(() => {
    if (!ringRef.current) return;
    
    // Rotate based on specified axis
    if (axis === 'x') {
      ringRef.current.rotation.x += speed;
    } else if (axis === 'y') {
      ringRef.current.rotation.y += speed;
    } else if (axis === 'z') {
      ringRef.current.rotation.z += speed;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.1, 16, 100]} />
      <meshStandardMaterial
        color={color}
        metalness={0.5}
        roughness={0.2}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </mesh>
  );
});

SpinnerRing.displayName = 'SpinnerRing';

/**
 * 3D Pulsing Sphere Component
 * Memoized for performance optimization
 */
const PulsingSphere = memo(() => {
  const sphereRef = useRef();

  useFrame((state) => {
    if (!sphereRef.current) return;
    
    // Pulsing scale animation
    const scale = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.2;
    sphereRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        color="#6366f1"
        metalness={0.8}
        roughness={0.2}
        emissive="#6366f1"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
});

PulsingSphere.displayName = 'PulsingSphere';

/**
 * 3D Loading Animation Component
 * Features multiple rotating rings and a pulsing center sphere
 * Memoized for performance optimization
 */
const LoadingAnimation = memo(() => {
  return (
    <group>
      {/* Center pulsing sphere */}
      <PulsingSphere />
      
      {/* Multiple rotating rings at different speeds and axes */}
      <SpinnerRing radius={0.8} color="#6366f1" speed={0.03} axis="y" />
      <SpinnerRing radius={1.0} color="#8b5cf6" speed={0.025} axis="x" />
      <SpinnerRing radius={1.2} color="#06b6d4" speed={0.02} axis="z" />
    </group>
  );
});

LoadingAnimation.displayName = 'LoadingAnimation';

/**
 * LoadingSpinner3D - Reusable 3D loading spinner component
 * Can be used across the application for loading states
 * Memoized for performance optimization
 * 
 * @param {boolean} fullScreen - If true, renders as full screen overlay
 * @param {string} message - Optional loading message to display
 */
const LoadingSpinner3D = memo(({ fullScreen = false, message = 'Loading...' }) => {
  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(248, 250, 252, 0.9)',
          zIndex: 9999,
        }}
      >
        <div style={{ width: '300px', height: '300px' }}>
          <Scene3D cameraPosition={[0, 0, 5]}>
            <LoadingAnimation />
          </Scene3D>
        </div>
        {message && (
          <p
            style={{
              marginTop: '20px',
              fontSize: '18px',
              color: '#1e293b',
              fontWeight: '500',
            }}
          >
            {message}
          </p>
        )}
      </div>
    );
  }

  // Inline version for use within components
  return (
    <div
      style={{
        width: '100%',
        height: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '200px', height: '200px' }}>
        <Scene3D cameraPosition={[0, 0, 5]}>
          <LoadingAnimation />
        </Scene3D>
      </div>
      {message && (
        <p
          style={{
            marginTop: '10px',
            fontSize: '14px',
            color: '#64748b',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
});

LoadingSpinner3D.displayName = 'LoadingSpinner3D';

export default LoadingSpinner3D;
