import { useState, useEffect } from 'react';
import { leaveService, getErrorMessage } from '../services/api';
import './LeaveLimitIndicator.css';

const LeaveLimitIndicator = ({ userId }) => {
  const [limitData, setLimitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchMonthlyLimit();
    }
  }, [userId]);

  const fetchMonthlyLimit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[LeaveLimitIndicator] Fetching monthly limit for userId:', userId);
      const response = await leaveService.getMonthlyLeaveLimit(userId);
      console.log('[LeaveLimitIndicator] Response:', response.data);
      setLimitData(response.data.data);
    } catch (err) {
      console.error('[LeaveLimitIndicator] Failed to fetch monthly leave limit:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    console.log('[LeaveLimitIndicator] Loading...');
    return (
      <div className="leave-limit-indicator loading">
        <div className="limit-spinner"></div>
      </div>
    );
  }

  if (error || !limitData) {
    console.log('[LeaveLimitIndicator] Error or no data:', { error, limitData });
    return null; // Gracefully hide if there's an error
  }

  console.log('[LeaveLimitIndicator] Rendering with data:', limitData);

  const { remainingLeaves, approvedThisMonth, monthlyLimit, currentMonth } = limitData;

  // Determine color based on remaining leaves
  const getColorClass = () => {
    if (remainingLeaves >= 2) return 'green';
    if (remainingLeaves === 1) return 'yellow';
    return 'red';
  };

  const colorClass = getColorClass();
  const percentage = ((monthlyLimit - remainingLeaves) / monthlyLimit) * 100;

  return (
    <div className={`leave-limit-indicator ${colorClass}`}>
      <div className="limit-content">
        <div className="limit-visual">
          <svg className="circular-progress" viewBox="0 0 120 120">
            <circle
              className="progress-bg"
              cx="60"
              cy="60"
              r="50"
            />
            <circle
              className="progress-fill"
              cx="60"
              cy="60"
              r="50"
              style={{
                strokeDasharray: `${2 * Math.PI * 50}`,
                strokeDashoffset: `${2 * Math.PI * 50 * (1 - percentage / 100)}`,
              }}
            />
            <text
              x="60"
              y="60"
              className="progress-text"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {remainingLeaves}
            </text>
          </svg>
        </div>
        
        <div className="limit-info">
          <h3 className="limit-title">Monthly Leave Limit</h3>
          <p className="limit-description">
            {remainingLeaves === 0 ? (
              <span className="limit-warning">No leaves remaining this month</span>
            ) : (
              <span>
                <strong>{remainingLeaves}</strong> {remainingLeaves === 1 ? 'leave' : 'leaves'} left in {currentMonth}
              </span>
            )}
          </p>
          <p className="limit-details">
            {approvedThisMonth} of {monthlyLimit} leaves used
          </p>
        </div>
      </div>
      
      <div className="limit-tooltip">
        <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        <div className="tooltip-content">
          <p><strong>Monthly Leave Limit Policy</strong></p>
          <p>You can have up to 3 approved leaves per calendar month.</p>
          <p>Only approved leaves count toward your limit.</p>
          <p>The limit resets at the beginning of each month.</p>
        </div>
      </div>
    </div>
  );
};

export default LeaveLimitIndicator;
