import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { useAuth } from '../hooks/useAuth';
import { leaveService } from '../services/api';
import ChipLoader from '../components/ChipLoader';
import './LeaveStatusView.css';

const StatusBadge3D = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  return (
    <span className={`status-badge status-${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const LeaveCard = ({ leave }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`leave-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="leave-card-header">
        <StatusBadge3D status={leave.status} />
        <span className="leave-stream">{leave.stream}</span>
      </div>

      <div className="student-info">
        <div className="student-name">{leave.userName}</div>
        {leave.rollNumber && (
          <div className="student-roll">Roll No: {leave.rollNumber}</div>
        )}
      </div>

      <div className="leave-card-body">
        <div className="leave-dates">
          <div className="date-item">
            <span className="date-label">From:</span>
            <span className="date-value">{formatDate(leave.startDate)}</span>
          </div>
          <div className="date-separator">→</div>
          <div className="date-item">
            <span className="date-label">To:</span>
            <span className="date-value">{formatDate(leave.endDate)}</span>
          </div>
        </div>

        <div className="leave-reason">
          <span className="reason-label">Reason:</span>
          <p className="reason-text">{leave.reason}</p>
        </div>

        <div className="leave-footer">
          <span className="submission-date">
            Submitted: {formatDate(leave.submittedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

const LeaveStatusView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [user]);

  useEffect(() => {
    filterLeaves();
  }, [leaves, searchTerm, statusFilter]);

  const fetchLeaves = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await leaveService.getLeaves({
        userId: user.id,
        role: 'student',
      });

      const leavesData = response.data.leaves || [];
      // Sort by submission date (newest first)
      leavesData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      
      setLeaves(leavesData);
      setFilteredLeaves(leavesData);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    // Filter by search term (reason or stream)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(leave =>
        leave.reason.toLowerCase().includes(term) ||
        leave.stream.toLowerCase().includes(term)
      );
    }

    setFilteredLeaves(filtered);
  };

  const handleBack = () => {
    navigate('/student');
  };

  if (loading) {
    return <ChipLoader fullScreen message="Loading leave requests..." />;
  }

  return (
    <div className="leave-status-view">
      <div className="status-header">
        <h1>My Leave Requests</h1>
        <p className="status-subtitle">Track the status of your applications</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by reason or stream..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({leaves.length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending ({leaves.filter(l => l.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setStatusFilter('approved')}
          >
            Approved ({leaves.filter(l => l.status === 'approved').length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setStatusFilter('rejected')}
          >
            Rejected ({leaves.filter(l => l.status === 'rejected').length})
          </button>
        </div>
      </div>

      <div className="leaves-container">
        {filteredLeaves.length === 0 ? (
          <div className="no-leaves">
            <p>
              {leaves.length === 0
                ? 'No leave requests found. Submit your first request!'
                : 'No leave requests match your filters.'}
            </p>
            {leaves.length === 0 && (
              <button
                className="btn-submit-new"
                onClick={() => navigate('/student/submit')}
              >
                Submit Leave Request
              </button>
            )}
          </div>
        ) : (
          <div className="leaves-grid">
            {filteredLeaves.map(leave => (
              <LeaveCard key={leave.id} leave={leave} />
            ))}
          </div>
        )}
      </div>

      <div className="back-button-container">
        <button className="btn-back" onClick={handleBack}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default LeaveStatusView;
