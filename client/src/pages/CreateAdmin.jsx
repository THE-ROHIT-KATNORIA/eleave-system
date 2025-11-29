import { useState } from 'react';
import { authService } from '../services/api';
import { useToast } from '../components/Toast';
import './CreateAdmin.css';

const CreateAdmin = () => {
  const { showSuccess, showError } = useToast();
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [adminFormError, setAdminFormError] = useState('');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setAdminFormError('');
  };

  const validateAdminForm = () => {
    if (!adminFormData.name || !adminFormData.email || !adminFormData.password) {
      setAdminFormError('All fields are required');
      return false;
    }
    
    if (adminFormData.password.length < 6) {
      setAdminFormError('Password must be at least 6 characters');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminFormData.email)) {
      setAdminFormError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    
    if (!validateAdminForm()) {
      return;
    }
    
    setCreatingAdmin(true);
    setAdminFormError('');
    
    try {
      await authService.register(
        adminFormData.name,
        adminFormData.email,
        adminFormData.password,
        'admin',
        undefined,
        undefined
      );
      
      showSuccess('Admin account created successfully!');
      setAdminFormData({
        name: '',
        email: '',
        password: '',
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to create admin account';
      setAdminFormError(errorMsg);
      showError(errorMsg);
    } finally {
      setCreatingAdmin(false);
    }
  };

  return (
    <div className="create-admin-page">
      <div className="create-admin-container">
        <div className="page-header">
          <h1>Create New Administrator</h1>
          <p className="page-subtitle">Add a new admin account to manage the system</p>
        </div>

        <div className="create-admin-card">
          {adminFormError && <div className="error-message">{adminFormError}</div>}
          
          <form className="admin-form" onSubmit={handleCreateAdmin}>
            <div className="form-group">
              <label className="form-label" htmlFor="admin-name">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Full Name
              </label>
              <input
                type="text"
                id="admin-name"
                name="name"
                className="form-input"
                value={adminFormData.name}
                onChange={handleAdminInputChange}
                placeholder="Enter admin's full name"
                disabled={creatingAdmin}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Email Address
              </label>
              <input
                type="email"
                id="admin-email"
                name="email"
                className="form-input"
                value={adminFormData.email}
                onChange={handleAdminInputChange}
                placeholder="Enter admin's email"
                disabled={creatingAdmin}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Password
              </label>
              <input
                type="password"
                id="admin-password"
                name="password"
                className="form-input"
                value={adminFormData.password}
                onChange={handleAdminInputChange}
                placeholder="Enter password (min 6 characters)"
                disabled={creatingAdmin}
              />
            </div>

            <button 
              type="submit" 
              className="create-admin-btn"
              disabled={creatingAdmin}
            >
              {creatingAdmin ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Create Admin Account
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAdmin;
