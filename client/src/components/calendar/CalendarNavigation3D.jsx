import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { format } from 'date-fns';

const CalendarNavigation3D = ({ 
  currentMonth, 
  onPreviousMonth, 
  onNextMonth, 
  canGoNext, 
  canGoPrevious 
}) => {
  const prevButtonRef = useRef();
  const nextButtonRef = useRef();
  const [hoveredButton, setHoveredButton] = useState(null);

  useFrame(() => {
    // Animate previous button
    if (prevButtonRef.current) {
      const targetScale = hoveredButton === 'prev' && canGoPrevious ? 1.1 : 1.0;
      prevButtonRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    }

    // Animate next button
    if (nextButtonRef.current) {
      const targetScale = hoveredButton === 'next' && canGoNext ? 1.1 : 1.0;
      nextButtonRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    }
  });

  const handlePrevClick = (event) => {
    event.stopPropagation();
    if (canGoPrevious) {
      onPreviousMonth();
    }
  };

  const handleNextClick = (event) => {
    event.stopPropagation();
    if (canGoNext) {
      onNextMonth();
    }
  };

  const handlePrevHover = (event) => {
    event.stopPropagation();
    if (canGoPrevious) {
      setHoveredButton('prev');
      document.body.style.cursor = 'pointer';
    }
  };

  const handleNextHover = (event) => {
    event.stopPropagation();
    if (canGoNext) {
      setHoveredButton('next');
      document.body.style.cursor = 'pointer';
    }
  };

  const handleHoverOut = (event) => {
    event.stopPropagation();
    setHoveredButton(null);
    document.body.style.cursor = 'default';
  };

  return (
    <group position={[0, 4, 0]}>
      {/* Previous Month Button */}
      <group position={[-2, 0, 0]}>
        <mesh
          ref={prevButtonRef}
          onClick={handlePrevClick}
          onPointerOver={handlePrevHover}
          onPointerOut={handleHoverOut}
        >
          <boxGeometry args={[0.8, 0.8, 0.2]} />
          <meshStandardMaterial 
            color={canGoPrevious ? '#6366f1' : '#e2e8f0'}
            transparent
            opacity={canGoPrevious ? 1.0 : 0.5}
          />
        </mesh>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.4}
          color={canGoPrevious ? '#ffffff' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
          onClick={handlePrevClick}
          onPointerOver={handlePrevHover}
          onPointerOut={handleHoverOut}
        >
          ‹
        </Text>
      </group>

      {/* Month/Year Display */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[3, 1, 0.1]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.4}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
        >
          {format(currentMonth, 'MMMM yyyy')}
        </Text>
      </group>

      {/* Next Month Button */}
      <group position={[2, 0, 0]}>
        <mesh
          ref={nextButtonRef}
          onClick={handleNextClick}
          onPointerOver={handleNextHover}
          onPointerOut={handleHoverOut}
        >
          <boxGeometry args={[0.8, 0.8, 0.2]} />
          <meshStandardMaterial 
            color={canGoNext ? '#6366f1' : '#e2e8f0'}
            transparent
            opacity={canGoNext ? 1.0 : 0.5}
          />
        </mesh>
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.4}
          color={canGoNext ? '#ffffff' : '#94a3b8'}
          anchorX="center"
          anchorY="middle"
          onClick={handleNextClick}
          onPointerOver={handleNextHover}
          onPointerOut={handleHoverOut}
        >
          ›
        </Text>
      </group>
    </group>
  );
};

export default CalendarNavigation3D;