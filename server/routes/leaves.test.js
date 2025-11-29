import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import leavesRoutes from './leaves.js';
import db from '../database/db.js';
import { generateToken } from '../utils/auth.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/leaves', leavesRoutes);

// Test tokens
let studentToken;
let adminToken;
let studentUserId;

describe('Leave Management API Endpoints', () => {
  
  beforeEach(async () => {
    // Reset database to initial state before each test
    await db.read();
    
    // Find test users
    const studentUser = db.data.users.find(u => u.email === 'john@student.edu');
    const adminUser = db.data.users.find(u => u.email === 'admin@college.edu');
    
    studentUserId = studentUser.id;
    
    // Generate tokens for testing
    studentToken = generateToken({
      id: studentUser.id,
      email: studentUser.email,
      role: studentUser.role,
      stream: studentUser.stream,
      rollNumber: studentUser.rollNumber
    });
    
    adminToken = generateToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      stream: adminUser.stream,
      rollNumber: adminUser.rollNumber
    });
    
    // Reset leaves to initial state
    db.data.leaves = [
      {
        id: 'test-leave-1',
        userId: studentUserId,
        userName: 'John Doe',
        rollNumber: studentUser.rollNumber,
        stream: 'BCA',
        leaveType: 'sick',
        startDate: '2025-01-20',
        endDate: '2025-01-22',
        reason: 'Medical appointment',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    await db.write();
  });
  
  describe('POST /api/leaves', () => {
    
    it('should successfully create a leave request with valid data', async () => {
      await db.read();
      const studentUser = db.data.users.find(u => u.email === 'john@student.edu');
      
      const response = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: studentUser.rollNumber,
          stream: 'BCA',
          leaveType: 'sick',
          startDate: '2025-02-01',
          endDate: '2025-02-03',
          reason: 'Family emergency requiring immediate attention'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leave request submitted successfully');
      expect(response.body.leaveId).toBeDefined();
      expect(response.body.leave.status).toBe('pending');
      expect(response.body.leave.rollNumber).toBe(studentUser.rollNumber);
    });
    
    it('should reject leave creation without required fields', async () => {
      const studentUser = db.data.users.find(u => u.email === 'john@student.edu');
      
      const response = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: studentUser.rollNumber,
          stream: 'BCA'
          // Missing dates and reason
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    it('should reject leave creation with invalid stream', async () => {
      const studentUser = db.data.users.find(u => u.email === 'john@student.edu');
      
      const response = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: studentUser.rollNumber,
          stream: 'INVALID',
          leaveType: 'sick',
          startDate: '2025-02-01',
          endDate: '2025-02-03',
          reason: 'Valid reason for leave request'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STREAM');
    });
    
    it('should reject leave creation with invalid date range', async () => {
      const studentUser = db.data.users.find(u => u.email === 'john@student.edu');
      
      const response = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: studentUser.rollNumber,
          stream: 'BCA',
          leaveType: 'sick',
          startDate: '2025-02-05',
          endDate: '2025-02-01', // End before start
          reason: 'Valid reason for leave request'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_DATE_RANGE');
    });
    
    it('should reject leave creation without authentication', async () => {
      const response = await request(app)
        .post('/api/leaves')
        .send({
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: 'BCA2023001',
          stream: 'BCA',
          leaveType: 'sick',
          startDate: '2025-02-01',
          endDate: '2025-02-03',
          reason: 'Valid reason for leave request'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
    
    it('should reject leave creation without rollNumber for students', async () => {
      const response = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'John Doe',
          stream: 'BCA',
          leaveType: 'sick',
          startDate: '2025-02-01',
          endDate: '2025-02-03',
          reason: 'Valid reason for leave request'
          // Missing rollNumber
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROLLNUMBER_REQUIRED');
    });
    
    it('should reject leave creation with mismatched rollNumber', async () => {
      const response = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: 'WRONG123', // Different from user's actual roll number
          stream: 'BCA',
          leaveType: 'sick',
          startDate: '2025-02-01',
          endDate: '2025-02-03',
          reason: 'Valid reason for leave request'
        });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROLLNUMBER_MISMATCH');
    });
  });
  
  describe('GET /api/leaves', () => {
    
    it('should retrieve leaves for a student (their own)', async () => {
      const response = await request(app)
        .get('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .query({ userId: studentUserId, role: 'student' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leaves).toBeDefined();
      expect(Array.isArray(response.body.leaves)).toBe(true);
      expect(response.body.leaves.length).toBeGreaterThan(0);
      expect(response.body.leaves[0].userId).toBe(studentUserId);
    });
    
    it('should retrieve leaves filtered by stream for admin', async () => {
      const response = await request(app)
        .get('/api/leaves')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ role: 'admin', stream: 'BCA' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leaves).toBeDefined();
      expect(Array.isArray(response.body.leaves)).toBe(true);
      // All leaves should be from BCA stream
      response.body.leaves.forEach(leave => {
        expect(leave.stream).toBe('BCA');
      });
    });
    
    it('should retrieve all leaves for admin without stream filter', async () => {
      const response = await request(app)
        .get('/api/leaves')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ role: 'admin' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leaves).toBeDefined();
      expect(Array.isArray(response.body.leaves)).toBe(true);
    });
    
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/leaves')
        .query({ userId: studentUserId, role: 'student' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PATCH /api/leaves/:id', () => {
    
    it('should successfully approve a leave request as admin', async () => {
      const response = await request(app)
        .patch('/api/leaves/test-leave-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leave request approved successfully');
      expect(response.body.leave.status).toBe('approved');
    });
    
    it('should successfully reject a leave request as admin', async () => {
      const response = await request(app)
        .patch('/api/leaves/test-leave-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leave request rejected successfully');
      expect(response.body.leave.status).toBe('rejected');
    });
    
    it('should reject status update with invalid status', async () => {
      const response = await request(app)
        .patch('/api/leaves/test-leave-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STATUS');
    });
    
    it('should reject status update for non-existent leave', async () => {
      const response = await request(app)
        .patch('/api/leaves/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LEAVE_NOT_FOUND');
    });
    
    it('should reject status update from student (non-admin)', async () => {
      const response = await request(app)
        .patch('/api/leaves/test-leave-1')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'approved' });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
  
  describe('DELETE /api/leaves/:id', () => {
    
    it('should successfully delete a leave request as admin', async () => {
      const response = await request(app)
        .delete('/api/leaves/test-leave-1')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Leave request deleted successfully');
    });
    
    it('should reject deletion for non-existent leave', async () => {
      const response = await request(app)
        .delete('/api/leaves/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LEAVE_NOT_FOUND');
    });
    
    it('should reject deletion from student (non-admin)', async () => {
      const response = await request(app)
        .delete('/api/leaves/test-leave-1')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
  
  describe('GET /api/leaves/stats', () => {
    
    it('should calculate statistics for all leaves', async () => {
      const response = await request(app)
        .get('/api/leaves/stats')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBeDefined();
      expect(response.body.stats.pending).toBeDefined();
      expect(response.body.stats.approved).toBeDefined();
      expect(response.body.stats.rejected).toBeDefined();
    });
    
    it('should calculate statistics filtered by stream', async () => {
      const response = await request(app)
        .get('/api/leaves/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ stream: 'BCA' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(typeof response.body.stats.total).toBe('number');
    });
    
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/leaves/stats');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('GET /api/leaves/monthly-limit/:userId', () => {
    
    beforeEach(async () => {
      // Add some approved leaves for the current month
      await db.read();
      const now = new Date();
      
      db.data.leaves = [
        {
          id: 'approved-leave-1',
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: 'BCA2023001',
          stream: 'BCA',
          leaveType: 'sick',
          startDate: '2025-01-15',
          endDate: '2025-01-16',
          reason: 'Medical appointment',
          status: 'approved',
          submittedAt: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
          updatedAt: new Date(now.getFullYear(), now.getMonth(), 6).toISOString()
        },
        {
          id: 'approved-leave-2',
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: 'BCA2023001',
          stream: 'BCA',
          leaveType: 'personal',
          startDate: '2025-01-20',
          endDate: '2025-01-21',
          reason: 'Personal work',
          status: 'approved',
          submittedAt: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(),
          updatedAt: new Date(now.getFullYear(), now.getMonth(), 11).toISOString()
        },
        {
          id: 'pending-leave-1',
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: 'BCA2023001',
          stream: 'BCA',
          leaveType: 'sick',
          startDate: '2025-01-25',
          endDate: '2025-01-26',
          reason: 'Pending leave',
          status: 'pending',
          submittedAt: new Date(now.getFullYear(), now.getMonth(), 15).toISOString(),
          updatedAt: new Date(now.getFullYear(), now.getMonth(), 15).toISOString()
        },
        {
          id: 'rejected-leave-1',
          userId: studentUserId,
          userName: 'John Doe',
          rollNumber: 'BCA2023001',
          stream: 'BCA',
          leaveType: 'personal',
          startDate: '2025-01-28',
          endDate: '2025-01-29',
          reason: 'Rejected leave',
          status: 'rejected',
          submittedAt: new Date(now.getFullYear(), now.getMonth(), 18).toISOString(),
          updatedAt: new Date(now.getFullYear(), now.getMonth(), 19).toISOString()
        }
      ];
      await db.write();
    });
    
    it('should return correct monthly limit data for student', async () => {
      const response = await request(app)
        .get(`/api/leaves/monthly-limit/${studentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.monthlyLimit).toBe(3);
      expect(response.body.data.approvedThisMonth).toBe(2);
      expect(response.body.data.remainingLeaves).toBe(1);
      expect(response.body.data.currentMonth).toBeDefined();
      expect(response.body.data.currentYear).toBeDefined();
    });
    
    it('should only count approved leaves in current month', async () => {
      const response = await request(app)
        .get(`/api/leaves/monthly-limit/${studentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.approvedThisMonth).toBe(2);
      // Pending and rejected leaves should not be counted
    });
    
    it('should allow admin to access any student monthly limit', async () => {
      const response = await request(app)
        .get(`/api/leaves/monthly-limit/${studentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
    
    it('should reject student accessing another student monthly limit', async () => {
      await db.read();
      const anotherStudent = db.data.users.find(u => u.email === 'jane@student.edu');
      
      const response = await request(app)
        .get(`/api/leaves/monthly-limit/${anotherStudent.id}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
    
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/leaves/monthly-limit/${studentUserId}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    it('should return zero approved leaves when student has no approved leaves', async () => {
      // Clear all leaves
      await db.read();
      db.data.leaves = [];
      await db.write();
      
      const response = await request(app)
        .get(`/api/leaves/monthly-limit/${studentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.approvedThisMonth).toBe(0);
      expect(response.body.data.remainingLeaves).toBe(3);
    });
    
    it('should update limit after approving a leave', async () => {
      // First, check current limit
      let response = await request(app)
        .get(`/api/leaves/monthly-limit/${studentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      const initialApproved = response.body.data.approvedThisMonth;
      
      // Approve the pending leave
      await request(app)
        .patch('/api/leaves/pending-leave-1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });
      
      // Check limit again
      response = await request(app)
        .get(`/api/leaves/monthly-limit/${studentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.body.data.approvedThisMonth).toBe(initialApproved + 1);
      expect(response.body.data.remainingLeaves).toBe(3 - (initialApproved + 1));
    });
  });
});
