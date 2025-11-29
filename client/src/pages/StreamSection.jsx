import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { leaveService } from '../services/api';
import LeaveRequestCard from '../components/LeaveRequestCard';
import ChipLoader from '../components/ChipLoader';
import './StreamSection.css';

const StreamSection = () => {
  const location = useLocation();
  const initialStream = location.state?.selectedStream || 'BCA';
  
  const [selectedStream, setSelectedStream] = useState(initialStream);
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const streams = ['BCA', 'BA', 'PGDCA', 'BSC', 'BCOM'];
  const statusOptions = ['all', 'pending', 'approved', 'rejected'];

  useEffect(() => {
    fetchLeaves();
  }, [selectedStream]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await leaveService.getLeaves({
        role: 'admin',
        stream: selectedStream,
      });
      
      setLeaves(response.data.leaves || []);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
      setError('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStreamChange = (stream) => {
    setSelectedStream(stream);
    setStatusFilter('all');
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
  };

  const handleLeaveUpdate = () => {
    // Refresh the leaves list after an action
    fetchLeaves();
  };

  const filteredLeaves = statusFilter === 'all'
    ? leaves
    : leaves.filter(leave => leave.status === statusFilter);

  return (
    <div className="stream-section">
      <div className="stream-header">
        <h1>Manage Leave Requests</h1>
        <p className="stream-subtitle">Review and manage student leave applications</p>
      </div>

      {/* Stream Tabs */}
      <div className="stream-tabs">
        {streams.map((stream) => (
          <button
            key={stream}
            className={`stream-tab ${selectedStream === stream ? 'active' : ''}`}
            onClick={() => handleStreamChange(stream)}
          >
            <span className="tab-label">{stream}</span>
            <span className="tab-count">
              {leaves.filter(l => l.stream === stream).length}
            </span>
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="filter-section">
        <label className="filter-label">Filter by Status:</label>
        <div className="filter-buttons">
          {statusOptions.map((status) => (
            <button
              key={status}
              className={`filter-btn ${statusFilter === status ? 'active' : ''} ${status}`}
              onClick={() => handleStatusFilterChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Leave Requests */}
      <div className="leaves-container">
        {loading ? (
          <ChipLoader message="Loading leave requests..." />
        ) : filteredLeaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Leave Requests</h3>
            <p>
              {statusFilter === 'all'
                ? `No leave requests found for ${selectedStream} stream.`
                : `No ${statusFilter} leave requests found for ${selectedStream} stream.`}
            </p>
          </div>
        ) : (
          <div className="leaves-grid">
            {filteredLeaves.map((leave) => (
              <LeaveRequestCard
                key={leave.id}
                leave={leave}
                onUpdate={handleLeaveUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamSection;
