import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import ChipLoader from '../components/ChipLoader';
import './Feedback.css';

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'view'
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    rating: 0,
    subject: '',
    message: ''
  });

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: '🐛', color: '#ef4444' },
    { value: 'suggestion', label: 'Suggestion', icon: '💡', color: '#3b82f6' },
    { value: 'complaint', label: 'Complaint', icon: '😞', color: '#f59e0b' },
    { value: 'praise', label: 'Praise', icon: '🎉', color: '#10b981' },
    { value: 'other', label: 'Other', icon: '📝', color: '#8b5cf6' }
  ];

  useEffect(() => {
    if (activeTab === 'view') {
      fetchMyFeedback();
    }
  }, [activeTab]);

  const fetchMyFeedback = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getMyFeedback();
      setFeedbacks(response.data.feedbacks);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      showToast('Failed to load feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.rating || !formData.subject || !formData.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await feedbackService.submitFeedback(formData);
      showToast('Feedback submitted successfully!', 'success');
      
      // Reset form
      setFormData({
        category: '',
        rating: 0,
        subject: '',
        message: ''
      });
      
      // Switch to view tab
      setActiveTab('view');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast(error.response?.data?.error?.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
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
      day: 'numeric'
    });
  };

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        {/* Header */}
        <div className="feedback-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1>Feedback Center</h1>
            <p>Share your thoughts or view your feedback history</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Submit Feedback
          </button>
          <button
            className={`tab ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            My Feedback ({feedbacks.length})
          </button>
        </div>

        {/* Content */}
        <div className="tab-content">
          {activeTab === 'submit' ? (
            /* Submit Form */
            <form onSubmit={handleSubmit} className="feedback-form">
              {/* Category */}
              <div className="form-group">
                <label>Category *</label>
                <div className="category-grid">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      className={`category-card ${formData.category === cat.value ? 'active' : ''}`}
                      style={{
                        '--cat-color': cat.color,
                        borderColor: formData.category === cat.value ? cat.color : '#e2e8f0'
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      <span className="cat-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="form-group">
                <label>Rating *</label>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star"
                      onClick={() => handleRatingClick(star)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={formData.rating >= star ? '#f59e0b' : 'none'}
                        stroke="#f59e0b"
                        strokeWidth="2"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </button>
                  ))}
                  {formData.rating > 0 && (
                    <span className="rating-value">{formData.rating}/5</span>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief summary"
                  maxLength={200}
                  required
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us more..."
                  rows={5}
                  maxLength={2000}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          ) : (
            /* View Feedback */
            <div className="feedback-list">
              {loading ? (
                <ChipLoader message="Loading feedback..." />
              ) : feedbacks.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <h3>No Feedback Yet</h3>
                  <p>You haven't submitted any feedback</p>
                  <button className="switch-tab-btn" onClick={() => setActiveTab('submit')}>
                    Submit Your First Feedback
                  </button>
                </div>
              ) : (
                feedbacks.map((feedback) => {
                  const cat = categories.find(c => c.value === feedback.category);
                  return (
                    <div key={feedback._id} className="feedback-card">
                      <div className="card-header">
                        <div className="card-meta">
                          <span className="card-category" style={{ color: cat?.color }}>
                            {cat?.icon} {cat?.label}
                          </span>
                          {getStatusBadge(feedback.status)}
                        </div>
                        <div className="card-rating">
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
                      <h3>{feedback.subject}</h3>
                      <p className="card-message">{feedback.message}</p>
                      <div className="card-date">
                        {formatDate(feedback.createdAt)}
                      </div>
                      {feedback.adminResponse && (
                        <div className="admin-response">
                          <div className="response-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                            </svg>
                            Admin Response
                          </div>
                          <p>{feedback.adminResponse}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
