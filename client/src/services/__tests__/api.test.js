import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { authService, leaveService, userService, getErrorMessage } from '../api';

vi.mock('axios');

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('authService', () => {
    it('login should call correct endpoint', async () => {
      const mockResponse = { data: { token: 'test-token', user: { id: 1 } } };
      axios.post.mockResolvedValue(mockResponse);

      const result = await authService.login({ email: 'test@test.com', password: 'pass' });
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@test.com',
        password: 'pass'
      });
      expect(result).toEqual(mockResponse);
    });

    it('register should call correct endpoint', async () => {
      const mockResponse = { data: { token: 'test-token' } };
      axios.post.mockResolvedValue(mockResponse);

      const userData = { email: 'test@test.com', password: 'pass', name: 'Test' };
      await authService.register(userData);
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', userData);
    });

    it('logout should call correct endpoint', async () => {
      axios.post.mockResolvedValue({ data: {} });
      
      await authService.logout();
      
      expect(axios.post).toHaveBeenCalledWith('/api/auth/logout');
    });
  });

  describe('leaveService', () => {
    it('getLeaves should fetch leaves', async () => {
      const mockLeaves = { data: { leaves: [] } };
      axios.get.mockResolvedValue(mockLeaves);

      await leaveService.getLeaves();
      
      expect(axios.get).toHaveBeenCalledWith('/api/leaves', { params: undefined });
    });

    it('createLeave should post leave data', async () => {
      const mockResponse = { data: { leave: {} } };
      axios.post.mockResolvedValue(mockResponse);

      const leaveData = { startDate: '2025-01-01', endDate: '2025-01-02' };
      await leaveService.createLeave(leaveData);
      
      expect(axios.post).toHaveBeenCalledWith('/api/leaves', leaveData);
    });

    it('updateLeaveStatus should update status', async () => {
      axios.patch.mockResolvedValue({ data: {} });

      await leaveService.updateLeaveStatus('123', 'approved');
      
      expect(axios.patch).toHaveBeenCalledWith('/api/leaves/123/status', { status: 'approved' });
    });
  });

  describe('getErrorMessage', () => {
    it('returns error message from response', () => {
      const error = {
        response: { data: { message: 'Custom error' } }
      };
      expect(getErrorMessage(error)).toBe('Custom error');
    });

    it('returns error message from error object', () => {
      const error = { message: 'Network error' };
      expect(getErrorMessage(error)).toBe('Network error');
    });

    it('returns default message for unknown errors', () => {
      expect(getErrorMessage({})).toBe('An unexpected error occurred');
    });
  });
});
