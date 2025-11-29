import { format, isSameDay, isWithinInterval, startOfYear, endOfYear } from 'date-fns';

/**
 * Holiday Management Service
 * Manages college holidays and provides holiday checking functionality
 */
class HolidayService {
  constructor() {
    this.holidays = new Map(); // Cache for performance
    this.holidayConfig = new Map(); // Configuration storage
    this.loadDefaultHolidays();
  }

  /**
   * Load default holidays for the system
   */
  loadDefaultHolidays() {
    const currentYear = new Date().getFullYear();
    
    const defaultHolidays = [
      // National Holidays
      {
        date: new Date(currentYear, 0, 26), // January 26
        name: 'Republic Day',
        type: 'national',
        recurring: true,
        description: 'National holiday celebrating the adoption of the Constitution'
      },
      {
        date: new Date(currentYear, 7, 15), // August 15
        name: 'Independence Day',
        type: 'national',
        recurring: true,
        description: 'National holiday celebrating independence from British rule'
      },
      {
        date: new Date(currentYear, 9, 2), // October 2
        name: 'Gandhi Jayanti',
        type: 'national',
        recurring: true,
        description: 'Birthday of Mahatma Gandhi'
      },
      
      // Festival Holidays (approximate dates - these may vary by year)
      {
        date: new Date(currentYear, 2, 14), // March 14 (approximate)
        name: 'Holi',
        type: 'festival',
        recurring: false,
        description: 'Festival of colors'
      },
      {
        date: new Date(currentYear, 10, 12), // November 12 (approximate)
        name: 'Diwali',
        type: 'festival',
        recurring: false,
        description: 'Festival of lights'
      },
      
      // College-specific holidays
      {
        date: new Date(currentYear, 11, 25), // December 25
        name: 'Christmas',
        type: 'college',
        recurring: true,
        description: 'Christmas Day'
      },
      {
        date: new Date(currentYear, 0, 1), // January 1
        name: 'New Year',
        type: 'college',
        recurring: true,
        description: 'New Year Day'
      }
    ];

    // Add next year's recurring holidays
    const nextYear = currentYear + 1;
    const recurringHolidays = defaultHolidays
      .filter(holiday => holiday.recurring)
      .map(holiday => ({
        ...holiday,
        date: new Date(nextYear, holiday.date.getMonth(), holiday.date.getDate())
      }));

    [...defaultHolidays, ...recurringHolidays].forEach(holiday => {
      this.addHoliday(holiday);
    });
  }

  /**
   * Add a holiday to the system
   */
  addHoliday(holiday) {
    const dateKey = format(holiday.date, 'yyyy-MM-dd');
    
    const holidayData = {
      id: this.generateHolidayId(),
      date: holiday.date,
      name: holiday.name,
      type: holiday.type || 'college',
      recurring: holiday.recurring || false,
      description: holiday.description || '',
      createdAt: new Date()
    };

    this.holidays.set(dateKey, holidayData);
    
    // Store in configuration for persistence
    this.holidayConfig.set(holidayData.id, holidayData);
    
    return holidayData.id;
  }

  /**
   * Remove a holiday from the system
   */
  removeHoliday(holidayId) {
    const holiday = this.holidayConfig.get(holidayId);
    if (holiday) {
      const dateKey = format(holiday.date, 'yyyy-MM-dd');
      this.holidays.delete(dateKey);
      this.holidayConfig.delete(holidayId);
      return true;
    }
    return false;
  }

  /**
   * Check if a specific date is a holiday
   */
  isHoliday(date) {
    const dateKey = format(date, 'yyyy-MM-dd');
    return this.holidays.has(dateKey);
  }

  /**
   * Get holiday information for a specific date
   */
  getHoliday(date) {
    const dateKey = format(date, 'yyyy-MM-dd');
    return this.holidays.get(dateKey) || null;
  }

  /**
   * Get all holidays within a date range
   */
  getHolidaysInRange(startDate, endDate) {
    const holidays = [];
    
    this.holidays.forEach((holiday, dateKey) => {
      if (isWithinInterval(holiday.date, { start: startDate, end: endDate })) {
        holidays.push(holiday);
      }
    });

    // Sort by date
    return holidays.sort((a, b) => a.date - b.date);
  }

