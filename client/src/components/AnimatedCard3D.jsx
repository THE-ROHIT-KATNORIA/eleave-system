import { useRef, useState, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * AnimatedCard3D - Reusable 3D card component with hover animations
 * Features depth effects, lift and rotate animations with spring transitions
 * Applies light theme colors from the design specification
 * Memoized for performance optimization
 */
const AnimatedCard3D = memo(({
  position = [0, 0, 0],
  title = 'Card Title',
  subtitle = '',
  color = '#6366f1',
  onClick = null,
  width = 2,
  height = 1.5,
}) => {
  const cardRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Target values for spring animation
  const targetPosition = useRef(new THREE.Vector3(...position));
  const targetRotation = useRef(new THREE.Euler(0, 0, 0));
  const targetScale = useRef(1);

  // Spring animation with smooth transitions
  useFrame(() => {
    if (!cardRef.current) return;

    // Calculate target values based on hover state
    if (hovered) {
      targetPosition.current.y = position[1] + 0.3; // Lift up
      targetRotation.current.x = -0.1; // Slight tilt
      targetRotation.current.y = 0.1;
      targetScale.current = 1.05; // Slight scale up
    } else {
      targetPosition.current.y = position[1];
      targetRotation.current.x = 0;
      targetRotation.current.y = 0;
      targetScale.current = 1;
    }

    // Spring interpolation (lerp) for smooth animation
    const springFactor = 0.1;
    
    cardRef.current.position.y += (targetPosition.current.y - cardRef.current.position.y) * springFactor;
    cardRef.current.rotation.x += (targetRotation.current.x - cardRef.current.rotation.x) * springFactor;
    cardRef.current.rotation.y += (targetRotation.current.y - cardRef.current.rotation.y) * springFactor;
    cardRef.current.scale.x += (targetScale.current - cardRef.current.scale.x) * springFactor;
    cardRef.current.scale.y += (targetScale.current - cardRef.current.scale.y) * springFactor;
    cardRef.current.scale.z += (targetScale.current - cardRef.current.scale.z) * springFactor;
  });

  const handlePointerOver = () => {
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <group
      ref={cardRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Card base - pure white background */}
      <RoundedBox
        args={[width, height, 0.3]}
        radius={0.1}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#ffffff"
          metalness={0}
          roughness={0.5}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </RoundedBox>

      {/* Colored top section */}
      <RoundedBox
        args={[width, height * 0.4, 0.31]}
        radius={0.1}
        smoothness={4}
        position={[0, height * 0.3, 0]}
      >
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </RoundedBox>

      {/* Title text - large and bold on colored section */}
      <Text
        position={[0, height * 0.3, 0.16]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.4}
        fontWeight="bold"
        letterSpacing={0.05}
      >
        {title}
      </Text>

      {/* Subtitle text on white section */}
      {subtitle && (
        <Text
          position={[0, -0.1, 0.16]}
          fontSize={0.16}
          color="#64748b"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.4}
        >
          {subtitle}
        </Text>
      )}

      {/* Click indicator icon */}
      <mesh position={[0, -0.4, 0.16]}>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.7 : 0.5}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      <Text
        position={[0, -0.4, 0.17]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        ▶
      </Text>

      {/* Glow effect only when hovered */}
      {hovered && (
        <pointLight
          position={[0, 0, 1.5]}
          intensity={2}
          distance={3}
          color={color}
        />
      )}
    </group>
  );
});

AnimatedCard3D.displayName = 'AnimatedCard3D';

export default AnimatedCard3D;
