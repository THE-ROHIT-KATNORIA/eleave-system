import { 
  format, 
  isAfter, 
  isBefore, 
  isSameDay, 
  isToday, 
  startOfDay, 
  addMonths, 
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay
} from 'date-fns';

/**
 * Calendar utility functions for date manipulation and validation
 */

// Date validation functions
export const isDatePast = (date) => {
  const today = startOfDay(new Date());
  return isBefore(startOfDay(date), today);
};

export const isDateSunday = (date) => {
  return getDay(date) === 0; // 0 = Sunday
};

export const isDateHoliday = (date, holidays = []) => {
  return holidays.some(holiday => isSameDay(date, holiday));
};

export const isDateBeyondFutureLimit = (date, maxFutureMonths = 6) => {
  const maxDate = addMonths(new Date(), maxFutureMonths);
  return isAfter(date, maxDate);
};

export const isDateDisabled = (date, holidays = [], maxFutureMonths = 6) => {
  return (
    isDatePast(date) ||
    isDateSunday(date) ||
    isDateHoliday(date, holidays) ||
    isDateBeyondFutureLimit(date, maxFutureMonths)
  );
};

// Date selection utilities
export const isDateSelected = (date, selectedDates = []) => {
  return selectedDates.some(selectedDate => isSameDay(selectedDate, date));
};

export const toggleDateSelection = (date, selectedDates = []) => {
  const isSelected = isDateSelected(date, selectedDates);
  
  if (isSelected) {
    return selectedDates.filter(selectedDate => !isSameDay(selectedDate, date));
  } else {
    return [...selectedDates, date];
  }
};

export const removeDateFromSelection = (date, selectedDates = []) => {
  return selectedDates.filter(selectedDate => !isSameDay(selectedDate, date));
};

export const clearAllSelectedDates = () => {
  return [];
};

// Date formatting utilities
export const formatDateForDisplay = (date) => {
  return format(date, 'EEEE, MMMM d, yyyy');
};

export const formatDateForAPI = (date) => {
  return format(date, 'yyyy-MM-dd');
};

export const formatMonthYear = (date) => {
  return format(date, 'MMMM yyyy');
};

export const formatDayNumber = (date) => {
  return format(date, 'd');
};

// Calendar grid utilities
export const generateCalendarGrid = (month) => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  
  // Add empty cells for proper grid alignment (Sunday = 0)
  const startDay = getDay(start);
  const emptyCells = Array(startDay).fill(null);
  
  return [...emptyCells, ...days];
};

export const getWeekdayLabels = () => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
};

// Date grouping utilities
export const groupDatesByMonth = (dates) => {
  const grouped = new Map();
  
  dates.forEach(date => {
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMMM yyyy');
    
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, {
        label: monthLabel,
        dates: []
      });
    }
    
    grouped.get(monthKey).dates.push(date);
  });
  
  // Sort dates within each month
  grouped.forEach(monthData => {
    monthData.dates.sort((a, b) => a - b);
  });
  
  return grouped;
};

// Month navigation utilities
export const canNavigateToPreviousMonth = (currentMonth) => {
  const today = new Date();
  const currentMonthStart = startOfMonth(currentMonth);
  const thisMonthStart = startOfMonth(today);
  
  return isAfter(currentMonthStart, thisMonthStart);
};

export const canNavigateToNextMonth = (currentMonth, maxFutureMonths = 6) => {
  const nextMonth = addMonths(currentMonth, 1);
  const maxAllowedMonth = addMonths(new Date(), maxFutureMonths);
  
  return !isAfter(nextMonth, maxAllowedMonth);
};

export const navigateToPreviousMonth = (currentMonth) => {
  return subMonths(currentMonth, 1);
};

export const navigateToNextMonth = (currentMonth) => {
  return addMonths(currentMonth, 1);
};

// Holiday utilities
export const getDefaultHolidays = () => {
  const currentYear = new Date().getFullYear();
  
  return [
    new Date(currentYear, 0, 26),  // Republic Day - January 26
    new Date(currentYear, 7, 15),  // Independence Day - August 15
    new Date(currentYear, 9, 2),   // Gandhi Jayanti - October 2
    // Add more holidays as needed
  ];
};

export const isHolidayDate = (date, holidays = []) => {
  return holidays.some(holiday => isSameDay(date, holiday));
};

// Validation utilities for API
export const validateSelectedDates = (selectedDates, holidays = [], maxFutureMonths = 6) => {
  const errors = [];
  const warnings = [];
  
  selectedDates.forEach(date => {
    if (isDatePast(date)) {
      errors.push(`Cannot select past date: ${formatDateForDisplay(date)}`);
    }
    
    if (isDateSunday(date)) {
      errors.push(`Cannot select Sunday: ${formatDateForDisplay(date)}`);
    }
    
    if (isDateHoliday(date, holidays)) {
      errors.push(`Cannot select holiday: ${formatDateForDisplay(date)}`);
    }
    
    if (isDateBeyondFutureLimit(date, maxFutureMonths)) {
      errors.push(`Date beyond ${maxFutureMonths} month limit: ${formatDateForDisplay(date)}`);
    }
  });
  
  // Add warnings for large selections
  if (selectedDates.length > 5) {
    warnings.push(`Large selection: ${selectedDates.length} dates selected`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Monthly limit calculation utilities
export const calculateMonthlyImpact = (selectedDates) => {
  const impact = new Map();
  
  selectedDates.forEach(date => {
    const monthKey = format(date, 'yyyy-MM');
    
    if (!impact.has(monthKey)) {
      impact.set(monthKey, {
        monthLabel: format(date, 'MMMM yyyy'),
        count: 0,
        dates: []
      });
    }
    
    const monthData = impact.get(monthKey);
    monthData.count++;
    monthData.dates.push(date);
  });
  
  return impact;
};

// Utility to convert dates to API format
export const prepareDatesForAPI = (selectedDates) => {
  return selectedDates
    .map(date => formatDateForAPI(date))
    .sort();
};

// Utility to parse dates from API format
export const parseDatesFromAPI = (dateStrings) => {
  return dateStrings.map(dateString => new Date(dateString));
};

// Color utilities for calendar styling
export const getDateCellColor = (date, selectedDates, holidays, isDisabled) => {
  if (isDisabled) return '#e2e8f0';
  if (isDateSelected(date, selectedDates)) return '#6366f1';
  if (isToday(date)) return '#06b6d4';
  if (isDateHoliday(date, holidays)) return '#f59e0b';
  return '#ffffff';
};

export const getDateTextColor = (date, selectedDates, holidays, isDisabled) => {
  if (isDisabled) return '#94a3b8';
  if (isDateSelected(date, selectedDates)) return '#ffffff';
  if (isToday(date)) return '#ffffff';
  if (isDateHoliday(date, holidays)) return '#ffffff';
  return '#1e293b';
};