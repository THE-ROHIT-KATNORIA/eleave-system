import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from './server.js';
import db from './database/db.js';

describe('Integration Tests - Complete User Flows', () => {
  let studentToken;
  let adminToken;
  let studentUserId;
  let leaveId;

  beforeAll(async () => {
    // Ensure database is initialized
    await db.read();
  });

  afterAll(async () => {
    // Clean up test data
    await db.read();
    db.data.users = db.data.users.filter(u => !u.email.includes('test-integration'));
    db.data.leaves = db.data.leaves.filter(l => !l.userName.includes('Test Integration'));
    await db.write();
  });

  describe('Student Workflow', () => {
    it('should allow student to register', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Integration Student',
          email: 'test-integration-student@example.com',
          password: 'password123',
          role: 'student',
          stream: 'BCA'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBeDefined();
      studentUserId = response.body.userId;
    });

    it('should allow student to login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test-integration-student@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('student');
      expect(response.body.user.stream).toBe('BCA');
      studentToken = response.body.token;
    });

    it('should allow student to submit a leave request', async () => {
      const response = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'Test Integration Student',
          stream: 'BCA',
          startDate: '2025-02-01',
          endDate: '2025-02-03',
          reason: 'Integration test leave'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.leaveId).toBeDefined();
      leaveId = response.body.leaveId;
    });

    it('should allow student to view their leave status', async () => {
      const response = await request(app)
        .get(`/api/leaves?userId=${studentUserId}&role=student`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leaves).toBeDefined();
      expect(Array.isArray(response.body.leaves)).toBe(true);
      
      const submittedLeave = response.body.leaves.find(l => l.id === leaveId);
      expect(submittedLeave).toBeDefined();
      expect(submittedLeave.status).toBe('pending');
    });
  });

  describe('Admin Workflow', () => {
    it('should allow admin to login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@college.edu',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('admin');
      adminToken = response.body.token;
    });

    it('should allow admin to view all leaves', async () => {
      const response = await request(app)
        .get('/api/leaves?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leaves).toBeDefined();
      expect(Array.isArray(response.body.leaves)).toBe(true);
    });

    it('should allow admin to filter leaves by stream', async () => {
      const response = await request(app)
        .get('/api/leaves?role=admin&stream=BCA')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leaves).toBeDefined();
      
      // All leaves should be from BCA stream
      response.body.leaves.forEach(leave => {
        expect(leave.stream).toBe('BCA');
      });
    });

    it('should allow admin to approve a leave request', async () => {
      const response = await request(app)
        .patch(`/api/leaves/${leaveId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leave.status).toBe('approved');
    });

    it('should allow admin to reject a leave request', async () => {
      // First, create another leave to reject
      const createResponse = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          userId: studentUserId,
          userName: 'Test Integration Student',
          stream: 'BCA',
          startDate: '2025-03-01',
          endDate: '2025-03-02',
          reason: 'Another test leave'
        });

      const newLeaveId = createResponse.body.leaveId;

      const response = await request(app)
        .patch(`/api/leaves/${newLeaveId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'rejected' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.leave.status).toBe('rejected');
    });

    it('should allow admin to delete a leave request', async () => {
      const response = await request(app)
        .delete(`/api/leaves/${leaveId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should verify leave is deleted', async () => {
      const response = await request(app)
        .get(`/api/leaves?userId=${studentUserId}&role=student`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      const deletedLeave = response.body.leaves.find(l => l.id === leaveId);
      expect(deletedLeave).toBeUndefined();
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/leaves?role=admin');

      expect(response.status).toBe(401);
    });

    it('should reject student access to admin endpoints', async () => {
      const response = await request(app)
        .patch(`/api/leaves/some-id`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'approved' });

      expect(response.status).toBe(403);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@college.edu',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Stream Filtering', () => {
    beforeAll(async () => {
      // Create leaves for different streams
      const streams = ['BCA', 'BA', 'PGDCA', 'BSC', 'BCOM'];
      
      for (const stream of streams) {
        await request(app)
          .post('/api/leaves')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({
            userId: studentUserId,
            userName: 'Test Integration Student',
            stream: stream,
            startDate: '2025-04-01',
            endDate: '2025-04-02',
            reason: `Test leave for ${stream}`
          });
      }
    });

    it('should correctly filter leaves by each stream', async () => {
      const streams = ['BCA', 'BA', 'PGDCA', 'BSC', 'BCOM'];
      
      for (const stream of streams) {
        const response = await request(app)
          .get(`/api/leaves?role=admin&stream=${stream}`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        // Verify all returned leaves are from the requested stream
        response.body.leaves.forEach(leave => {
          expect(leave.stream).toBe(stream);
        });
      }
    });
  });

  describe('Statistics Endpoint', () => {
    it('should return correct statistics', async () => {
      const response = await request(app)
        .get('/api/leaves/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.total).toBeGreaterThanOrEqual(0);
      expect(response.body.stats.pending).toBeGreaterThanOrEqual(0);
      expect(response.body.stats.approved).toBeGreaterThanOrEqual(0);
      expect(response.body.stats.rejected).toBeGreaterThanOrEqual(0);
    });

    it('should return statistics filtered by stream', async () => {
      const response = await request(app)
        .get('/api/leaves/stats?stream=BCA')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
    });
  });
});
