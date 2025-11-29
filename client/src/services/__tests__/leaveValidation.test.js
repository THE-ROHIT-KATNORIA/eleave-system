import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LeaveValidationService } from '../leaveValidation';
import { leaveService } from '../api';

// Mock the API service
vi.mock('../api', () => ({
  leaveService: {
    validateLeaveRequest: vi.fn()
  }
}));

describe('LeaveValidationService', () => {
  let validationService;

  beforeEach(() => {
    validationService = new LeaveValidationService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    validationService.clearCache();
  });

  describe('calculateLeaveDays', () => {
    it('should calculate correct number of days for single day', () => {
      const result = validationService.calculateLeaveDays('2025-01-15', '2025-01-15');
      expect(result).toBe(1);
    });

    it('should calculate correct number of days for multiple days', () => {
      const result = validationService.calculateLeaveDays('2025-01-15', '2025-01-17');
      expect(result).toBe(3);
    });

    it('should return 0 for invalid dates', () => {
      const result = validationService.calculateLeaveDays('invalid', '2025-01-15');
      expect(result).toBe(0);
    });

    it('should return 0 for end date before start date', () => {
      const result = validationService.calculateLeaveDays('2025-01-17', '2025-01-15');
      expect(result).toBe(0);
    });

    it('should return 0 for missing dates', () => {
      expect(validationService.calculateLeaveDays('', '2025-01-15')).toBe(0);
      expect(validationService.calculateLeaveDays('2025-01-15', '')).toBe(0);
      expect(validationService.calculateLeaveDays(null, '2025-01-15')).toBe(0);
    });
  });

  describe('validateLeaveRequest', () => {
    const mockValidationResponse = {
      data: {
        data: {
          isValid: true,
          currentUsage: 1,
          projectedUsage: 3,
          remainingLeaves: 2,
          requestedDays: 2,
          exceedsLimit: false,
          limitReached: false,
          monthlyLimit: 3,
          message: 'Within limit',
          canOverride: false
        }
      }
    };

    it('should return validation result from API', async () => {
      leaveService.validateLeaveRequest.mockResolvedValue(mockValidationResponse);

      const result = await validationService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');

      expect(result).toEqual(mockValidationResponse.data.data);
      expect(leaveService.validateLeaveRequest).toHaveBeenCalledWith('user1', '2025-01-15', '2025-01-16');
    });

    it('should cache validation results', async () => {
      leaveService.validateLeaveRequest.mockResolvedValue(mockValidationResponse);

      // First call
      await validationService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');
      // Second call should use cache
      await validationService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');

      expect(leaveService.validateLeaveRequest).toHaveBeenCalledTimes(1);
    });

    it('should return fallback validation on API error', async () => {
      const error = new Error('Network error');
      leaveService.validateLeaveRequest.mockRejectedValue(error);

      const result = await validationService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');

      expect(result.validationFailed).toBe(true);
      expect(result.isValid).toBe(true); // Should allow submission
      expect(result.requestedDays).toBe(2);
      expect(result.message).toContain('Unable to connect to server');
    });

    it('should retry on retryable errors', async () => {
      const networkError = new Error('Network error');
      networkError.code = 'NETWORK_ERROR';
      
      leaveService.validateLeaveRequest
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue(mockValidationResponse);

      const result = await validationService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');

      expect(result).toEqual(mockValidationResponse.data.data);
      expect(leaveService.validateLeaveRequest).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      
      leaveService.validateLeaveRequest.mockRejectedValue(authError);

      const result = await validationService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');

      expect(result.validationFailed).toBe(true);
      expect(result.errorType).toBe('UNAUTHORIZED');
      expect(leaveService.validateLeaveRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('getValidationStatusColor', () => {
    it('should return red for exceeded limit', () => {
      const validationResult = { exceedsLimit: true, limitReached: false };
      expect(validationService.getValidationStatusColor(validationResult)).toBe('red');
    });

    it('should return red for reached limit', () => {
      const validationResult = { exceedsLimit: false, limitReached: true };
      expect(validationService.getValidationStatusColor(validationResult)).toBe('red');
    });

    it('should return yellow for low remaining leaves', () => {
      const validationResult = { exceedsLimit: false, limitReached: false, remainingLeaves: 1 };
      expect(validationService.getValidationStatusColor(validationResult)).toBe('yellow');
    });

    it('should return green for sufficient remaining leaves', () => {
      const validationResult = { exceedsLimit: false, limitReached: false, remainingLeaves: 2 };
      expect(validationService.getValidationStatusColor(validationResult)).toBe('green');
    });

    it('should return gray for null validation result', () => {
      expect(validationService.getValidationStatusColor(null)).toBe('gray');
    });
  });

  describe('shouldDisableSubmit', () => {
    it('should disable submit when limit exceeded', () => {
      const validationResult = { exceedsLimit: true, validationFailed: false };
      expect(validationService.shouldDisableSubmit(validationResult)).toBe(true);
    });

    it('should not disable submit when validation failed', () => {
      const validationResult = { exceedsLimit: true, validationFailed: true };
      expect(validationService.shouldDisableSubmit(validationResult)).toBe(false);
    });

    it('should not disable submit when within limit', () => {
      const validationResult = { exceedsLimit: false, validationFailed: false };
      expect(validationService.shouldDisableSubmit(validationResult)).toBe(false);
    });

    it('should not disable submit for null validation result', () => {
      expect(validationService.shouldDisableSubmit(null)).toBe(false);
    });
  });

  describe('error handling methods', () => {
    it('should identify retryable errors correctly', () => {
      expect(validationService.isRetryableError({ code: 'NETWORK_ERROR' })).toBe(true);
      expect(validationService.isRetryableError({ response: { status: 500 } })).toBe(true);
      expect(validationService.isRetryableError({ response: { status: 401 } })).toBe(false);
    });

    it('should get correct error types', () => {
      expect(validationService.getErrorType({})).toBe('NETWORK_ERROR');
      expect(validationService.getErrorType({ response: { status: 401 } })).toBe('UNAUTHORIZED');
      expect(validationService.getErrorType({ response: { status: 403 } })).toBe('FORBIDDEN');
      expect(validationService.getErrorType({ response: { status: 404 } })).toBe('NOT_FOUND');
      expect(validationService.getErrorType({ response: { status: 500 } })).toBe('SERVER_ERROR');
      expect(validationService.getErrorType({ response: { status: 400 } })).toBe('UNKNOWN_ERROR');
    });

    it('should provide appropriate fallback messages', () => {
      expect(validationService.getFallbackMessage({ code: 'NETWORK_ERROR' }))
        .toContain('check your internet connection');
      expect(validationService.getFallbackMessage({ response: { status: 401 } }))
        .toContain('log in again');
      expect(validationService.getFallbackMessage({ response: { status: 500 } }))
        .toContain('temporarily unavailable');
    });
  });

  describe('cache management', () => {
    it('should clear cache correctly', () => {
      validationService.cache.set('test-key', { data: 'test', timestamp: Date.now() });
      expect(validationService.cache.size).toBe(1);
      
      validationService.clearCache();
      expect(validationService.cache.size).toBe(0);
    });

    it('should clear user-specific cache', () => {
      validationService.cache.set('user1-2025-01-15-2025-01-16', { data: 'test1', timestamp: Date.now() });
      validationService.cache.set('user2-2025-01-15-2025-01-16', { data: 'test2', timestamp: Date.now() });
      
      validationService.clearUserCache('user1');
      
      expect(validationService.cache.has('user1-2025-01-15-2025-01-16')).toBe(false);
      expect(validationService.cache.has('user2-2025-01-15-2025-01-16')).toBe(true);
    });

    it('should expire cached data after timeout', async () => {
      // Create service with short cache timeout for testing
      const shortCacheService = new LeaveValidationService();
      shortCacheService.cacheTimeout = 100; // 100ms
      
      leaveService.validateLeaveRequest.mockResolvedValue(mockValidationResponse);
      
      // First call
      await shortCacheService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Second call should hit API again
      await shortCacheService.validateLeaveRequest('user1', '2025-01-15', '2025-01-16');
      
      expect(leaveService.validateLeaveRequest).toHaveBeenCalledTimes(2);
    });
  });
});