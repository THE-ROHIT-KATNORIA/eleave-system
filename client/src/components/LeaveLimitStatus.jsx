import { useState, useEffect } from 'react';
import { leaveService, getErrorMessage } from '../services/api';
import leaveValidation from '../services/leaveValidation';
import './LeaveLimitStatus.css';

const LeaveLimitStatus = ({ userId, selectedDates, onLimitCheck }) => {
  const [limitData, setLimitData] = useState(null);
  const [validationData, setValidationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch monthly limit data on component mount
  useEffect(() => {
    if (userId) {
      fetchMonthlyLimit();
    }
  }, [userId]);

  // Validate dates when they change
  useEffect(() => {
    if (userId && selectedDates?.startDate && selectedDates?.endDate) {
      validateDates();
    } else {
      setValidationData(null);
      if (onLimitCheck) {
        onLimitCheck(true, null);
      }
    }
  }, [userId, selectedDates?.startDate, selectedDates?.endDate]);

  const fetchMonthlyLimit = async (retryCount = 0) => {
    const maxRetries = 2;
    const retryDelay = 1000;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await leaveService.getMonthlyLeaveLimit(userId);
      setLimitData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch monthly leave limit:', err);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && isRetryableError(err)) {
        console.log(`Retrying limit fetch (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          fetchMonthlyLimit(retryCount + 1);
        }, retryDelay * Math.pow(2, retryCount));
        return;
      }
      
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isRetryableError = (error) => {
    return !error.response || 
           error.code === 'NETWORK_ERROR' ||
           error.code === 'ECONNABORTED' ||
           (error.response && error.response.status >= 500 && error.response.status < 600);
  };

  const validateDates = async () => {
    try {
      const result = await leaveValidation.validateLeaveRequest(
        userId, 
        selectedDates.startDate, 
        selectedDates.endDate
      );
      setValidationData(result);
      
      if (onLimitCheck) {
        onLimitCheck(!result.exceedsLimit, result);
      }
    } catch (err) {
      console.error('Validation error:', err);
      
      // Create fallback validation data
      const fallbackData = {
        isValid: true,
        currentUsage: limitData?.approvedThisMonth || 0,
        projectedUsage: leaveValidation.calculateLeaveDays(selectedDates.startDate, selectedDates.endDate),
        remainingLeaves: limitData?.remainingLeaves || 3,
        requestedDays: leaveValidation.calculateLeaveDays(selectedDates.startDate, selectedDates.endDate),
        exceedsLimit: false,
        limitReached: false,
        monthlyLimit: 3,
        message: 'Unable to validate dates. Please verify your leave balance.',
        validationFailed: true,
        errorType: 'VALIDATION_ERROR'
      };
      
      setValidationData(fallbackData);
      
      if (onLimitCheck) {
        onLimitCheck(true, fallbackData); // Allow submission with warning
      }
    }
  };

  if (loading) {
    return (
      <div className="leave-limit-status loading">
        <div className="status-spinner"></div>
        <span>Checking leave balance...</span>
      </div>
    );
  }

  if (error || !limitData) {
    return (
      <div className="leave-limit-status error">
        <div className="error-content">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="error-info">
            <h3 className="error-title">Unable to Load Leave Balance</h3>
            <p className="error-message">
              {error || 'Failed to fetch leave limit information'}
            </p>
            <button 
              className="retry-button" 
              onClick={() => fetchMonthlyLimit()}
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23,4 23,10 17,10"/>
                <path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10"/>
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { remainingLeaves, approvedThisMonth, monthlyLimit, currentMonth } = limitData;
  
  // Use validation data if available, otherwise use limit data
  const displayData = validationData || {
    currentUsage: approvedThisMonth,
    remainingLeaves,
    monthlyLimit,
    exceedsLimit: false,
    requestedDays: 0
  };

  const getStatusColor = () => {
    if (validationData) {
      return leaveValidation.getValidationStatusColor(validationData);
    }
    
    if (remainingLeaves >= 2) return 'green';
    if (remainingLeaves === 1) return 'yellow';
    return 'red';
  };

  const getStatusMessage = () => {
    if (validationData) {
      return leaveValidation.getValidationStatusMessage(validationData);
    }
    
    if (remainingLeaves === 0) {
      return 'No leaves remaining this month';
    }
    
    return `${remainingLeaves} leave${remainingLeaves !== 1 ? 's' : ''} remaining in ${currentMonth}`;
  };

  const colorClass = getStatusColor();
  const statusMessage = getStatusMessage();

  return (
    <div className={`leave-limit-status ${colorClass}`}>
      <div className="status-header">
        <div className="status-icon">
          {colorClass === 'green' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          )}
          {colorClass === 'yellow' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
          {colorClass === 'red' && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          )}
        </div>
        <div className="status-info">
          <h3 className="status-title">Leave Balance</h3>
          <p className="status-message">{statusMessage}</p>
        </div>
      </div>

      <div className="status-details">
        <div className="usage-bar">
          <div className="usage-track">
            <div 
              className="usage-fill"
              style={{ 
                width: `${Math.min((displayData.currentUsage / monthlyLimit) * 100, 100)}%` 
              }}
            ></div>
            {validationData && validationData.requestedDays > 0 && (
              <div 
                className="usage-projected"
                style={{ 
                  left: `${Math.min((displayData.currentUsage / monthlyLimit) * 100, 100)}%`,
                  width: `${Math.min((validationData.requestedDays / monthlyLimit) * 100, 100 - (displayData.currentUsage / monthlyLimit) * 100)}%`
                }}
              ></div>
            )}
          </div>
          <div className="usage-labels">
            <span className="usage-current">
              {displayData.currentUsage} used
            </span>
            {validationData && validationData.requestedDays > 0 && (
              <span className="usage-requested">
                +{validationData.requestedDays} requested
              </span>
            )}
            <span className="usage-total">
              {monthlyLimit} total
            </span>
          </div>
        </div>

        {validationData && validationData.exceedsLimit && (
          <div className="warning-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Exceeds monthly limit
          </div>
        )}
      </div>

      <div className="status-tooltip">
        <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        <div className="tooltip-content">
          <p><strong>Monthly Leave Policy</strong></p>
          <p>You can have up to {monthlyLimit} approved leaves per calendar month.</p>
          <p>Current month: {currentMonth}</p>
          <p>Used: {displayData.currentUsage} | Remaining: {Math.max(0, monthlyLimit - displayData.currentUsage)}</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveLimitStatus;