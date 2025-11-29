import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../services/api';
import StreamCard from '../components/StreamCard';
import ChipLoader from '../components/ChipLoader';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const streams = ['BCA', 'BA', 'PGDCA', 'BSC', 'BCOM'];

  useEffect(() => {
    fetchLeaveStats();
  }, []);

  const fetchLeaveStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all leaves statistics (no stream filter for overall stats)
      const response = await leaveService.getLeaveStats();
      
      // Extract stats from response (backend returns { success, stats })
      setStats(response.data.stats || response.data);
    } catch (err) {
      console.error('Failed to fetch leave stats:', err);
      setError('Failed to load leave statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToStream = (stream) => {
    navigate('/admin/streams', { state: { selectedStream: stream } });
  };

  if (loading) {
    return <ChipLoader fullScreen message="Loading dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="dashboard-subtitle">Manage leave requests across all streams</p>
          </div>
          <button 
            className="manage-accounts-btn"
            onClick={() => navigate('/admin/manage-accounts')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Manage Accounts
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="stats-section">
        <h2>Overall Leave Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/>
                <path d="M18 17V9"/>
                <path d="M13 17V5"/>
                <path d="M8 17v-3"/>
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

      <div className="streams-section">
        <h2>Quick Access to Streams</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem' }}>
          Click on any stream to view and manage leave requests
        </p>
        <div className="streams-grid">
          {streams.map((stream, index) => {
            // Vibrant, harmonious color palette with good contrast
            const colors = [
              '#EC4899', // Hot Pink - BCA
              '#14B8A6', // Teal - BA
              '#F59E0B', // Amber - PGDCA
              '#3B82F6', // Blue - BSC
              '#8B5CF6'  // Purple - BCOM
            ];
            
            return (
              <StreamCard
                key={stream}
                stream={stream}
                color={colors[index]}
                onClick={() => handleNavigateToStream(stream)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
