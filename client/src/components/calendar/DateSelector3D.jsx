import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { format } from 'date-fns';

const DateSelector3D = ({ 
  date, 
  position, 
  isSelected, 
  isDisabled, 
  isHoliday, 
  isToday, 
  onClick 
}) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animation frame for smooth transitions
  useFrame(() => {
    if (!meshRef.current) return;

    // Target values based on state
    const targetScale = isSelected ? 1.1 : (hovered && !isDisabled ? 1.05 : 1.0);
    const targetZ = isSelected ? 0.3 : (hovered && !isDisabled ? 0.15 : 0);
    
    // Smooth interpolation
    meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    meshRef.current.position.z += (targetZ - meshRef.current.position.z) * 0.1;
  });

  // Get colors based on state
  const getColors = () => {
    if (isDisabled) {
      return {
        base: '#e2e8f0',
        text: '#94a3b8'
      };
    }
    
    if (isSelected) {
      return {
        base: '#6366f1',
        text: '#ffffff'
      };
    }
    
    if (isToday) {
      return {
        base: '#06b6d4',
        text: '#ffffff'
      };
    }
    
    if (isHoliday) {
      return {
        base: '#f59e0b',
        text: '#ffffff'
      };
    }
    
    return {
      base: hovered ? '#f1f5f9' : '#ffffff',
      text: '#1e293b'
    };
  };

  const colors = getColors();

  const handleClick = (event) => {
    event.stopPropagation();
    if (!isDisabled && date) {
      onClick(date);
    }
  };

  const handlePointerOver = (event) => {
    event.stopPropagation();
    if (!isDisabled) {
      setHovered(true);
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'not-allowed';
    }
  };

  const handlePointerOut = (event) => {
    event.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  // Don't render if no date (empty calendar cells)
  if (!date) {
    return null;
  }

  return (
    <group position={position}>
      {/* Date cell background */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[0.9, 0.9, 0.1]} />
        <meshStandardMaterial 
          color={colors.base}
          transparent
          opacity={isDisabled ? 0.6 : 1.0}
        />
      </mesh>

      {/* Date number text */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.3}
        color={colors.text}
        anchorX="center"
        anchorY="middle"
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {format(date, 'd')}
      </Text>

      {/* Special indicators */}
      {isToday && (
        <mesh position={[0.3, 0.3, 0.06]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#06b6d4" />
        </mesh>
      )}

      {isHoliday && (
        <mesh position={[-0.3, 0.3, 0.06]}>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#f59e0b" />
        </mesh>
      )}

      {isSelected && (
        <mesh position={[0, 0, 0.07]}>
          <ringGeometry args={[0.4, 0.45]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

export default DateSelector3D;