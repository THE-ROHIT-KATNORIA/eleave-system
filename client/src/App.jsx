import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import LeaveSubmissionForm from './pages/LeaveSubmissionForm';
import LeaveStatusView from './pages/LeaveStatusView';
import AdminDashboard from './pages/AdminDashboard';
import StreamSection from './pages/StreamSection';
import CreateAdmin from './pages/CreateAdmin';
import ManageAccounts from './pages/ManageAccounts';
import CalendarDemo from './components/calendar/CalendarDemo';
import FeedbackForm from './pages/FeedbackForm';
import MyFeedback from './pages/MyFeedback';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import './App.css';

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {showNavbar && <Navbar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        <Route 
          path="/student" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/submit" 
          element={
            <ProtectedRoute requiredRole="student">
              <LeaveSubmissionForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/submit-calendar" 
          element={
            <ProtectedRoute requiredRole="student">
              <CalendarDemo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/student/status" 
          element={
            <ProtectedRoute requiredRole="student">
              <LeaveStatusView />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/streams" 
          element={
            <ProtectedRoute requiredRole="admin">
              <StreamSection />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create-admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <CreateAdmin />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-accounts" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageAccounts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback/new" 
          element={
            <ProtectedRoute>
              <FeedbackForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/feedback/my-feedback" 
          element={
            <ProtectedRoute>
              <MyFeedback />
            </ProtectedRoute>
          } 
        />
        <Route path="/calendar-demo" element={<CalendarDemo />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary errorMessage="An unexpected error occurred in the application. Please refresh the page.">
      <ToastProvider>
        <Router>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
