import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackService } from '../services/api';
import ChipLoader from '../components/ChipLoader';
import './MyFeedback.css';

const MyFeedback = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getMyFeedback();
      setFeedbacks(response.data.feedbacks);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      bug: '🐛',
      suggestion: '💡',
      complaint: '😞',
      praise: '🎉',
      other: '📝'
    };
    return icons[category] || '📝';
  };

  const getStatusBadge = (status) => {
    const badges = {
      new: { label: 'New', color: '#3b82f6' },
      reviewed: { label: 'Reviewed', color: '#f59e0b' },
      resolved: { label: 'Resolved', color: '#10b981' }
    };
    const badge = badges[status] || badges.new;
    return (
      <span className="status-badge" style={{ backgroundColor: badge.color }}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <ChipLoader fullScreen message="Loading your feedback..." />;
  }

  return (
    <div className="my-feedback-page">
      <div className="feedback-header">
        <div>
          <h1>My Feedback</h1>
          <p>View all your submitted feedback and responses</p>
        </div>
        <button className="btn-new-feedback" onClick={() => navigate('/feedback/new')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Feedback
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {feedbacks.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <h3>No Feedback Yet</h3>
          <p>You haven't submitted any feedback. Share your thoughts to help us improve!</p>
          <button className="btn-primary" onClick={() => navigate('/feedback/new')}>
            Submit Feedback
          </button>
        </div>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((feedback) => (
            <div key={feedback._id} className="feedback-card">
              <div className="feedback-card-header">
                <div className="feedback-meta">
                  <span className="feedback-category">
                    {getCategoryIcon(feedback.category)} {feedback.category}
                  </span>
                  {getStatusBadge(feedback.status)}
                </div>
                <div className="feedback-rating">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 24 24"
                      fill={i < feedback.rating ? '#f59e0b' : 'none'}
                      stroke="#f59e0b"
                      strokeWidth="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>

              <h3 className="feedback-subject">{feedback.subject}</h3>
              <p className="feedback-message">{feedback.message}</p>

              <div className="feedback-date">
                Submitted on {formatDate(feedback.createdAt)}
              </div>

              {feedback.adminResponse && (
                <div className="admin-response">
                  <div className="response-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                    <span>Admin Response</span>
                  </div>
                  <p>{feedback.adminResponse}</p>
                  {feedback.respondedAt && (
                    <div className="response-date">
                      Responded on {formatDate(feedback.respondedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyFeedback;
