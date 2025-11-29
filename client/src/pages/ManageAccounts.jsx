import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../hooks/useAuth';
import ChipLoader from '../components/ChipLoader';
import './ManageAccounts.css';

const ManageAccounts = () => {
  const { showSuccess, showError } = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStream, setFilterStream] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const streams = ['BCA', 'BA', 'PGDCA', 'BSC', 'BCOM'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.getAllUsers();
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load user accounts');
      showError('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    try {
      await userService.deleteUser(userId);
      showSuccess(`Account "${userName}" deleted successfully`);
      setDeleteConfirm(null);
      
      // Refresh the user list
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to delete user';
      showError(errorMsg);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStream = filterStream === 'all' || user.stream === filterStream;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.rollNumber && user.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesRole && matchesStream && matchesSearch;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  if (loading) {
    return <ChipLoader fullScreen message="Loading accounts..." />;
  }

  return (
    <div className="manage-accounts-page">
      <div className="page-header">
        <h1>Manage Accounts</h1>
        <p className="page-subtitle">View and manage all user accounts in the system</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="accounts-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Accounts</div>
          </div>
        </div>
        <div className="stat-card student">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.students}</div>
            <div className="stat-label">Students</div>
          </div>
        </div>
        <div className="stat-card admin">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="role-filters">
          <button
            className={`filter-btn ${filterRole === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRole('all')}
          >
            All Users
          </button>
          <button
            className={`filter-btn ${filterRole === 'student' ? 'active' : ''}`}
            onClick={() => setFilterRole('student')}
          >
            Students
          </button>
          <button
            className={`filter-btn ${filterRole === 'admin' ? 'active' : ''}`}
            onClick={() => setFilterRole('admin')}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Stream Filters */}
      <div className="stream-filters-section">
        <label className="filter-label">Filter by Stream:</label>
        <div className="stream-filters">
          <button
            className={`stream-filter-btn ${filterStream === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStream('all')}
          >
            All Streams
          </button>
          {streams.map((stream) => (
            <button
              key={stream}
              className={`stream-filter-btn ${filterStream === stream ? 'active' : ''}`}
              onClick={() => setFilterStream(stream)}
            >
              {stream}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="users-container">
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Accounts Found</h3>
            <p>
              {searchQuery
                ? 'No accounts match your search criteria.'
                : 'No user accounts available.'}
            </p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="th">Name</div>
              <div className="th">Email</div>
              <div className="th">Role</div>
              <div className="th">Stream/Roll No</div>
              <div className="th">Created</div>
              <div className="th">Actions</div>
            </div>
            
            {filteredUsers.map((user) => (
              <div key={user.id} className="table-row">
                <div className="td">
                  <div className="user-name">
                    <div className="user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name}
                  </div>
                </div>
                <div className="td">{user.email}</div>
                <div className="td">
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                  </span>
                </div>
                <div className="td">
                  {user.role === 'student' ? (
                    <div className="student-info">
                      <div className="stream-badge">{user.stream}</div>
                      <div className="roll-number">{user.rollNumber}</div>
                    </div>
                  ) : (
                    <span className="not-applicable">—</span>
                  )}
                </div>
                <div className="td">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="td">
                  {currentUser?.id === user.id ? (
                    <span className="current-user-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      You
                    </span>
                  ) : (
                    <button
                      className="delete-btn"
                      onClick={() => setDeleteConfirm(user)}
                      title="Delete account"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="close-btn" onClick={() => setDeleteConfirm(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-icon">⚠️</div>
              <p>Are you sure you want to delete the account:</p>
              <div className="user-details">
                <strong>{deleteConfirm.name}</strong>
                <span>{deleteConfirm.email}</span>
                <span className={`role-badge ${deleteConfirm.role}`}>
                  {deleteConfirm.role}
                </span>
              </div>
              <p className="warning-text">
                This action cannot be undone. All associated leave requests will also be deleted.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDeleteUser(deleteConfirm.id, deleteConfirm.name)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAccounts;
