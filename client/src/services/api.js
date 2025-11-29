import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Delay helper for retry logic
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable
 */
const isRetryableError = (error) => {
  // Retry on network errors or 5xx server errors
  return !error.response || (error.response.status >= 500 && error.response.status < 600);
};

/**
 * Retry request with exponential backoff
 */
const retryRequest = async (config, retryCount = 0) => {
  try {
    return await api.request(config);
  } catch (error) {
    if (retryCount < MAX_RETRIES && isRetryableError(error)) {
      const delayTime = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES}) after ${delayTime}ms...`);
      await delay(delayTime);
      return retryRequest(config, retryCount + 1);
    }
    throw error;
  }
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Handle network errors with retry
    if (!error.response && !originalRequest._retried) {
      originalRequest._retried = true;
      try {
        return await retryRequest(originalRequest);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    // Format error message
    const errorMessage = error.response?.data?.error?.message 
      || error.response?.data?.message 
      || error.message 
      || 'An unexpected error occurred';

    // Attach formatted error message
    error.userMessage = errorMessage;

    return Promise.reject(error);
  }
);

/**
 * Helper to extract user-friendly error message
 */
export const getErrorMessage = (error) => {
  if (error.userMessage) {
    return error.userMessage;
  }
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  return 'An unexpected error occurred. Please try again.';
};

// Authentication service
export const authService = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  
  register: (name, email, password, role, stream, rollNumber) => {
    return api.post('/auth/register', { name, email, password, role, stream, rollNumber });
  },
};

// Leave service
export const leaveService = {
  getLeaves: (params) => {
    return api.get('/leaves', { params });
  },
  
  createLeave: (leaveData) => {
    // If leaveData is FormData, set appropriate headers
    const config = leaveData instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    return api.post('/leaves', leaveData, config);
  },
  
  updateLeaveStatus: (leaveId, status) => {
    return api.patch(`/leaves/${leaveId}/status`, { status });
  },
  
  deleteLeave: (leaveId) => {
    return api.delete(`/leaves/${leaveId}`);
  },
  
  getLeaveStats: (stream) => {
    const params = stream ? { stream } : {};
    return api.get('/leaves/stats', { params });
  },
  
  getMonthlyLeaveLimit: (userId) => {
    return api.get(`/leaves/monthly-limit/${userId}`);
  },
  
  validateLeaveRequest: (userId, startDate, endDate) => {
    return api.post('/leaves/validate', { userId, startDate, endDate });
  },
};

// User service
export const userService = {
  getUser: (userId) => {
    return api.get(`/users/${userId}`);
  },
  
  getAllUsers: () => {
    return api.get('/users');
  },
  
  deleteUser: (userId) => {
    return api.delete(`/users/${userId}`);
  },
};

export default api;
