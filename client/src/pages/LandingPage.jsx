import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/Toast';
import BookLoader from '../components/BookLoader';
import './LandingPage.css';

const LandingPage = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    rollNo: '',
    role: 'student',
    stream: 'BCA'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    
    if (!showLogin && !formData.name) {
      setError('Name is required');
      return false;
    }
    
    if (!showLogin && !formData.rollNo) {
      setError('Roll number is required');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (showLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          showSuccess('Login successful! Redirecting...');
          navigate(result.user.role === 'admin' ? '/admin' : '/student');
        } else {
          setError(result.error);
          showError(result.error);
        }
      } else {
        const result = await register(
          formData.name,
          formData.email,
          formData.password,
          'student',
          formData.stream,
          formData.rollNo
        );
        
        if (result.success) {
          showSuccess('Registration successful! Please login.');
          setShowLogin(true);
          setFormData({
            email: formData.email,
            password: '',
            name: '',
            rollNo: '',
            role: 'student',
            stream: 'BCA'
          });
          setError('');
        } else {
          setError(result.error);
          showError(result.error);
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'An error occurred';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowLogin(!showLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      name: '',
      rollNo: '',
      role: 'student',
      stream: 'BCA'
    });
  };

  return (
    <div className="landing-page">
      {/* Content */}
      <div className="landing-content">
        <div className="landing-hero">
          <div className="hero-content">
            <h1 className="landing-title">E-Leave Management System</h1>
            <p className="landing-tagline">Simplify leave requests and approvals</p>
          </div>
          <BookLoader />
        </div>

        <div className="landing-forms-container">
          <div className="auth-form-wrapper">
            <h2 className="form-title">{showLogin ? 'Welcome Back' : 'Create Account'}</h2>
            
            {error && <div className="error-message">{error}</div>}
            
            <form className="auth-form" onSubmit={handleSubmit} key={showLogin ? 'login' : 'register'}>
              {!showLogin && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-input"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="rollNo">Roll Number</label>
                    <input
                      type="text"
                      id="rollNo"
                      name="rollNo"
                      className="form-input"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      placeholder="Enter your roll number"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
              
              {!showLogin && (
                <div className="form-group">
                  <label className="form-label" htmlFor="stream">Stream</label>
                  <select
                    id="stream"
                    name="stream"
                    className="form-select"
                    value={formData.stream}
                    onChange={handleInputChange}
                    disabled={loading}
                  >
                    <option value="BCA">BCA</option>
                    <option value="BA">BA</option>
                    <option value="PGDCA">PGDCA</option>
                    <option value="BSC">BSC</option>
                    <option value="BCOM">BCOM</option>
                  </select>
                </div>
              )}
              
              <button 
                type="submit" 
                className="form-button"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (showLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>
            
            <div className="form-toggle">
              {showLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="form-toggle-link" onClick={toggleForm}>
                {showLogin ? 'Sign Up' : 'Sign In'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
