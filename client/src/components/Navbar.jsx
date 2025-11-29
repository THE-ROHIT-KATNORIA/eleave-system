import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isStudentPanel = user?.role === 'student';
  const isAdminPanel = user?.role === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>E-Leave System</h2>
          <span className="navbar-role">
            {isStudentPanel ? 'Student Panel' : 'Admin Panel'}
          </span>
        </div>

        <div className="navbar-menu">
          {isStudentPanel && (
            <>
              <button
                className={`nav-link ${isActive('/student') ? 'active' : ''}`}
                onClick={() => navigate('/student')}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${isActive('/student/submit') ? 'active' : ''}`}
                onClick={() => navigate('/student/submit')}
              >
                Submit Leave
              </button>
              <button
                className={`nav-link ${isActive('/student/status') ? 'active' : ''}`}
                onClick={() => navigate('/student/status')}
              >
                View Status
              </button>
            </>
          )}

          {isAdminPanel && (
            <>
              <button
                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => navigate('/admin')}
              >
                Dashboard
              </button>
              <button
                className={`nav-link ${isActive('/admin/streams') ? 'active' : ''}`}
                onClick={() => navigate('/admin/streams')}
              >
                Manage Leaves
              </button>
              <button
                className={`nav-link ${isActive('/admin/create-admin') ? 'active' : ''}`}
                onClick={() => navigate('/admin/create-admin')}
              >
                Create New Admin
              </button>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            {user?.stream && (
              <span className="user-stream">{user.stream}</span>
            )}
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
