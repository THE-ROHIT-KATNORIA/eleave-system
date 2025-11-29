import React, { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import DateSelector3D from './DateSelector3D';
import CalendarNavigation3D from './CalendarNavigation3D';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  addMonths, 
  subMonths,
  isSameDay 
} from 'date-fns';
import './Calendar3D.css';

const Calendar3D = ({ 
  selectedDates = [], 
  onDateSelect, 
  disabledDates = [], 
  holidays = [], 
  maxFutureMonths = 6 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const canvasRef = useRef();

  // Generate calendar grid for current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add empty cells for proper grid alignment
    const startDay = getDay(start); // 0 = Sunday, 1 = Monday, etc.
    const emptyCells = Array(startDay).fill(null);
    
    return [...emptyCells, ...days];
  }, [currentMonth]);

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    const maxDate = addMonths(new Date(), maxFutureMonths);
    
    if (nextMonth <= maxDate) {
      setCurrentMonth(nextMonth);
    }
  };

  // Date selection handler
  const handleDateClick = (date) => {
    if (!date) return;
    
    const isSelected = selectedDates.some(selectedDate => 
      isSameDay(selectedDate, date)
    );
    
    if (isSelected) {
      // Remove date from selection
      const newSelection = selectedDates.filter(selectedDate => 
        !isSameDay(selectedDate, date)
      );
      onDateSelect(newSelection);
    } else {
      // Add date to selection
      onDateSelect([...selectedDates, date]);
    }
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (!date) return true;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Disable past dates
    if (date < today) return true;
    
    // Disable Sundays (day 0)
    if (date.getDay() === 0) return true;
    
    // Disable holidays
    if (holidays.some(holiday => isSameDay(holiday, date))) return true;
    
    // Disable custom disabled dates
    if (disabledDates.some(disabled => isSameDay(disabled, date))) return true;
    
    return false;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!date) return false;
    return selectedDates.some(selectedDate => isSameDay(selectedDate, date));
  };

  // Check if date is holiday
  const isDateHoliday = (date) => {
    if (!date) return false;
    return holidays.some(holiday => isSameDay(holiday, date));
  };

  // Check if date is today
  const isDateToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return isSameDay(date, today);
  };

  return (
    <div className="calendar-3d-container">
      <CalendarNavigation3D
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        canGoNext={addMonths(currentMonth, 1) <= addMonths(new Date(), maxFutureMonths)}
        canGoPrevious={currentMonth > new Date()}
      />
      
      <div className="calendar-header">
        <div className="weekday-labels">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
        </div>
      </div>

      <div className="calendar-3d-canvas">
        <Canvas ref={canvasRef}>
          <PerspectiveCamera makeDefault position={[0, 2, 12]} fov={50} />
          <OrbitControls 
            enablePan={false} 
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={8}
            maxDistance={20}
          />
          
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 10, 5]} 
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          <hemisphereLight 
            skyColor="#ffffff" 
            groundColor="#f0f0f0" 
            intensity={0.2} 
          />
          
          {/* Calendar Grid with enhanced 3D positioning */}
          <group position={[0, 0, 0]} rotation={[-0.1, 0, 0]}>
            {calendarDays.map((date, index) => {
              const row = Math.floor(index / 7);
              const col = index % 7;
              const x = (col - 3) * 1.3; // Slightly wider spacing
              const y = (2.5 - row) * 1.3; // Better vertical spacing
              const z = 0;
              
              return (
                <DateSelector3D
                  key={index}
                  date={date}
                  position={[x, y, z]}
                  isSelected={isDateSelected(date)}
                  isDisabled={isDateDisabled(date)}
                  isHoliday={isDateHoliday(date)}
                  isToday={isDateToday(date)}
                  onClick={handleDateClick}
                />
              );
            })}
          </group>

          {/* Background plane for depth */}
          <mesh position={[0, 0, -1]} receiveShadow>
            <planeGeometry args={[12, 10]} />
            <meshStandardMaterial 
              color="#f8fafc" 
              transparent 
              opacity={0.3}
            />
          </mesh>
        </Canvas>
      </div>
      
      <div className="calendar-info">
        <p className="month-display">
          {format(currentMonth, 'MMMM yyyy')}
        </p>
        <p className="selection-count">
          {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
        </p>
      </div>
    </div>
  );
};

export default Calendar3D;