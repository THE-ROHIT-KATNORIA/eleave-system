import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import leavesRouter from '../leaves.js';
import db from '../../database/db.js';
import { authenticateToken } from '../../middleware/auth.js';

// Mock the database
vi.mock('../../database/db.js', () => ({
  default: {
    read: vi.fn(),
    write: vi.fn(),
    data: {
      leaves: [],
      users: []
    }
  }
}));

// Mock the auth middleware
vi.mock('../../middleware/auth.js', () => ({
  authenticateToken: vi.fn((req, res, next) => {
    req.user = { id: 'user1', role: 'student' };
    next();
  }),
  authorizeRoles: vi.fn(() => (req, res, next) => next())
}));

describe('Leave Validation API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/leaves', leavesRouter);
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Reset database state
    db.data.leaves = [];
    db.data.users = [];
  });

  describe('POST /api/leaves/validate', () => {
    it('should validate leave request successfully', async () => {
      // Mock current date to January 2025
      const mockDate = new Date('2025-01-15');
      vi.setSystemTime(mockDate);
      
      // Mock existing approved leaves
      db.data.leaves = [
        {
          id: 'leave1',
          userId: 'user1',
          status: 'approved',
          updatedAt: '2025-01-10T10:00:00.000Z'
        }
      ];

      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: '2025-01-20',
          endDate: '2025-01-21'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        isValid: true,
        currentUsage: 1,
        projectedUsage: 3,
        remainingLeaves: 2,
        requestedDays: 2,
        exceedsLimit: false,
        limitReached: false,
        monthlyLimit: 3
      });
      expect(response.body.data.message).toContain('within your monthly limit');
    });

    it('should detect when leave request exceeds limit', async () => {
      const mockDate = new Date('2025-01-15');
      vi.setSystemTime(mockDate);
      
      // Mock 3 existing approved leaves (at limit)
      db.data.leaves = [
        { id: 'leave1', userId: 'user1', status: 'approved', updatedAt: '2025-01-05T10:00:00.000Z' },
        { id: 'leave2', userId: 'user1', status: 'approved', updatedAt: '2025-01-08T10:00:00.000Z' },
        { id: 'leave3', userId: 'user1', status: 'approved', updatedAt: '2025-01-12T10:00:00.000Z' }
      ];

      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: '2025-01-20',
          endDate: '2025-01-21'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        isValid: false,
        currentUsage: 3,
        projectedUsage: 5,
        remainingLeaves: 0,
        requestedDays: 2,
        exceedsLimit: true,
        limitReached: true,
        monthlyLimit: 3
      });
      expect(response.body.data.message).toContain('exceed your monthly limit');
    });

    it('should only count approved leaves in current month', async () => {
      const mockDate = new Date('2025-01-15');
      vi.setSystemTime(mockDate);
      
      db.data.leaves = [
        // Previous month - should not count
        { id: 'leave1', userId: 'user1', status: 'approved', updatedAt: '2024-12-15T10:00:00.000Z' },
        // Current month - should count
        { id: 'leave2', userId: 'user1', status: 'approved', updatedAt: '2025-01-05T10:00:00.000Z' },
        // Pending in current month - should not count
        { id: 'leave3', userId: 'user1', status: 'pending', updatedAt: '2025-01-08T10:00:00.000Z' },
        // Rejected in current month - should not count
        { id: 'leave4', userId: 'user1', status: 'rejected', updatedAt: '2025-01-10T10:00:00.000Z' }
      ];

      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: '2025-01-20',
          endDate: '2025-01-20'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.currentUsage).toBe(1); // Only one approved in current month
      expect(response.body.data.projectedUsage).toBe(2);
      expect(response.body.data.exceedsLimit).toBe(false);
    });

    it('should calculate leave days correctly', async () => {
      const mockDate = new Date('2025-01-15');
      vi.setSystemTime(mockDate);
      
      db.data.leaves = [];

      // Test single day
      let response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: '2025-01-20',
          endDate: '2025-01-20'
        });

      expect(response.body.data.requestedDays).toBe(1);

      // Test multiple days
      response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: '2025-01-20',
          endDate: '2025-01-24'
        });

      expect(response.body.data.requestedDays).toBe(5);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1'
          // Missing startDate and endDate
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: 'invalid-date',
          endDate: '2025-01-20'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_DATE');
    });

    it('should return 400 for end date before start date', async () => {
      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: '2025-01-25',
          endDate: '2025-01-20'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_DATE_RANGE');
    });

    it('should return 403 when student tries to validate another user', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: 'user1', role: 'student' };
        next();
      });

      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user2', // Different user
          startDate: '2025-01-20',
          endDate: '2025-01-21'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should allow admin to validate any user', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        req.user = { id: 'admin1', role: 'admin' };
        next();
      });

      const mockDate = new Date('2025-01-15');
      vi.setSystemTime(mockDate);
      db.data.leaves = [];

      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user2', // Different user
          startDate: '2025-01-20',
          endDate: '2025-01-21'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.canOverride).toBe(true); // Admin can override
    });

    it('should handle database errors gracefully', async () => {
      db.read.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/leaves/validate')
        .send({
          userId: 'user1',
          startDate: '2025-01-20',
          endDate: '2025-01-21'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATE_LEAVE_ERROR');
    });
  });

  describe('Enhanced leave submission with validation', () => {
    beforeEach(() => {
      // Mock the upload middleware
      vi.doMock('../../middleware/upload.js', () => ({
        default: {
          single: () => (req, res, next) => next()
        }
      }));
    });

    it('should include warning in response when limit exceeded', async () => {
      const mockDate = new Date('2025-01-15');
      vi.setSystemTime(mockDate);
      
      // Mock 2 existing approved leaves
      db.data.leaves = [
        { id: 'leave1', userId: 'user1', status: 'approved', updatedAt: '2025-01-05T10:00:00.000Z' },
        { id: 'leave2', userId: 'user1', status: 'approved', updatedAt: '2025-01-08T10:00:00.000Z' }
      ];

      const response = await request(app)
        .post('/api/leaves')
        .send({
          userId: 'user1',
          userName: 'Test User',
          userEmail: 'test@example.com',
          rollNumber: 'TEST001',
          stream: 'BCA',
          leaveType: 'Sick Leave',
          startDate: '2025-01-20',
          endDate: '2025-01-21', // 2 days, would make total 4 (exceeds limit of 3)
          reason: 'Medical emergency requiring immediate attention'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.warning).toBeDefined();
      expect(response.body.warning.code).toBe('LEAVE_LIMIT_EXCEEDED');
      expect(response.body.warning.limitInfo).toMatchObject({
        currentUsage: 2,
        requestedDays: 2,
        projectedUsage: 4,
        monthlyLimit: 3,
        exceedsBy: 1
      });
    });

    it('should not include warning when within limit', async () => {
      const mockDate = new Date('2025-01-15');
      vi.setSystemTime(mockDate);
      
      db.data.leaves = []; // No existing leaves

      const response = await request(app)
        .post('/api/leaves')
        .send({
          userId: 'user1',
          userName: 'Test User',
          userEmail: 'test@example.com',
          rollNumber: 'TEST001',
          stream: 'BCA',
          leaveType: 'Sick Leave',
          startDate: '2025-01-20',
          endDate: '2025-01-21',
          reason: 'Medical emergency requiring immediate attention'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.warning).toBeUndefined();
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});