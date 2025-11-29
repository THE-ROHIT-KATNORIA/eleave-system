import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { leaveService, getErrorMessage } from '../services/api';
import { useToast } from './Toast';
import './LeaveRequestCard.css';

const LeaveRequestCard = ({ leave, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [limitData, setLimitData] = useState(null);
  const [limitLoading, setLimitLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchMonthlyLimit();
  }, [leave.userId]);

  const fetchMonthlyLimit = async () => {
    try {
      setLimitLoading(true);
      const response = await leaveService.getMonthlyLeaveLimit(leave.userId);
      setLimitData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch monthly leave limit:', err);
      // Gracefully handle error - don't show limit badge if fetch fails
      setLimitData(null);
    } finally {
      setLimitLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCalendarDates = (selectedDates) => {
    if (!selectedDates || selectedDates.length === 0) return '';
    
    // Group dates by month for better display
    const datesByMonth = {};
    selectedDates.forEach(dateString => {
      const date = new Date(dateString);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!datesByMonth[monthKey]) {
        datesByMonth[monthKey] = [];
      }
      datesByMonth[monthKey].push(date.getDate());
    });

    // Format grouped dates
    return Object.entries(datesByMonth).map(([month, days]) => {
      const sortedDays = days.sort((a, b) => a - b);
      return `${month}: ${sortedDays.join(', ')}`;
    }).join(' | ');
  };

  const getRequestTypeDisplay = () => {
    // Return the actual leave type (Casual Leave, Medical Leave, etc.)
    return {
      type: leave.leaveType || 'Leave Request',
      icon: leave.leaveType === 'Medical Leave' ? '🏥' : 
            leave.leaveType === 'Casual Leave' ? '🌴' : 
            leave.leaveType === 'Emergency Leave' ? '🚨' : '📋',
      description: leave.requestType === 'calendar' 
        ? `${leave.selectedDatesCount || leave.selectedDates?.length || 0} individual dates selected`
        : '' // No description for traditional requests
    };
  };

  const handleApprove = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await leaveService.updateLeaveStatus(leave.id, 'approved');
      
      showSuccess('Leave request approved successfully!');
      
      // Refresh limit data after approval
      await fetchMonthlyLimit();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to approve leave:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await leaveService.updateLeaveStatus(leave.id, 'rejected');
      
      showSuccess('Leave request rejected successfully!');
      
      // Refresh limit data after rejection (though it shouldn't change)
      await fetchMonthlyLimit();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to reject leave:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await leaveService.deleteLeave(leave.id);
      
      showSuccess('Leave request deleted successfully!');
      setShowDeleteModal(false);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to delete leave:', err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6366f1';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '📋';
    }
  };

  const handleViewAttachment = () => {
    if (leave.attachment) {
      const fileUrl = `http://localhost:5000/api/uploads/${leave.attachment.filename}`;
      window.open(fileUrl, '_blank');
    }
  };

  const getLimitColorClass = () => {
    if (!limitData) return '';
    const used = limitData.approvedThisMonth;
    if (used <= 1) return 'limit-green';
    if (used === 2) return 'limit-yellow';
    return 'limit-red';
  };

  return (
    <div className="leave-request-card">
      <div className="card-header">
        <div className="header-left">
          <h3 className="student-name">
            {leave.userName} {leave.rollNumber && `(Roll No: ${leave.rollNumber})`}
          </h3>
          <span className="stream-badge">{leave.stream}</span>
          <span className="status-badge" style={{ backgroundColor: getStatusColor(leave.status) }}>
            {leave.status.toUpperCase()}
          </span>
          {!limitLoading && limitData && (
            <div className={`leave-limit-badge ${getLimitColorClass()}`}>
              <svg className="limit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="limit-text">
                {limitData.approvedThisMonth}/{limitData.monthlyLimit} used
              </span>
              <div className="limit-tooltip-content">
                <p><strong>Monthly Leave Status</strong></p>
                <p>Approved this month: {limitData.approvedThisMonth}</p>
                <p>Remaining leaves: {limitData.remainingLeaves}</p>
                <p>Month: {limitData.currentMonth} {limitData.currentYear}</p>
              </div>
            </div>
          )}
        </div>
        <div className="header-right">
          {error && (
            <div className="action-error">
              {error}
            </div>
          )}
          {leave.status === 'pending' && (
            <>
              <button
                className="action-btn approve"
                onClick={handleApprove}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Approve
              </button>
              <button
                className="action-btn reject"
                onClick={handleReject}
                disabled={loading}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                Reject
              </button>
            </>
          )}
          <button
            className="action-btn delete"
            onClick={handleDeleteClick}
            disabled={loading}
            title="Delete leave request"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="info-label">Email: {leave.userEmail || `${leave.userName.toLowerCase().replace(' ', '')}@student.edu`}</span>
        </div>

        <div className="info-grid">
          <div className="info-column">
            <span className="info-label">Request Type</span>
            <div className="request-type-display">
              <span className="request-type-icon">{getRequestTypeDisplay().icon}</span>
              <div className="request-type-info">
                <span className="info-value">{getRequestTypeDisplay().type}</span>
                <span className="request-type-desc">{getRequestTypeDisplay().description}</span>
              </div>
            </div>
          </div>
          <div className="info-column">
            <span className="info-label">
              {leave.requestType === 'calendar' ? 'Selected Dates' : 'Duration'}
            </span>
            {leave.requestType === 'calendar' ? (
              <div className="calendar-dates-display">
                <span className="info-value dates-count">
                  {leave.selectedDatesCount || leave.selectedDates?.length || 0} day{(leave.selectedDatesCount || leave.selectedDates?.length || 0) !== 1 ? 's' : ''}
                </span>
                {leave.selectedDates && leave.selectedDates.length > 0 && (
                  <div className="dates-breakdown">
                    {formatCalendarDates(leave.selectedDates)}
                  </div>
                )}
              </div>
            ) : (
              <span className="info-value">
                {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
              </span>
            )}
          </div>
        </div>

        {/* Calendar dates detailed view for calendar requests */}
        {leave.requestType === 'calendar' && leave.selectedDates && leave.selectedDates.length > 0 && (
          <div className="calendar-dates-section">
            <span className="info-label">Individual Dates Selected</span>
            <div className="calendar-dates-grid">
              {leave.selectedDates.slice(0, 10).map((dateString, index) => (
                <span key={index} className="calendar-date-chip">
                  {formatDate(dateString)}
                </span>
              ))}
              {leave.selectedDates.length > 10 && (
                <span className="calendar-date-chip more-dates">
                  +{leave.selectedDates.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="reason-section">
          <span className="info-label">Reason</span>
          <p className="reason-text">{leave.reason}</p>
        </div>

        {leave.attachment && (
          <div className="attachment-section">
            <button 
              className="view-attachment-btn"
              onClick={handleViewAttachment}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
              </svg>
              View Attachment
            </button>
          </div>
        )}

        <div className="submitted-info">
          <span className="info-label">Submitted: {formatDate(leave.submittedAt)}</span>
        </div>
      </div>

      {/* Delete Confirmation Modal - Using Portal to render at document root */}
      {showDeleteModal && createPortal(
        <div className="leave-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="leave-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="leave-modal-header">
              <h3>Confirm Delete</h3>
              <button className="leave-modal-close-btn" onClick={() => setShowDeleteModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="leave-modal-body">
              <div className="leave-modal-warning-icon">⚠️</div>
              <p>Are you sure you want to delete this leave request?</p>
              <div className="leave-modal-details">
                <strong>{leave.userName}</strong>
                {leave.rollNumber && <span>Roll No: {leave.rollNumber}</span>}
                <span>{leave.stream}</span>
                <span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
              </div>
              <p className="leave-modal-warning-text">
                This action cannot be undone.
              </p>
            </div>
            <div className="leave-modal-footer">
              <button
                className="leave-modal-btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="leave-modal-btn-delete"
                onClick={handleDeleteConfirm}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete Leave Request'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LeaveRequestCard;
