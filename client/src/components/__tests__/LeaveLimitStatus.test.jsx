import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeaveLimitStatus from '../LeaveLimitStatus';
import { leaveService } from '../../services/api';
import leaveValidation from '../../services/leaveValidation';

// Mock the API service
vi.mock('../../services/api', () => ({
  leaveService: {
    getMonthlyLeaveLimit: vi.fn()
  },
  getErrorMessage: vi.fn((error) => error.message || 'Unknown error')
}));

// Mock the validation service
vi.mock('../../services/leaveValidation', () => ({
  default: {
    validateLeaveRequest: vi.fn(),
    getValidationStatusColor: vi.fn(),
    getValidationStatusMessage: vi.fn(),
    calculateLeaveDays: vi.fn()
  }
}));

describe('LeaveLimitStatus', () => {
  const mockLimitData = {
    monthlyLimit: 3,
    approvedThisMonth: 1,
    remainingLeaves: 2,
    currentMonth: 'January',
    currentYear: 2025
  };

  const mockValidationData = {
    isValid: true,
    currentUsage: 1,
    projectedUsage: 3,
    remainingLeaves: 2,
    requestedDays: 2,
    exceedsLimit: false,
    limitReached: false,
    monthlyLimit: 3,
    message: 'Within limit'
  };

  const defaultProps = {
    userId: 'user1',
    selectedDates: {
      startDate: '2025-01-15',
      endDate: '2025-01-16'
    },
    onLimitCheck: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    leaveService.getMonthlyLeaveLimit.mockResolvedValue({
      data: { data: mockLimitData }
    });
    leaveValidation.validateLeaveRequest.mockResolvedValue(mockValidationData);
    leaveValidation.getValidationStatusColor.mockReturnValue('green');
    leaveValidation.getValidationStatusMessage.mockReturnValue('2 leaves remaining in January');
    leaveValidation.calculateLeaveDays.mockReturnValue(2);
  });

  it('should render loading state initially', () => {
    render(<LeaveLimitStatus {...defaultProps} />);
    
    expect(screen.getByText('Checking leave balance...')).toBeInTheDocument();
  });

  it('should fetch and display limit data', async () => {
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Leave Balance')).toBeInTheDocument();
    });
    
    expect(leaveService.getMonthlyLeaveLimit).toHaveBeenCalledWith('user1');
  });

  it('should validate dates when selected dates change', async () => {
    const { rerender } = render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Leave Balance')).toBeInTheDocument();
    });
    
    // Change selected dates
    rerender(<LeaveLimitStatus 
      {...defaultProps} 
      selectedDates={{ startDate: '2025-01-20', endDate: '2025-01-22' }}
    />);
    
    await waitFor(() => {
      expect(leaveValidation.validateLeaveRequest).toHaveBeenCalledWith(
        'user1', 
        '2025-01-20', 
        '2025-01-22'
      );
    });
  });

  it('should call onLimitCheck with validation results', async () => {
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(defaultProps.onLimitCheck).toHaveBeenCalledWith(true, mockValidationData);
    });
  });

  it('should display usage bar correctly', async () => {
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('1 used')).toBeInTheDocument();
      expect(screen.getByText('3 total')).toBeInTheDocument();
    });
  });

  it('should show projected usage when dates selected', async () => {
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('+2 requested')).toBeInTheDocument();
    });
  });

  it('should display warning badge when limit exceeded', async () => {
    const exceedsLimitData = {
      ...mockValidationData,
      exceedsLimit: true,
      projectedUsage: 4
    };
    
    leaveValidation.validateLeaveRequest.mockResolvedValue(exceedsLimitData);
    leaveValidation.getValidationStatusColor.mockReturnValue('red');
    
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Exceeds monthly limit')).toBeInTheDocument();
    });
  });

  it('should show different status colors based on validation', async () => {
    leaveValidation.getValidationStatusColor.mockReturnValue('yellow');
    
    const { container } = render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(container.querySelector('.leave-limit-status.yellow')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const error = new Error('Network error');
    leaveService.getMonthlyLeaveLimit.mockRejectedValue(error);
    
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to Load Leave Balance')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should show retry button on error', async () => {
    const error = new Error('Network error');
    leaveService.getMonthlyLeaveLimit.mockRejectedValueOnce(error)
      .mockResolvedValue({ data: { data: mockLimitData } });
    
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(screen.getByText('Leave Balance')).toBeInTheDocument();
    });
    
    expect(leaveService.getMonthlyLeaveLimit).toHaveBeenCalledTimes(2);
  });

  it('should handle validation errors with fallback', async () => {
    const validationError = new Error('Validation failed');
    leaveValidation.validateLeaveRequest.mockRejectedValue(validationError);
    leaveValidation.calculateLeaveDays.mockReturnValue(2);
    
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(defaultProps.onLimitCheck).toHaveBeenCalledWith(
        true, 
        expect.objectContaining({
          validationFailed: true,
          errorType: 'VALIDATION_ERROR'
        })
      );
    });
  });

  it('should not validate when no dates selected', async () => {
    const propsWithoutDates = {
      ...defaultProps,
      selectedDates: { startDate: '', endDate: '' }
    };
    
    render(<LeaveLimitStatus {...propsWithoutDates} />);
    
    await waitFor(() => {
      expect(screen.getByText('Leave Balance')).toBeInTheDocument();
    });
    
    expect(leaveValidation.validateLeaveRequest).not.toHaveBeenCalled();
    expect(defaultProps.onLimitCheck).toHaveBeenCalledWith(true, null);
  });

  it('should show tooltip on hover', async () => {
    render(<LeaveLimitStatus {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Leave Balance')).toBeInTheDocument();
    });
    
    const tooltip = document.querySelector('.status-tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  it('should retry on retryable errors', async () => {
    const networkError = new Error('Network error');
    networkError.code = 'NETWORK_ERROR';
    
    leaveService.getMonthlyLeaveLimit
      .mockRejectedValueOnce(networkError)
      .mockResolvedValue({ data: { data: mockLimitData } });
    
    render(<LeaveLimitStatus {...defaultProps} />);
    
    // Wait for retry to complete
    await waitFor(() => {
      expect(screen.getByText('Leave Balance')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(leaveService.getMonthlyLeaveLimit).toHaveBeenCalledTimes(2);
  });

  it('should not render when userId is missing', () => {
    render(<LeaveLimitStatus {...defaultProps} userId={null} />);
    
    expect(screen.queryByText('Checking leave balance...')).not.toBeInTheDocument();
  });
});