  /**
   * Get all holidays for a specific year
   */
  getHolidaysForYear(year) {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));
    
    return this.getHolidaysInRange(startDate, endDate);
  }

  /**
   * Get all holidays for a specific month
   */
  getHolidaysForMonth(year, month) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    
    return this.getHolidaysInRange(startDate, endDate);
  }

  /**
   * Get holidays by type
   */
  getHolidaysByType(type) {
    const holidays = [];
    
    this.holidays.forEach(holiday => {
      if (holiday.type === type) {
        holidays.push(holiday);
      }
    });

    return holidays.sort((a, b) => a.date - b.date);
  }

  /**
   * Get all holiday types
   */
  getHolidayTypes() {
    const types = new Set();
    
    this.holidays.forEach(holiday => {
      types.add(holiday.type);
    });

    return Array.from(types);
  }

  /**
   * Update holiday information
   */
  updateHoliday(holidayId, updates) {
    const holiday = this.holidayConfig.get(holidayId);
    if (!holiday) return false;

    // Remove old date key if date is being changed
    if (updates.date && !isSameDay(updates.date, holiday.date)) {
      const oldDateKey = format(holiday.date, 'yyyy-MM-dd');
      this.holidays.delete(oldDateKey);
    }

    // Update holiday data
    const updatedHoliday = {
      ...holiday,
      ...updates,
      updatedAt: new Date()
    };

    // Add with new date key
    const newDateKey = format(updatedHoliday.date, 'yyyy-MM-dd');
    this.holidays.set(newDateKey, updatedHoliday);
    this.holidayConfig.set(holidayId, updatedHoliday);

    return true;
  }

  /**
   * Get all holidays as array
   */
  getAllHolidays() {
    return Array.from(this.holidays.values()).sort((a, b) => a.date - b.date);
  }

  /**
   * Get holiday statistics
   */
  getHolidayStats() {
    const stats = {
      total: this.holidays.size,
      byType: {},
      upcoming: 0,
      thisMonth: 0,
      thisYear: 0
    };

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    this.holidays.forEach(holiday => {
      // Count by type
      stats.byType[holiday.type] = (stats.byType[holiday.type] || 0) + 1;

      // Count upcoming holidays
      if (holiday.date > now) {
        stats.upcoming++;
      }

      // Count this month's holidays
      if (holiday.date.getMonth() === thisMonth && holiday.date.getFullYear() === thisYear) {
        stats.thisMonth++;
      }

      // Count this year's holidays
      if (holiday.date.getFullYear() === thisYear) {
        stats.thisYear++;
      }
    });

    return stats;
  }

  /**
   * Export holidays configuration
   */
  exportHolidays() {
    return {
      holidays: Array.from(this.holidayConfig.values()),
      exportedAt: new Date(),
      version: '1.0'
    };
  }

  /**
   * Import holidays configuration
   */
  importHolidays(holidayData) {
    try {
      if (!holidayData.holidays || !Array.isArray(holidayData.holidays)) {
        throw new Error('Invalid holiday data format');
      }

      // Clear existing holidays
      this.holidays.clear();
      this.holidayConfig.clear();

      // Import holidays
      holidayData.holidays.forEach(holiday => {
        const holidayWithDate = {
          ...holiday,
          date: new Date(holiday.date) // Ensure date is Date object
        };
        
        const dateKey = format(holidayWithDate.date, 'yyyy-MM-dd');
        this.holidays.set(dateKey, holidayWithDate);
        this.holidayConfig.set(holidayWithDate.id, holidayWithDate);
      });

      return true;
    } catch (error) {
      console.error('Failed to import holidays:', error);
      return false;
    }
  }

  /**
   * Generate unique holiday ID
   */
  generateHolidayId() {
    return `holiday_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all holidays
   */
  clearAllHolidays() {
    this.holidays.clear();
    this.holidayConfig.clear();
  }

  /**
   * Reset to default holidays
   */
  resetToDefaults() {
    this.clearAllHolidays();
    this.loadDefaultHolidays();
  }

  /**
   * Get holidays as simple date array (for calendar component)
   */
  getHolidayDates() {
    return Array.from(this.holidays.values()).map(holiday => holiday.date);
  }

  /**
   * Check if date conflicts with existing holiday
   */
  hasConflict(date, excludeId = null) {
    const dateKey = format(date, 'yyyy-MM-dd');
    const existingHoliday = this.holidays.get(dateKey);
    
    if (!existingHoliday) return false;
    if (excludeId && existingHoliday.id === excludeId) return false;
    
    return true;
  }
}

// Create singleton instance
const holidayService = new HolidayService();

export default holidayService;
export { HolidayService };