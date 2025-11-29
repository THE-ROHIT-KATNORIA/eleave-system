import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LeaveLimitWarning from '../LeaveLimitWarning';

describe('LeaveLimitWarning', () => {
  const mockLimitData = {
    currentUsage: 2,
    monthlyLimit: 3,
    remainingLeaves: 1,
    requestedDays: 2,
    exceedsLimit: true,
    limitReached: false,
    message: 'This request would exceed your monthly limit by 1 day.'
  };

  const defaultProps = {
    isOpen: true,
    limitData: mockLimitData,
    projectedUsage: 4,
    onClose: vi.fn(),
    onConfirm: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render warning dialog when open', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    expect(screen.getByText('Leave Limit Reached')).toBeInTheDocument();
    expect(screen.getByText(/exceed your monthly limit by 1 day/)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<LeaveLimitWarning {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Leave Limit Reached')).not.toBeInTheDocument();
  });

  it('should display usage breakdown correctly', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    expect(screen.getByText('2 days')).toBeInTheDocument(); // Current usage
    expect(screen.getByText('+2 days')).toBeInTheDocument(); // Requested
    expect(screen.getByText('4 / 3 days')).toBeInTheDocument(); // Total would be
  });

  it('should call onClose when close button clicked', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay clicked', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    const overlay = document.querySelector('.leave-warning-overlay');
    fireEvent.click(overlay);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onClose when modal content clicked', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    const modal = document.querySelector('.leave-warning-modal');
    fireEvent.click(modal);
    
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should call onClose when escape key pressed', async () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should show modify request button', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    const modifyButton = screen.getByRole('button', { name: /modify request/i });
    expect(modifyButton).toBeInTheDocument();
    
    fireEvent.click(modifyButton);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should show submit anyway button when onConfirm provided', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    const submitButton = screen.getByRole('button', { name: /submit anyway/i });
    expect(submitButton).toBeInTheDocument();
    
    fireEvent.click(submitButton);
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should not show submit anyway button when onConfirm not provided', () => {
    const propsWithoutConfirm = { ...defaultProps, onConfirm: null };
    render(<LeaveLimitWarning {...propsWithoutConfirm} />);
    
    expect(screen.queryByRole('button', { name: /submit anyway/i })).not.toBeInTheDocument();
  });

  it('should display different message for limit already reached', () => {
    const limitReachedData = {
      ...mockLimitData,
      currentUsage: 3,
      limitReached: true,
      remainingLeaves: 0
    };
    
    render(<LeaveLimitWarning {...defaultProps} limitData={limitReachedData} />);
    
    expect(screen.getByText(/already used all your leave days/)).toBeInTheDocument();
  });

  it('should show policy information', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    expect(screen.getByText('Monthly Leave Policy')).toBeInTheDocument();
    expect(screen.getByText(/3 approved leaves per calendar month/)).toBeInTheDocument();
  });

  it('should show suggestions', () => {
    render(<LeaveLimitWarning {...defaultProps} />);
    
    expect(screen.getByText('What you can do:')).toBeInTheDocument();
    expect(screen.getByText(/Modify your leave dates/)).toBeInTheDocument();
    expect(screen.getByText(/Split your request/)).toBeInTheDocument();
  });

  it('should show remaining leaves suggestion when applicable', () => {
    const dataWithRemaining = {
      ...mockLimitData,
      remainingLeaves: 1,
      exceedsLimit: true
    };
    
    render(<LeaveLimitWarning {...defaultProps} limitData={dataWithRemaining} />);
    
    expect(screen.getByText(/Request only 1 day to stay within/)).toBeInTheDocument();
  });

  it('should handle missing limit data gracefully', () => {
    render(<LeaveLimitWarning {...defaultProps} limitData={null} />);
    
    expect(screen.queryByText('Leave Limit Reached')).not.toBeInTheDocument();
  });

  it('should prevent body scroll when open', () => {
    const { rerender } = render(<LeaveLimitWarning {...defaultProps} isOpen={false} />);
    
    expect(document.body.style.overflow).toBe('');
    
    rerender(<LeaveLimitWarning {...defaultProps} isOpen={true} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<LeaveLimitWarning {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });
});