import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { feedbackService } from '../services/api';
import { useToast } from '../components/Toast';
import './FeedbackForm.css';

const FeedbackForm = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    rating: 0,
    subject: '',
    message: ''
  });

  const categories = [
    { value: 'bug', label: '🐛 Bug Report', color: '#ef4444' },
    { value: 'suggestion', label: '💡 Suggestion', color: '#3b82f6' },
    { value: 'complaint', label: '😞 Complaint', color: '#f59e0b' },
    { value: 'praise', label: '🎉 Praise', color: '#10b981' },
    { value: 'other', label: '📝 Other', color: '#8b5cf6' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category || !formData.rating || !formData.subject || !formData.message) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      setLoading(true);
      await feedbackService.submitFeedback(formData);
      showToast('Feedback submitted successfully!', 'success');
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast(error.response?.data?.error?.message || 'Failed to submit feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-form-page">
      <div className="feedback-form-container">
        <div className="feedback-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <h1>Share Your Feedback</h1>
          <p>Help us improve the E-Leave system</p>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          {/* Category Selection */}
          <div className="form-group">
            <label>Category *</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
                  style={{
                    '--category-color': cat.color,
                    borderColor: formData.category === cat.value ? cat.color : '#e2e8f0'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="form-group">
            <label>Rating *</label>
            <p className="form-hint">How would you rate your experience?</p>
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                >
                  <svg viewBox="0 0 24 24" fill={formData.rating >= star ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="rating-text">{formData.rating} / 5</span>
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
              placeholder="Brief summary of your feedback"
              maxLength={200}
              required
            />
            <span className="char-count">{formData.subject.length} / 200</span>
          </div>

          {/* Message */}
          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please provide detailed feedback..."
              rows={6}
              maxLength={2000}
              required
            />
            <span className="char-count">{formData.message.length} / 2000</span>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
