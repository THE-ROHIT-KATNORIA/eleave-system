import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Individual floating shape component with animation
 * Memoized for performance optimization
 */
const FloatingShape = memo(({ position, geometry, color, speed, mousePosition }) => {
  const meshRef = useRef();
  const initialPosition = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Floating animation (up and down)
    meshRef.current.position.y = initialPosition.y + Math.sin(time * speed) * 0.5;
    
    // Rotation animation
    meshRef.current.rotation.x += 0.01 * speed;
    meshRef.current.rotation.y += 0.01 * speed;
    
    // Mouse interaction - shapes follow mouse slightly
    if (mousePosition) {
      meshRef.current.position.x = initialPosition.x + mousePosition.x * 0.5;
      meshRef.current.position.z = initialPosition.z + mousePosition.y * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      {geometry}
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
});

FloatingShape.displayName = 'FloatingShape';

/**
 * Particle system component using instanced rendering for better performance
 * Memoized for performance optimization
 */
const Particles = memo(() => {
  const particlesRef = useRef();
  const particleCount = 50; // Reduced from 100 for better performance

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    
    return positions;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#06b6d4"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
});

Particles.displayName = 'Particles';

/**
 * FloatingShapes component with animated geometric shapes and particles
 * Includes mouse interaction for dynamic movement
 * Memoized for performance optimization
 */
const FloatingShapes = memo(() => {
  const mousePosition = useRef({ x: 0, y: 0 });

  // Track mouse movement
  const handlePointerMove = (event) => {
    mousePosition.current = {
      x: (event.point.x / window.innerWidth) * 2 - 1,
      y: -(event.point.y / window.innerHeight) * 2 + 1,
    };
  };

  // Define shapes with optimized geometries (reduced segments for better performance)
  const shapes = useMemo(() => [
    {
      geometry: <sphereGeometry args={[0.5, 16, 16]} />, // Reduced from 32x32
      position: [-3, 2, -2],
      color: '#6366f1',
      speed: 0.8,
    },
    {
      geometry: <boxGeometry args={[0.8, 0.8, 0.8]} />,
      position: [3, -1, -3],
      color: '#8b5cf6',
      speed: 0.6,
    },
    {
      geometry: <torusGeometry args={[0.5, 0.2, 8, 50]} />, // Reduced from 16x100
      position: [0, 3, -4],
      color: '#06b6d4',
      speed: 1.0,
    },
    {
      geometry: <sphereGeometry args={[0.4, 16, 16]} />, // Reduced from 32x32
      position: [4, 1, -1],
      color: '#6366f1',
      speed: 0.7,
    },
    {
      geometry: <octahedronGeometry args={[0.6]} />,
      position: [-4, -2, -2],
      color: '#8b5cf6',
      speed: 0.9,
    },
    {
      geometry: <torusKnotGeometry args={[0.4, 0.15, 50, 12]} />, // Reduced from 100x16
      position: [2, 2, -5],
      color: '#06b6d4',
      speed: 0.5,
    },
  ], []);

  return (
    <group onPointerMove={handlePointerMove}>
      {/* Render floating shapes */}
      {shapes.map((shape, index) => (
        <FloatingShape
          key={index}
          position={shape.position}
          geometry={shape.geometry}
          color={shape.color}
          speed={shape.speed}
          mousePosition={mousePosition.current}
        />
      ))}
      
      {/* Render particle system */}
      <Particles />
    </group>
  );
});

FloatingShapes.displayName = 'FloatingShapes';

export default FloatingShapes;
