import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Ring, Circle } from '@react-three/drei';
import { calculateMonthlyImpact } from '../../utils/calendarUtils';
import './LeaveBalanceIndicator3D.css';

const ProgressRing3D = ({ progress, color, radius = 1.5 }) => {
  const ringRef = useRef();
  
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.005; // Slow rotation animation
    }
  });

  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <group ref={ringRef}>
      {/* Background ring */}
      <Ring
        args={[radius - 0.1, radius + 0.1, 64]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#e5e7eb" transparent opacity={0.3} />
      </Ring>
      
      {/* Progress ring */}
      <Ring
        args={[radius - 0.1, radius + 0.1, 64, 1, 0, (progress / 100) * Math.PI * 2]}
        position={[0, 0, 0.01]}
      >
        <meshStandardMaterial color={color} />
      </Ring>
    </group>
  );
};

const BalanceText3D = ({ used, remaining, limit, selectedCount, newRemaining, exceeds }) => {
  // Determine color based on final state after selection
  const finalRemaining = selectedCount > 0 ? newRemaining : remaining;
  const textColor = exceeds ? '#ef4444' : finalRemaining <= 0 ? '#ef4444' : finalRemaining <= 1 ? '#f59e0b' : '#10b981';
  
  // Determine what to display in the center
  const displayValue = selectedCount > 0 ? newRemaining : remaining;
  const statusText = exceeds ? 'EXCEEDED' : finalRemaining === 0 ? 'EXHAUSTED' : 'remaining';
  
  return (
    <group>
      {/* Main balance text */}
      <Text
        position={[0, 0.3, 0.1]}
        fontSize={exceeds ? 0.3 : 0.4}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        font-weight="bold"
      >
        {exceeds ? '!' : displayValue}
      </Text>
      
      {/* Status label */}
      <Text
        position={[0, -0.1, 0.1]}
        fontSize={0.18}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {statusText}
      </Text>
      
      {/* Usage info */}
      <Text
        position={[0, -0.4, 0.1]}
        fontSize={0.15}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {selectedCount > 0 ? `${used + selectedCount}/${limit}` : `${used}/${limit}`} used
      </Text>
      
      {/* Selected count if any */}
      {selectedCount > 0 && (
        <Text
          position={[0, -0.7, 0.1]}
          fontSize={0.15}
          color="#6366f1"
          anchorX="center"
          anchorY="middle"
        >
          {selectedCount} date{selectedCount !== 1 ? 's' : ''} selected
        </Text>
      )}
    </group>
  );
};

const LeaveBalanceIndicator3D = ({ 
  currentBalance = { used: 0, remaining: 3, limit: 3 },
  selectedDates = [],
  selectedDatesByMonth = new Map(),
  showMonthlyBreakdown = false 
}) => {
  const canvasRef = useRef();

  // Calculate impact of selected dates
  const balanceImpact = useMemo(() => {
    const monthlyImpact = calculateMonthlyImpact(selectedDates);
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const currentMonthImpact = monthlyImpact.get(currentMonth);
    const selectedCount = currentMonthImpact ? currentMonthImpact.count : 0;
    
    const newUsed = currentBalance.used + selectedCount;
    const newRemaining = Math.max(0, currentBalance.limit - newUsed);
    const exceeds = newUsed > currentBalance.limit;
    const overage = exceeds ? newUsed - currentBalance.limit : 0;

    return {
      selectedCount,
      newUsed,
      newRemaining,
      exceeds,
      overage,
      progress: (newUsed / currentBalance.limit) * 100
    };
  }, [currentBalance, selectedDates]);

  // Determine colors based on balance state
  const getBalanceColor = () => {
    if (balanceImpact.exceeds) return '#ef4444'; // Red
    if (balanceImpact.newRemaining <= 1) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getBackgroundColor = () => {
    if (balanceImpact.exceeds) return '#fef2f2'; // Light red
    if (balanceImpact.newRemaining <= 1) return '#fffbeb'; // Light yellow
    return '#f0fdf4'; // Light green
  };

  return (
    <div className="leave-balance-indicator-3d">
      <div className="balance-header">
        <h3>Monthly Leave Balance</h3>
        <p className="balance-month">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div 
        className="balance-canvas"
        style={{ backgroundColor: getBackgroundColor() }}
      >
        <Canvas ref={canvasRef}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, -5, 5]} intensity={0.3} />

          {/* Main balance ring */}
          <ProgressRing3D 
            progress={Math.min(balanceImpact.progress, 100)}
            color={getBalanceColor()}
            radius={1.8}
          />

          {/* Center circle background */}
          <Circle args={[1.3]} position={[0, 0, -0.05]}>
            <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
          </Circle>

          {/* Balance text */}
          <BalanceText3D
            used={currentBalance.used}
            remaining={currentBalance.remaining}
            limit={currentBalance.limit}
            selectedCount={balanceImpact.selectedCount}
            newRemaining={balanceImpact.newRemaining}
            exceeds={balanceImpact.exceeds}
          />

          {/* Warning indicators */}
          {balanceImpact.exceeds && (
            <group position={[0, 0, 0.2]}>
              <Circle args={[0.3]} position={[1.5, 1.5, 0]}>
                <meshStandardMaterial color="#ef4444" />
              </Circle>
              <Text
                position={[1.5, 1.5, 0.01]}
                fontSize={0.2}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                !
              </Text>
            </group>
          )}
        </Canvas>
      </div>

      <div className="balance-details">
        {balanceImpact.exceeds && (
          <div className="balance-warning">
            <span className="warning-icon">⚠️</span>
            <span>Exceeds limit by {balanceImpact.overage} day{balanceImpact.overage !== 1 ? 's' : ''}</span>
          </div>
        )}
        
        {balanceImpact.selectedCount > 0 && !balanceImpact.exceeds && balanceImpact.newRemaining === 0 && (
          <div className="balance-warning">
            <span className="warning-icon">🚫</span>
            <span>All leaves exhausted for this month</span>
          </div>
        )}
        
        {balanceImpact.selectedCount > 0 && !balanceImpact.exceeds && balanceImpact.newRemaining > 0 && (
          <div className="balance-info">
            <span className="info-icon">ℹ️</span>
            <span>
              {balanceImpact.newRemaining} leave{balanceImpact.newRemaining !== 1 ? 's' : ''} remaining this month
            </span>
          </div>
        )}
        
        {balanceImpact.selectedCount === 0 && currentBalance.remaining > 0 && (
          <div className="balance-info">
            <span className="info-icon">📅</span>
            <span>
              {currentBalance.remaining} leave{currentBalance.remaining !== 1 ? 's' : ''} available this month
            </span>
          </div>
        )}

        {showMonthlyBreakdown && selectedDatesByMonth.size > 1 && (
          <div className="monthly-breakdown">
            <h4>Monthly Breakdown:</h4>
            {Array.from(selectedDatesByMonth.entries()).map(([monthKey, dates]) => (
              <div key={monthKey} className="month-item">
                <span className="month-label">
                  {new Date(monthKey + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <span className="month-count">
                  {dates.length} day{dates.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveBalanceIndicator3D;