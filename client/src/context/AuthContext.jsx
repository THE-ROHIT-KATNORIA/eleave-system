import { createContext, useState, useEffect, useContext } from 'react';
import { authService, getErrorMessage } from '../services/api';

/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 * 
 * Context Value:
 * - user: Current user object or null
 * - loading: Boolean indicating if auth state is being initialized
 * - login: Function to authenticate user
 * - register: Function to create new user account
 * - logout: Function to end user session
 */
export const AuthContext = createContext(null);

/**
 * useAuth Hook
 * Custom hook to access authentication context
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Wraps the application to provide authentication context
 * 
 * Features:
 * - Persists authentication state in localStorage
 * - Automatically restores session on page reload
 * - Provides login, register, and logout functionality
 * - Handles authentication errors gracefully
 */
export const AuthProvider = ({ children }) => {
  // Current authenticated user (null if not logged in)
  const [user, setUser] = useState(null);
  
  // Loading state for initial authentication check
  const [loading, setLoading] = useState(true);

  /**
   * Effect: Restore authentication state on mount
   * Checks localStorage for existing token and user data
   * Automatically logs in user if valid session exists
   */
  useEffect(() => {
    // Retrieve stored authentication data
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // Restore user session if both token and user data exist
    if (token && storedUser) {
      try {
        // Parse stored user JSON
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        // Handle corrupted localStorage data
        console.error('Failed to parse stored user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    // Mark initialization as complete
    setLoading(false);
  }, []);

  /**
   * Login Function
   * Authenticates user with email and password
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Result object with success status
   * 
   * Success: { success: true, user: userData }
   * Failure: { success: false, error: errorMessage }
   */
  const login = async (email, password) => {
    try {
      // Call login API endpoint
      const response = await authService.login(email, password);
      const { token, user: userData } = response.data;
      
      // Store authentication data in localStorage for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update application state
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      // Extract user-friendly error message
      const message = getErrorMessage(error);
      return { success: false, error: message };
    }
  };

  /**
   * Register Function
   * Creates a new user account
   * 
   * @param {string} name - User's full name
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} role - User role ('student' or 'admin')
   * @param {string} stream - Academic stream (required for students)
   * @param {string} rollNumber - Roll number (required for students)
   * @returns {Promise<Object>} Result object with success status
   * 
   * Success: { success: true, message: successMessage }
   * Failure: { success: false, error: errorMessage }
   */
  const register = async (name, email, password, role, stream, rollNumber) => {
    try {
      // Call register API endpoint
      const response = await authService.register(name, email, password, role, stream, rollNumber);
      return { success: true, message: response.data.message };
    } catch (error) {
      // Extract user-friendly error message
      const message = getErrorMessage(error);
      return { success: false, error: message };
    }
  };

  /**
   * Logout Function
   * Ends the current user session
   * Clears authentication data from localStorage and state
   */
  const logout = () => {
    // Remove stored authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear user state
    setUser(null);
  };

  // Context value provided to all children components
  const value = {
    user,        // Current user object or null
    loading,     // Boolean: true during initial auth check
    login,       // Function: authenticate user
    register,    // Function: create new account
    logout,      // Function: end session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
