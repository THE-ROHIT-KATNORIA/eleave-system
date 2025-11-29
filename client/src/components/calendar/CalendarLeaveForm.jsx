import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Calendar3D from './Calendar3D';
import LeaveBalanceIndicator3D from './LeaveBalanceIndicator3D';
import SelectedDatesSummary from './SelectedDatesSummary';
import calendarValidationService from '../../services/calendarValidationService';
import leaveBalanceService from '../../services/leaveBalanceService';
import holidayService from '../../services/holidayService';
import { formatDateForAPI, groupDatesByMonth } from '../../utils/calendarUtils';
import axios from 'axios';
import './CalendarLeaveForm.css';

const CalendarLeaveForm = ({ onSubmitSuccess, onCancel }) => {
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState([]);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [balancePreview, setBalancePreview] = useState(null);
  const [currentBalance, setCurrentBalance] = useState({ used: 0, remaining: 3, limit: 3 });
  const [holidays, setHolidays] = useState([]);
  const [errors, setErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  // Fetch user's current leave balance from API
  useEffect(() => {
    const fetchBalance = async () => {
      if (user?.id) {
        try {
          // Fetch real balance from API
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const response = await axios.get(`${apiUrl}/leaves/calendar/${user.id}/balance`);
          
          if (response.data.success) {
            const balanceData = response.data.balance;
            setCurrentBalance({
              used: balanceData.used,
              remaining: balanceData.remaining,
              limit: balanceData.limit
            });
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
          // Fallback to default if API fails
          setCurrentBalance({ used: 0, remaining: 3, limit: 3 });
        }
      }
    };

    fetchBalance();
  }, [user?.id]);

  // Fetch holidays
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const holidayDates = holidayService.getHolidayDates();
        setHolidays(holidayDates);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };

    fetchHolidays();
  }, []);

  // Validate selected dates whenever they change
  const validateSelection = useCallback(async (dates) => {
    if (dates.length === 0) {
      setValidationResult(null);
      setBalancePreview(null);
      return;
    }

    try {
      const [validation, preview] = await Promise.all([
        calendarValidationService.validateDateSelection(dates, user?.id),
        leaveBalanceService.getBalancePreview(user?.id, dates)
      ]);

      setValidationResult(validation);
      setBalancePreview(preview);
      setShowValidation(true);

    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        isValid: false,
        errors: [{ message: 'Validation failed. Please try again.' }],
        warnings: []
      });
    }
  }, [user?.id]);

  // Handle date selection changes
  const handleDateSelect = useCallback((newSelectedDates) => {
    setSelectedDates(newSelectedDates);
    validateSelection(newSelectedDates);
    
    // Clear previous errors
    if (errors.dates) {
      setErrors(prev => ({ ...prev, dates: null }));
    }
  }, [validateSelection, errors.dates]);

  // Handle individual date removal
  const handleRemoveDate = useCallback((dateToRemove) => {
    const newSelection = selectedDates.filter(date => 
      date.getTime() !== dateToRemove.getTime()
    );
    handleDateSelect(newSelection);
  }, [selectedDates, handleDateSelect]);

  // Handle clear all dates
  const handleClearAll = useCallback(() => {
    handleDateSelect([]);
  }, [handleDateSelect]);

  // Handle reason change
  const handleReasonChange = (e) => {
    setReason(e.target.value);
    
    // Clear reason error
    if (errors.reason) {
      setErrors(prev => ({ ...prev, reason: null }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (selectedDates.length === 0) {
      newErrors.dates = 'Please select at least one date';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Please provide a reason for your leave request';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters long';
    }

    if (validationResult && !validationResult.isValid) {
      newErrors.dates = 'Please fix the date selection issues before submitting';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Final validation
      const finalValidation = await calendarValidationService.validateForSubmission(
        selectedDates, 
        user?.id, 
        reason
      );

      if (!finalValidation.canSubmit) {
        setErrors({ 
          submit: 'Cannot submit: ' + (finalValidation.errors[0]?.message || 'Validation failed') 
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare submission data
      const submissionData = {
        userId: user.id,
        userName: user.name,
        rollNumber: user.rollNumber,
        stream: user.stream,
        requestType: 'calendar',
        selectedDates: selectedDates.map(formatDateForAPI),
        selectedDatesCount: selectedDates.length,
        reason: reason.trim(),
        monthlyImpact: balancePreview?.balanceImpact || {}
      };

      // Submit to API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${apiUrl}/leaves/calendar`, submissionData);

      if (response.data.success) {
        // Success callback
        if (onSubmitSuccess) {
          onSubmitSuccess({
            leaveId: response.data.leaveId,
            selectedDates,
            selectedDatesCount: selectedDates.length,
            reason,
            submittedAt: new Date()
          });
        }

        // Reset form
        setSelectedDates([]);
        setReason('');
        setValidationResult(null);
        setBalancePreview(null);
        setErrors({});
        setShowValidation(false);

      } else {
        setErrors({ submit: response.data.error?.message || 'Submission failed' });
      }

    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ 
        submit: error.response?.data?.error?.message || 'Failed to submit leave request. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get validation feedback for UI
  const validationFeedback = validationResult 
    ? calendarValidationService.getValidationFeedback(validationResult)
    : null;

  // Group selected dates by month for balance indicator
  const selectedDatesByMonth = groupDatesByMonth(selectedDates);

  return (
    <div className="calendar-leave-form">
      <div className="form-header">
        <h2>Submit Leave Request</h2>
        <p className="form-subtitle">Select dates from the calendar below</p>
      </div>

      <div className="form-content">
        {/* User Info Display */}
        <div className="user-info-section">
          <div className="user-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.name}</span>
            </div>
            <div className="info-item">
              <label>Roll Number:</label>
              <span>{user?.rollNumber}</span>
            </div>
            <div className="info-item">
              <label>Stream:</label>
              <span>{user?.stream}</span>
            </div>
          </div>
        </div>

        {/* Balance Indicator */}
        <div className="balance-section">
          <LeaveBalanceIndicator3D
            currentBalance={currentBalance}
            selectedDates={selectedDates}
            selectedDatesByMonth={selectedDatesByMonth}
            showMonthlyBreakdown={selectedDatesByMonth.size > 1}
          />
        </div>

        {/* Calendar Section */}
        <div className="calendar-section">
          <Calendar3D
            selectedDates={selectedDates}
            onDateSelect={handleDateSelect}
            holidays={holidays}
            maxFutureMonths={6}
          />
          
          {errors.dates && (
            <div className="error-message">
              {errors.dates}
            </div>
          )}
        </div>

        {/* Custom Leave Limit Feedback */}
        {selectedDates.length > 0 && balancePreview && (
          <div className="leave-limit-feedback">
            {(() => {
              const currentMonthKey = new Date().toISOString().slice(0, 7);
              const monthImpact = balancePreview.balanceImpact?.[currentMonthKey];
              
              if (!monthImpact) return null;
              
              const { newRemaining, exceeds, overage, selectedCount } = monthImpact;
              
              if (exceeds) {
                return (
                  <div className="limit-message error">
                    <span className="limit-icon">❌</span>
                    <span>{selectedCount} day{selectedCount !== 1 ? 's' : ''} selected - Exceeds limit by {overage} day{overage !== 1 ? 's' : ''}</span>
                  </div>
                );
              }
              
              if (newRemaining === 0) {
                return (
                  <div className="limit-message critical">
                    <span className="limit-icon">🚫</span>
                    <span>{selectedCount} day{selectedCount !== 1 ? 's' : ''} selected - All leaves will be exhausted</span>
                  </div>
                );
              }
              
              if (newRemaining === 1) {
                return (
                  <div className="limit-message warning">
                    <span className="limit-icon">⚠️</span>
                    <span>{selectedCount} day{selectedCount !== 1 ? 's' : ''} selected - Only {newRemaining} leave remaining</span>
                  </div>
                );
              }
              
              return (
                <div className="limit-message success">
                  <span className="limit-icon">✅</span>
                  <span>{selectedCount} day{selectedCount !== 1 ? 's' : ''} selected - {newRemaining} leaves will remain</span>
                </div>
              );
            })()}
          </div>
        )}

        {/* Validation Feedback */}
        {showValidation && validationFeedback && (
          <div className={`validation-feedback ${validationFeedback.type}`}>
            <div className="feedback-message">
              {validationFeedback.message}
            </div>
            {validationFeedback.details.length > 0 && (
              <ul className="feedback-details">
                {validationFeedback.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Selected Dates Summary */}
        {selectedDates.length > 0 && (
          <div className="summary-section">
            <SelectedDatesSummary
              selectedDates={selectedDates}
              onRemoveDate={handleRemoveDate}
              onClearAll={handleClearAll}
              groupByMonth={true}
              showActions={true}
              maxHeight="250px"
            />
          </div>
        )}

        {/* Reason Input */}
        <div className="reason-section">
          <label htmlFor="reason" className="reason-label">
            Reason for Leave <span className="required">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={handleReasonChange}
            placeholder="Please provide a detailed reason for your leave request..."
            className={`reason-input ${errors.reason ? 'error' : ''}`}
            rows={4}
            maxLength={500}
          />
          <div className="reason-meta">
            <span className="char-count">
              {reason.length}/500 characters
            </span>
            {errors.reason && (
              <span className="error-text">{errors.reason}</span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          
          <button 
            type="submit" 
            className={`submit-btn ${selectedDates.length > currentBalance.remaining ? 'limit-exceeded' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting || selectedDates.length === 0 || !reason.trim()}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Submitting...
              </>
            ) : selectedDates.length > currentBalance.remaining ? (
              `Submit Anyway (${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''} - Exceeds Limit)`
            ) : selectedDates.length === currentBalance.remaining ? (
              `Submit Request (${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''} - Uses All Leaves)`
            ) : (
              `Submit Request (${selectedDates.length} day${selectedDates.length !== 1 ? 's' : ''})`
            )}
          </button>
        </div>

        {/* Submission Error */}
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarLeaveForm;