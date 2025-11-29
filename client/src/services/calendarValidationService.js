import dateValidationService from './dateValidationService';
import holidayService from './holidayService';
import { calculateMonthlyImpact, formatDateForAPI, formatDateForDisplay } from '../utils/calendarUtils';
import axios from 'axios';

/**
 * Calendar Validation Service
 * Provides real-time validation for calendar date selections with API integration
 */
class CalendarValidationService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.validationCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Real-time validation for date selection
   */
  async validateDateSelection(selectedDates, userId, currentLeaveUsage = {}) {
    try {
      // Get holidays for validation
      const holidays = holidayService.getHolidayDates();
      
      // Perform client-side validation first
      const clientValidation = dateValidationService.validateDateSelection(
        selectedDates, 
        holidays, 
        currentLeaveUsage
      );

      // If client validation fails, return immediately
      if (!clientValidation.isValid) {
        return {
          ...clientValidation,
          source: 'client',
          timestamp: new Date()
        };
      }

      // Perform server-side validation for additional checks
      const serverValidation = await this.validateWithServer(selectedDates, userId);
      
      // Combine client and server validation results
      return this.combineValidationResults(clientValidation, serverValidation);

    } catch (error) {
      console.error('Validation error:', error);
      
      // Fallback to client-side validation only
      const holidays = holidayService.getHolidayDates();
      const fallbackValidation = dateValidationService.validateDateSelection(
        selectedDates, 
        holidays, 
        currentLeaveUsage
      );

      return {
        ...fallbackValidation,
        source: 'client-fallback',
        serverError: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Server-side validation via API
   */
  async validateWithServer(selectedDates, userId) {
    const cacheKey = `${userId}-${selectedDates.map(formatDateForAPI).join(',')}`;
    
    // Check cache first
    const cached = this.validationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }

    try {
      const response = await axios.post(`${this.apiBaseUrl}/calendar/validate-dates`, {
        selectedDates: selectedDates.map(formatDateForAPI),
        userId
      });

      const validation = response.data.validation;
      
      // Cache the result
      this.validationCache.set(cacheKey, {
        data: validation,
        timestamp: Date.now()
      });

      return validation;

    } catch (error) {
      if (error.response?.data?.validation) {
        return error.response.data.validation;
      }
      throw error;
    }
  }

  /**
   * Combine client and server validation results
   */
  combineValidationResults(clientValidation, serverValidation) {
    return {
      isValid: clientValidation.isValid && serverValidation.isValid,
      errors: [...clientValidation.errors, ...serverValidation.errors],
      warnings: [...clientValidation.warnings, ...serverValidation.warnings],
      validDates: clientValidation.validDates,
      invalidDates: [...clientValidation.invalidDates, ...serverValidation.invalidDates],
      monthlyImpact: clientValidation.monthlyImpact,
      totalDatesSelected: clientValidation.totalDatesSelected,
      validDatesCount: clientValidation.validDatesCount,
      invalidDatesCount: clientValidation.invalidDatesCount + serverValidation.invalidDatesCount,
      source: 'combined',
      clientValidation,
      serverValidation,
      timestamp: new Date()
    };
  }

  /**
   * Real-time feedback for single date selection
   */
  async validateSingleDateSelection(date, currentSelectedDates = [], userId) {
    const newSelection = [...currentSelectedDates, date];
    return await this.validateDateSelection(newSelection, userId);
  }

  /**
   * Validate date removal
   */
  async validateDateRemoval(dateToRemove, currentSelectedDates = [], userId) {
    const newSelection = currentSelectedDates.filter(d => d.getTime() !== dateToRemove.getTime());
    return await this.validateDateSelection(newSelection, userId);
  }

  /**
   * Get monthly leave balance with real-time updates
   */
  async getMonthlyLeaveBalance(userId, selectedDates = []) {
    try {
      // This would typically fetch from API, but for now calculate locally
      const monthlyImpact = calculateMonthlyImpact(selectedDates);
      const balanceImpact = dateValidationService.calculateLeaveBalanceImpact(
        selectedDates, 
        {} // Current usage would come from API
      );

      return {
        success: true,
        monthlyImpact: Object.fromEntries(monthlyImpact),
        balanceImpact: Object.fromEntries(balanceImpact),
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error calculating leave balance:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Validation feedback for UI components
   */
  getValidationFeedback(validationResult) {
    const feedback = {
      type: 'success',
      message: '',
      details: [],
      showWarning: false,
      allowSubmission: true
    };

    if (!validationResult.isValid) {
      feedback.type = 'error';
      feedback.allowSubmission = false;
      
      if (validationResult.errors.length === 1) {
        feedback.message = validationResult.errors[0].message || validationResult.errors[0];
      } else {
        feedback.message = `${validationResult.errors.length} validation errors found`;
        feedback.details = validationResult.errors.map(error => 
          error.message || error
        );
      }
    } else if (validationResult.warnings.length > 0) {
      feedback.type = 'warning';
      feedback.showWarning = true;
      
      if (validationResult.warnings.length === 1) {
        feedback.message = validationResult.warnings[0].message || validationResult.warnings[0];
      } else {
        feedback.message = `${validationResult.warnings.length} warnings`;
        feedback.details = validationResult.warnings.map(warning => 
          warning.message || warning
        );
      }
    } else {
      feedback.message = `${validationResult.validDatesCount} date${validationResult.validDatesCount !== 1 ? 's' : ''} selected`;
    }

    return feedback;
  }

  /**
   * Validation for form submission
   */
  async validateForSubmission(selectedDates, userId, reason = '') {
    if (selectedDates.length === 0) {
      return {
        isValid: false,
        errors: [{ type: 'NO_DATES', message: 'Please select at least one date' }],
        warnings: [],
        canSubmit: false
      };
    }

    if (!reason.trim()) {
      return {
        isValid: false,
        errors: [{ type: 'NO_REASON', message: 'Please provide a reason for leave' }],
        warnings: [],
        canSubmit: false
      };
    }

    const dateValidation = await this.validateDateSelection(selectedDates, userId);
    
    return {
      ...dateValidation,
      canSubmit: dateValidation.isValid,
      formValidation: {
        hasReason: reason.trim().length > 0,
        reasonLength: reason.trim().length,
        hasDates: selectedDates.length > 0,
        dateCount: selectedDates.length
      }
    };
  }

  /**
   * Get validation summary for display
   */
  getValidationSummary(validationResult) {
    const summary = {
      totalSelected: validationResult.totalDatesSelected || 0,
      validCount: validationResult.validDatesCount || 0,
      invalidCount: validationResult.invalidDatesCount || 0,
      errorCount: validationResult.errors?.length || 0,
      warningCount: validationResult.warnings?.length || 0,
      isValid: validationResult.isValid || false,
      monthlyBreakdown: {}
    };

    // Add monthly breakdown
    if (validationResult.monthlyImpact) {
      Object.entries(validationResult.monthlyImpact).forEach(([monthKey, impact]) => {
        summary.monthlyBreakdown[monthKey] = {
          label: impact.monthLabel || impact.label,
          count: impact.count,
          dates: impact.dates?.length || 0
        };
      });
    }

    return summary;
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.validationCache.size,
      entries: Array.from(this.validationCache.keys()),
      lastCleared: this.lastCacheCleared || null
    };
  }

  /**
   * Periodic cache cleanup
   */
  cleanupExpiredCache() {
    const now = Date.now();
    const expired = [];

    this.validationCache.forEach((value, key) => {
      if ((now - value.timestamp) > this.cacheExpiry) {
        expired.push(key);
      }
    });

    expired.forEach(key => this.validationCache.delete(key));
    
    return expired.length;
  }

  /**
   * Set custom validation configuration
   */
  setConfiguration(config) {
    if (config.monthlyLimit) {
      dateValidationService.setMonthlyLimit(config.monthlyLimit);
    }
    
    if (config.maxFutureMonths) {
      dateValidationService.setMaxFutureMonths(config.maxFutureMonths);
    }
    
    if (config.cacheExpiry) {
      this.cacheExpiry = config.cacheExpiry;
    }
  }

  /**
   * Get current configuration
   */
  getConfiguration() {
    return {
      ...dateValidationService.getConfiguration(),
      cacheExpiry: this.cacheExpiry,
      apiBaseUrl: this.apiBaseUrl
    };
  }
}

// Create singleton instance
const calendarValidationService = new CalendarValidationService();

// Setup periodic cache cleanup
setInterval(() => {
  calendarValidationService.cleanupExpiredCache();
}, 60000); // Cleanup every minute

export default calendarValidationService;
export { CalendarValidationService };