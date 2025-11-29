import { leaveService } from './api';

/**
 * Leave validation service for client-side validation logic
 */
export class LeaveValidationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Calculate number of days between two dates (inclusive)
   */
  calculateLeaveDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }
    
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Validate leave request against monthly limits
   */
  async validateLeaveRequest(userId, startDate, endDate, retryCount = 0) {
    const maxRetries = 2;
    const retryDelay = 1000; // 1 second
    
    try {
      // Check cache first
      const cacheKey = `${userId}-${startDate}-${endDate}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Make API call
      const response = await leaveService.validateLeaveRequest(userId, startDate, endDate);
      const validationResult = response.data.data;

      // Cache the result
      this.cache.set(cacheKey, {
        data: validationResult,
        timestamp: Date.now()
      });

      return validationResult;
    } catch (error) {
      console.error('Leave validation error:', error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        console.log(`Retrying validation (${retryCount + 1}/${maxRetries})...`);
        await this.delay(retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        return this.validateLeaveRequest(userId, startDate, endDate, retryCount + 1);
      }
      
      // Return fallback validation for graceful degradation
      const requestedDays = this.calculateLeaveDays(startDate, endDate);
      const fallbackMessage = this.getFallbackMessage(error);
      
      return {
        isValid: true, // Allow submission when validation fails
        currentUsage: 0,
        projectedUsage: requestedDays,
        remainingLeaves: 3,
        requestedDays,
        exceedsLimit: false,
        limitReached: false,
        monthlyLimit: 3,
        message: fallbackMessage,
        canOverride: false,
        validationFailed: true,
        errorType: this.getErrorType(error)
      };
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    // Retry on network errors or 5xx server errors
    return !error.response || 
           error.code === 'NETWORK_ERROR' ||
           error.code === 'ECONNABORTED' ||
           (error.response.status >= 500 && error.response.status < 600);
  }

  /**
   * Get error type for better handling
   */
  getErrorType(error) {
    if (!error.response) return 'NETWORK_ERROR';
    if (error.response.status === 401) return 'UNAUTHORIZED';
    if (error.response.status === 403) return 'FORBIDDEN';
    if (error.response.status === 404) return 'NOT_FOUND';
    if (error.response.status >= 500) return 'SERVER_ERROR';
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly fallback message based on error
   */
  getFallbackMessage(error) {
    const errorType = this.getErrorType(error);
    
    switch (errorType) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to server. Please check your internet connection.';
      case 'UNAUTHORIZED':
        return 'Session expired. Please log in again.';
      case 'FORBIDDEN':
        return 'You do not have permission to check leave limits.';
      case 'SERVER_ERROR':
        return 'Server is temporarily unavailable. Please try again later.';
      default:
        return 'Unable to validate against monthly limit. Please check your leave balance manually.';
    }
  }

  /**
   * Delay helper for retry logic
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get validation status color based on limit data
   */
  getValidationStatusColor(validationResult) {
    if (!validationResult) return 'gray';
    
    if (validationResult.limitReached || validationResult.exceedsLimit) {
      return 'red';
    }
    
    if (validationResult.remainingLeaves <= 1) {
      return 'yellow';
    }
    
    return 'green';
  }

  /**
   * Get validation status message
   */
  getValidationStatusMessage(validationResult) {
    if (!validationResult) return 'Checking leave limit...';
    
    if (validationResult.validationFailed) {
      return 'Unable to check leave limit';
    }
    
    return validationResult.message;
  }

  /**
   * Check if submit should be disabled
   */
  shouldDisableSubmit(validationResult) {
    if (!validationResult) return false;
    
    // Don't disable if validation failed (graceful degradation)
    if (validationResult.validationFailed) return false;
    
    // Disable if limit would be exceeded
    return validationResult.exceedsLimit;
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Clear cache for specific user
   */
  clearUserCache(userId) {
    for (const [key] of this.cache) {
      if (key.startsWith(`${userId}-`)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const leaveValidation = new LeaveValidationService();
export default leaveValidation;