import { 
  isDatePast, 
  isDateSunday, 
  isDateHoliday, 
  isDateBeyondFutureLimit,
  validateSelectedDates,
  calculateMonthlyImpact,
  formatDateForDisplay
} from '../utils/calendarUtils';

/**
 * Date Validation Service
 * Provides comprehensive validation for calendar date selections
 */
class DateValidationService {
  constructor() {
    this.monthlyLimit = 3; // Default monthly leave limit
    this.maxFutureMonths = 6; // Maximum months in future for selection
  }

  /**
   * Validate a single date against all business rules
   */
  validateSingleDate(date, holidays = []) {
    const errors = [];
    const warnings = [];

    if (isDatePast(date)) {
      errors.push({
        type: 'PAST_DATE',
        message: `Cannot select past date: ${formatDateForDisplay(date)}`,
        date: date
      });
    }

    if (isDateSunday(date)) {
      errors.push({
        type: 'SUNDAY',
        message: `Cannot select Sunday: ${formatDateForDisplay(date)}`,
        date: date
      });
    }

    if (isDateHoliday(date, holidays)) {
      const holiday = holidays.find(h => h.getTime() === date.getTime());
      errors.push({
        type: 'HOLIDAY',
        message: `Cannot select holiday: ${formatDateForDisplay(date)}`,
        date: date,
        holidayName: holiday?.name || 'Holiday'
      });
    }

    if (isDateBeyondFutureLimit(date, this.maxFutureMonths)) {
      errors.push({
        type: 'FUTURE_LIMIT',
        message: `Date beyond ${this.maxFutureMonths} month limit: ${formatDateForDisplay(date)}`,
        date: date
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate an array of selected dates
   */
  validateDateSelection(selectedDates, holidays = [], currentLeaveUsage = {}) {
    const errors = [];
    const warnings = [];
    const validDates = [];
    const invalidDates = [];

    // Validate each individual date
    selectedDates.forEach(date => {
      const validation = this.validateSingleDate(date, holidays);
      
      if (validation.isValid) {
        validDates.push(date);
      } else {
        invalidDates.push(date);
        errors.push(...validation.errors);
      }
    });

    // Check monthly limits
    const monthlyImpact = calculateMonthlyImpact(validDates);
    
    monthlyImpact.forEach((impact, monthKey) => {
      const currentUsage = currentLeaveUsage[monthKey] || 0;
      const totalAfterSelection = currentUsage + impact.count;
      
      if (totalAfterSelection > this.monthlyLimit) {
        const overage = totalAfterSelection - this.monthlyLimit;
        errors.push({
          type: 'MONTHLY_LIMIT_EXCEEDED',
          message: `Selection exceeds monthly limit for ${impact.monthLabel} by ${overage} day${overage > 1 ? 's' : ''}`,
          monthKey,
          monthLabel: impact.monthLabel,
          currentUsage,
          selectedCount: impact.count,
          totalAfterSelection,
          overage
        });
      } else if (totalAfterSelection === this.monthlyLimit) {
        warnings.push({
          type: 'MONTHLY_LIMIT_REACHED',
          message: `Selection will reach monthly limit for ${impact.monthLabel}`,
          monthKey,
          monthLabel: impact.monthLabel
        });
      } else if (totalAfterSelection >= this.monthlyLimit - 1) {
        warnings.push({
          type: 'MONTHLY_LIMIT_WARNING',
          message: `Only ${this.monthlyLimit - totalAfterSelection} leave${this.monthlyLimit - totalAfterSelection !== 1 ? 's' : ''} remaining for ${impact.monthLabel} after this selection`,
          monthKey,
          monthLabel: impact.monthLabel
        });
      }
    });

    // Check for large selections
    if (selectedDates.length > 10) {
      warnings.push({
        type: 'LARGE_SELECTION',
        message: `Large selection: ${selectedDates.length} dates selected`,
        count: selectedDates.length
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validDates,
      invalidDates,
      monthlyImpact,
      totalDatesSelected: selectedDates.length,
      validDatesCount: validDates.length,
      invalidDatesCount: invalidDates.length
    };
  }

  /**
   * Check if a date can be selected (quick validation)
   */
  canSelectDate(date, holidays = []) {
    return !isDatePast(date) && 
           !isDateSunday(date) && 
           !isDateHoliday(date, holidays) && 
           !isDateBeyondFutureLimit(date, this.maxFutureMonths);
  }

  /**
   * Get validation message for a disabled date
   */
  getDisabledDateMessage(date, holidays = []) {
    if (isDatePast(date)) {
      return 'Past dates cannot be selected';
    }
    
    if (isDateSunday(date)) {
      return 'Sundays are not valid leave days';
    }
    
    if (isDateHoliday(date, holidays)) {
      const holiday = holidays.find(h => h.getTime() === date.getTime());
      return `Holiday: ${holiday?.name || 'College Holiday'}`;
    }
    
    if (isDateBeyondFutureLimit(date, this.maxFutureMonths)) {
      return `Beyond ${this.maxFutureMonths} month selection limit`;
    }
    
    return 'Date cannot be selected';
  }

  /**
   * Validate date range (for backward compatibility with traditional forms)
   */
  validateDateRange(startDate, endDate, holidays = []) {
    const errors = [];
    
    if (startDate > endDate) {
      errors.push({
        type: 'INVALID_RANGE',
        message: 'Start date must be before end date'
      });
      return { isValid: false, errors, warnings: [] };
    }

    // Generate all dates in range
    const dates = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return this.validateDateSelection(dates, holidays);
  }

  /**
   * Calculate leave balance impact
   */
  calculateLeaveBalanceImpact(selectedDates, currentMonthlyUsage = {}) {
    const impact = calculateMonthlyImpact(selectedDates);
    const balanceImpact = new Map();

    impact.forEach((monthData, monthKey) => {
      const currentUsage = currentMonthlyUsage[monthKey] || 0;
      const afterSelection = currentUsage + monthData.count;
      const remaining = Math.max(0, this.monthlyLimit - afterSelection);
      const exceeds = afterSelection > this.monthlyLimit;
      const overage = exceeds ? afterSelection - this.monthlyLimit : 0;

      balanceImpact.set(monthKey, {
        monthLabel: monthData.monthLabel,
        currentUsage,
        selectedCount: monthData.count,
        afterSelection,
        remaining,
        exceeds,
        overage,
        monthlyLimit: this.monthlyLimit
      });
    });

    return balanceImpact;
  }

  /**
   * Set custom monthly limit (for different streams or configurations)
   */
  setMonthlyLimit(limit) {
    this.monthlyLimit = limit;
  }

  /**
   * Set maximum future months for selection
   */
  setMaxFutureMonths(months) {
    this.maxFutureMonths = months;
  }

  /**
   * Get current configuration
   */
  getConfiguration() {
    return {
      monthlyLimit: this.monthlyLimit,
      maxFutureMonths: this.maxFutureMonths
    };
  }
}

// Create singleton instance
const dateValidationService = new DateValidationService();

export default dateValidationService;
export { DateValidationService };