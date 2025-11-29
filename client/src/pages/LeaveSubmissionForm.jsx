import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { leaveService, userService, getErrorMessage } from '../services/api';
import { useToast } from '../components/Toast';
import ChipLoader from '../components/ChipLoader';
import LeaveLimitWarning from '../components/LeaveLimitWarning';
import LeaveLimitStatus from '../components/LeaveLimitStatus';
import leaveValidation from '../services/leaveValidation';
import './LeaveSubmissionForm.css';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Medical Leave', 'Personal Leave'];

const LeaveSubmissionForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // User profile data (fetched from API)
  const [userProfile, setUserProfile] = useState({
    name: '',
    rollNumber: '',
    stream: '',
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const response = await userService.getUser(user.id);
        const profileData = response.data.user;
        
        setUserProfile({
          name: profileData.name || '',
          rollNumber: profileData.rollNumber || '',
          stream: profileData.stream || '',
        });
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        const errorMsg = getErrorMessage(err);
        showError(errorMsg);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id, showError]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  const [errors, setErrors] = useState({});
  
  // Leave limit validation state
  const [validationData, setValidationData] = useState(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [isWithinLimit, setIsWithinLimit] = useState(true);

  // Validate leave dates against monthly limit
  const validateLeaveDates = async (startDate, endDate) => {
    if (!startDate || !endDate || !user?.id) {
      setValidationData(null);
      return;
    }

    try {
      setValidationLoading(true);
      const result = await leaveValidation.validateLeaveRequest(user.id, startDate, endDate);
      setValidationData(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationData(null);
    } finally {
      setValidationLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }

    // Validate dates when they change
    if (name === 'startDate' || name === 'endDate') {
      const newFormData = { ...formData, [name]: value };
      if (newFormData.startDate && newFormData.endDate) {
        validateLeaveDates(newFormData.startDate, newFormData.endDate);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          attachment: 'File size must be less than 5MB'
        }));
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          attachment: 'Only images (JPEG, PNG) and documents (PDF, DOC, DOCX) are allowed'
        }));
        return;
      }
      
      setAttachment(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null);
      }
      
      // Clear error
      if (errors.attachment) {
        setErrors(prev => ({
          ...prev,
          attachment: null,
        }));
      }
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    // Reset file input
    const fileInput = document.getElementById('attachment');
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    // Validate date logic
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }

      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if leave limit would be exceeded
    if (validationData && validationData.exceedsLimit && !validationData.validationFailed) {
      setShowLimitWarning(true);
      return;
    }

    await submitLeaveRequest();
  };

  const submitLeaveRequest = async (retryCount = 0) => {
    const maxRetries = 1;
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('userId', user.id);
      submitData.append('userName', userProfile.name);
      submitData.append('userEmail', user.email);
      submitData.append('rollNumber', userProfile.rollNumber);
      submitData.append('stream', userProfile.stream);
      submitData.append('leaveType', formData.leaveType);
      submitData.append('startDate', formData.startDate);
      submitData.append('endDate', formData.endDate);
      submitData.append('reason', formData.reason);
      
      if (attachment) {
        submitData.append('attachment', attachment);
      }

      await leaveService.createLeave(submitData);

      setSuccess(true);
      showSuccess('Leave request submitted successfully!');
      
      // Reset form
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
        reason: '',
      });
      setAttachment(null);
      setAttachmentPreview(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/student/status');
      }, 2000);
    } catch (err) {
      console.error('Failed to submit leave:', err);
      
      // Check if we should retry
      if (retryCount < maxRetries && isRetryableError(err)) {
        console.log(`Retrying submission (${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => {
          submitLeaveRequest(retryCount + 1);
        }, 2000);
        return;
      }
      
      const errorMsg = getErrorMessage(err);
      const enhancedError = enhanceErrorMessage(err, errorMsg);
      setError(enhancedError);
      showError(enhancedError);
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

  const enhanceErrorMessage = (error, baseMessage) => {
    if (!error.response) {
      return 'Unable to connect to server. Please check your internet connection and try again.';
    }
    
    if (error.response.status === 401) {
      return 'Your session has expired. Please log in again.';
    }
    
    if (error.response.status === 403) {
      return 'You do not have permission to submit leave requests.';
    }
    
    if (error.response.status >= 500) {
      return 'Server is temporarily unavailable. Please try again in a few moments.';
    }
    
    return baseMessage;
  };

  const handleWarningClose = () => {
    setShowLimitWarning(false);
  };

  const handleWarningConfirm = async () => {
    setShowLimitWarning(false);
    await submitLeaveRequest();
  };

  const handleLimitCheck = (withinLimit, data) => {
    setIsWithinLimit(withinLimit);
    setValidationData(data);
  };

  const handleCancel = () => {
    navigate('/student');
  };

  if (loading || profileLoading) {
    return <ChipLoader fullScreen message={loading ? "Submitting leave request..." : "Loading profile..."} />;
  }

  return (
    <div className="leave-submission-form">
      <div className="form-header">
        <h1>Submit Leave Request</h1>
        <p className="form-subtitle">Fill in the details below</p>
      </div>

      {success && (
        <div className="success-message">
          Leave request submitted successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Leave Limit Status */}
      {user?.id && (
        <LeaveLimitStatus
          userId={user.id}
          selectedDates={{
            startDate: formData.startDate,
            endDate: formData.endDate
          }}
          onLimitCheck={handleLimitCheck}
        />
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit} className="leave-form">
          {/* Read-only profile fields */}
          <div className="profile-section">
            <h3 className="section-title">Student Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  Name
                  <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userProfile.name}
                  disabled
                  className="readonly-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rollNumber">
                  Roll Number
                  <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </label>
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={userProfile.rollNumber}
                  disabled
                  className="readonly-field"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="stream">
                Stream
                <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </label>
              <input
                type="text"
                id="stream"
                name="stream"
                value={userProfile.stream}
                disabled
                className="readonly-field"
              />
            </div>
          </div>

          {/* Editable leave details */}
          <div className="leave-details-section">
            <h3 className="section-title">Leave Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="leaveType">Leave Type *</label>
                <select
                  id="leaveType"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  className={errors.leaveType ? 'error' : ''}
                >
                  <option value="">Select leave type</option>
                  {LEAVE_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.leaveType && (
                  <span className="field-error">{errors.leaveType}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">
                Start Date *
                {validationData && validationData.exceedsLimit && (
                  <span className="validation-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                )}
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`${errors.startDate ? 'error' : ''} ${
                  validationData && validationData.exceedsLimit ? 'validation-warning' : ''
                } ${validationLoading ? 'validating' : ''}`}
                title={validationData && validationData.exceedsLimit ? 'This date range exceeds your monthly leave limit' : ''}
              />
              {errors.startDate && (
                <span className="field-error">{errors.startDate}</span>
              )}
              {validationData && validationData.exceedsLimit && !errors.startDate && (
                <span className="field-warning">
                  Selected dates would exceed your monthly limit
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="endDate">
                End Date *
                {validationData && validationData.exceedsLimit && (
                  <span className="validation-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </span>
                )}
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`${errors.endDate ? 'error' : ''} ${
                  validationData && validationData.exceedsLimit ? 'validation-warning' : ''
                } ${validationLoading ? 'validating' : ''}`}
                title={validationData && validationData.exceedsLimit ? 'This date range exceeds your monthly leave limit' : ''}
              />
              {errors.endDate && (
                <span className="field-error">{errors.endDate}</span>
              )}
              {validationData && validationData.requestedDays > 0 && !errors.endDate && (
                <span className={`field-info ${validationData.exceedsLimit ? 'warning' : 'success'}`}>
                  {validationData.requestedDays} day{validationData.requestedDays !== 1 ? 's' : ''} requested
                  {validationData.exceedsLimit && ` (exceeds limit by ${validationData.projectedUsage - validationData.monthlyLimit})`}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason">Reason *</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Please provide a detailed reason for your leave request..."
              rows="5"
              className={errors.reason ? 'error' : ''}
            />
            {errors.reason && (
              <span className="field-error">{errors.reason}</span>
            )}
            <span className="field-hint">
              Minimum 10 characters ({formData.reason.length}/10)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="attachment">Supporting Document (Optional)</label>
            <input
              type="file"
              id="attachment"
              name="attachment"
              onChange={handleFileChange}
              accept="image/jpeg,image/jpg,image/png,application/pdf,.doc,.docx"
              className={errors.attachment ? 'error' : ''}
            />
            {errors.attachment && (
              <span className="field-error">{errors.attachment}</span>
            )}
            <span className="field-hint">
              Max 5MB. Allowed: Images (JPEG, PNG), Documents (PDF, DOC, DOCX)
            </span>
            
            {attachment && (
              <div className="file-preview">
                <div className="file-info">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                  </svg>
                  <div className="file-details">
                    <span className="file-name">{attachment.name}</span>
                    <span className="file-size">{(attachment.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <button type="button" onClick={handleRemoveFile} className="btn-remove-file">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
                {attachmentPreview && (
                  <img src={attachmentPreview} alt="Preview" className="image-preview" />
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleCancel}
              className="btn-cancel"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className={`btn-submit ${
                validationData && validationData.exceedsLimit ? 'btn-warning-state' : ''
              } ${
                validationData && validationData.limitReached ? 'btn-disabled-state' : ''
              }`}
              disabled={loading || (validationData && leaveValidation.shouldDisableSubmit(validationData))}
              title={
                validationData && validationData.limitReached 
                  ? 'You have reached your monthly leave limit' 
                  : validationData && validationData.exceedsLimit 
                    ? 'This request exceeds your monthly leave limit - click to see warning' 
                    : ''
              }
            >
              {loading ? (
                <>
                  <svg className="btn-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Submitting...
                </>
              ) : validationData && validationData.limitReached ? (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Limit Reached
                </>
              ) : validationData && validationData.exceedsLimit ? (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Submit (Exceeds Limit)
                </>
              ) : (
                <>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                  Submit Leave Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Leave Limit Warning Dialog */}
      <LeaveLimitWarning
        isOpen={showLimitWarning}
        limitData={validationData}
        projectedUsage={validationData?.projectedUsage || 0}
        onClose={handleWarningClose}
        onConfirm={handleWarningConfirm}
      />
    </div>
  );
};

export default LeaveSubmissionForm;
