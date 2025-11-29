import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { leaveService } from '../services/api';
import ActionCard from '../components/ActionCard';
import ChipLoader from '../components/ChipLoader';
import LeaveLimitIndicator from '../components/LeaveLimitIndicator';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaveStats();
  }, [user]);

  const fetchLeaveStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch user's leaves
      const response = await leaveService.getLeaves({
        userId: user.id,
        role: 'student',
      });
      
      const leaves = response.data.leaves || [];
      
      // Calculate statistics
      const stats = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
      };
      
      setStats(stats);
    } catch (err) {
      console.error('Failed to fetch leave stats:', err);
      setError('Failed to load leave statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToSubmit = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/student/submit');
  };

  const handleNavigateToStatus = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate('/student/status');
  };

  if (loading) {
    return <ChipLoader fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p className="dashboard-subtitle">Manage your leave requests</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="leave-limit-section">
        <LeaveLimitIndicator userId={user?.id} />
      </div>

      <div className="stats-section">
        <h2>Leave Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Requests</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
              </svg>
            </div>
            <div className="stat-value">{stats.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card rejected">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6"/>
                <path d="M9 9l6 6"/>
              </svg>
            </div>
            <div className="stat-value">{stats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      </div>

      <div className="navigation-section">
        <h2>Quick Actions</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
          Choose an action to manage your leave requests
        </p>
        <div className="actions-grid">
          <ActionCard
            title="Submit Leave"
            subtitle="Create new request"
            color="#f59e0b"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M12 18v-6"/>
                <path d="M9 15l3-3 3 3"/>
              </svg>
            }
            onClick={handleNavigateToSubmit}
          />
          
          <ActionCard
            title="View Status"
            subtitle="Track your requests"
            color="#10b981"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
                <path d="M16 13H8"/>
                <path d="M16 17H8"/>
                <path d="M10 9H8"/>
              </svg>
            }
            onClick={handleNavigateToStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
