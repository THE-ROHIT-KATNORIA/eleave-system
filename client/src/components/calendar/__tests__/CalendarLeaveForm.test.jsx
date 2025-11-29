import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CalendarLeaveForm from '../CalendarLeaveForm';

// Mock the auth context
const mockUser = {
  id: 'user-1',
  name: 'John Doe',
  rollNumber: 'BCA2023001',
  stream: 'BCA'
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}));

// Mock calendar components
vi.mock('../Calendar3D', () => ({
  default: ({ onDateSelect }) => (
    <div data-testid="calendar-3d">
      <button 
        onClick={() => onDateSelect([new Date('2025-01-15')])}
        data-testid="select-date"
      >
        Select Date
      </button>
    </div>
  )
}));

vi.mock('../LeaveBalanceIndicator3D', () => ({
  default: () => <div data-testid="balance-indicator">Balance Indicator</div>
}));

vi.mock('../SelectedDatesSummary', () => ({
  default: ({ selectedDates, onRemoveDate, onClearAll }) => (
    <div data-testid="dates-summary">
      <span>Selected: {selectedDates.length}</span>
      <button onClick={() => onRemoveDate(selectedDates[0])}>Remove First</button>
      <button onClick={onClearAll}>Clear All</button>
    </div>
  )
}));

// Mock services
vi.mock('../../services/calendarValidationService', () => ({
  default: {
    validateDateSelection: vi.fn().mockResolvedValue({
      isValid: true,
      errors: [],
      warnings: []
    }),
    getValidationFeedback: vi.fn().mockReturnValue({
      type: 'success',
      message: 'Valid selection'
    })
  }
}));

vi.mock('../../services/leaveBalanceService', () => ({
  default: {
    getCurrentBalance: vi.fn().mockResolvedValue({
      used: 1,
      remaining: 2,
      limit: 3
    }),
    getBalancePreview: vi.fn().mockResolvedValue({
      success: true,
      balanceImpact: {}
    })
  }
}));

vi.mock('../../services/holidayService', () => ({
  default: {
    getHolidayDates: vi.fn().mockReturnValue([])
  }
}));

describe('CalendarLeaveForm', () => {
  const mockProps = {
    onSubmitSuccess: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders form with user information', () => {
    render(<CalendarLeaveForm {...mockProps} />);
    
    expect(screen.getByText('Submit Leave Request')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('BCA2023001')).toBeInTheDocument();
    expect(screen.getByText('BCA')).toBeInTheDocument();
  });

  test('renders calendar and balance components', () => {
    render(<CalendarLeaveForm {...mockProps} />);
    
    expect(screen.getByTestId('calendar-3d')).toBeInTheDocument();
    expect(screen.getByTestId('balance-indicator')).toBeInTheDocument();
  });

  test('handles date selection', async () => {
    render(<CalendarLeaveForm {...mockProps} />);
    
    const selectButton = screen.getByTestId('select-date');
    fireEvent.click(selectButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('dates-summary')).toBeInTheDocument();
      expect(screen.getByText('Selected: 1')).toBeInTheDocument();
    });
  });

  test('validates reason input', () => {
    render(<CalendarLeaveForm {...mockProps} />);
    
    const reasonInput = screen.getByPlaceholderText(/provide a detailed reason/i);
    expect(reasonInput).toBeInTheDocument();
    
    fireEvent.change(reasonInput, { target: { value: 'Medical appointment' } });
    expect(reasonInput.value).toBe('Medical appointment');
  });

  test('submit button is disabled when no dates selected', () => {
    render(<CalendarLeaveForm {...mockProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    expect(submitButton).toBeDisabled();
  });

  test('shows character count for reason', () => {
    render(<CalendarLeaveForm {...mockProps} />);
    
    const reasonInput = screen.getByPlaceholderText(/provide a detailed reason/i);
    fireEvent.change(reasonInput, { target: { value: 'Test reason' } });
    
    expect(screen.getByText('11/500 characters')).toBeInTheDocument();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(<CalendarLeaveForm {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });
});