import { useEffect } from 'react';
import './LeaveLimitWarning.css';

const LeaveLimitWarning = ({ 
  isOpen, 
  limitData, 
  projectedUsage, 
  onClose, 
  onConfirm = null 
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !limitData) return null;

  const {
    currentUsage,
    monthlyLimit,
    remainingLeaves,
    requestedDays,
    exceedsLimit,
    limitReached,
    message
  } = limitData;

  const exceedsBy = projectedUsage - monthlyLimit;

  return (
    <div className="leave-warning-overlay" onClick={onClose}>
      <div className="leave-warning-modal" onClick={(e) => e.stopPropagation()}>
        <div className="warning-header">
          <div className="warning-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 className="warning-title">Leave Limit Reached</h2>
          <button className="close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="warning-content">
          <div className="warning-message">
            <p className="primary-message">
              {limitReached 
                ? "You have already used all your leave days for this month."
                : `This request would exceed your monthly leave limit by ${exceedsBy} day${exceedsBy > 1 ? 's' : ''}.`
              }
            </p>
            <p className="secondary-message">{message}</p>
          </div>

          <div className="usage-breakdown">
            <h3>Monthly Leave Usage</h3>
            <div className="usage-stats">
              <div className="usage-item">
                <span className="usage-label">Currently Used:</span>
                <span className="usage-value current">{currentUsage} days</span>
              </div>
              <div className="usage-item">
                <span className="usage-label">Requested:</span>
                <span className="usage-value requested">+{requestedDays} days</span>
              </div>
              <div className="usage-divider"></div>
              <div className="usage-item total">
                <span className="usage-label">Total Would Be:</span>
                <span className={`usage-value ${exceedsLimit ? 'exceeds' : 'within'}`}>
                  {projectedUsage} / {monthlyLimit} days
                </span>
              </div>
            </div>
          </div>

          <div className="policy-info">
            <div className="policy-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="policy-text">
              <h4>Monthly Leave Policy</h4>
              <p>You can have up to <strong>3 approved leaves</strong> per calendar month. Only approved leaves count toward your limit, and the limit resets at the beginning of each month.</p>
            </div>
          </div>

          <div className="suggestions">
            <h4>What you can do:</h4>
            <ul>
              <li>Modify your leave dates to reduce the number of days</li>
              <li>Split your request into multiple shorter periods</li>
              <li>Wait until next month when your limit resets</li>
              {remainingLeaves > 0 && (
                <li>Request only {remainingLeaves} day{remainingLeaves > 1 ? 's' : ''} to stay within your limit</li>
              )}
            </ul>
          </div>
        </div>

        <div className="warning-actions">
          <button className="btn-secondary" onClick={onClose}>
            Modify Request
          </button>
          {onConfirm && (
            <button className="btn-warning" onClick={onConfirm}>
              Submit Anyway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveLimitWarning;