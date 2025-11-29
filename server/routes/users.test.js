import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import usersRoutes from './users.js';
import authRoutes from './auth.js';
import db from '../database/db.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

describe('User Profile API Endpoints', () => {
  let studentToken;
  let adminToken;
  let studentUserId;
  let anotherStudentUserId;
  
  beforeEach(async () => {
    // Reset database to initial state before each test
    await db.read();
    db.data.users = db.data.users.filter(user => 
      user.email === 'admin@college.edu' || user.email === 'john@student.edu' || user.email === 'jane@student.edu'
    );
    await db.write();
    
    // Login as student to get token
    const studentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@student.edu',
        password: 'student123'
      });
    
    studentToken = studentLoginResponse.body.token;
    studentUserId = studentLoginResponse.body.user.id;
    
    // Login as admin to get token
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@college.edu',
        password: 'admin123'
      });
    
    adminToken = adminLoginResponse.body.token;
    
    // Get another student's ID
    await db.read();
    const anotherStudent = db.data.users.find(u => u.email === 'jane@student.edu');
    anotherStudentUserId = anotherStudent?.id;
  });
  
  describe('GET /api/users/:id', () => {
    
    it('should successfully fetch own user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${studentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(studentUserId);
      expect(response.body.user.name).toBeDefined();
      expect(response.body.user.email).toBe('john@student.edu');
      expect(response.body.user.role).toBe('student');
      expect(response.body.user.stream).toBeDefined();
      expect(response.body.user.rollNumber).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });
    
    it('should reject access without authentication token', async () => {
      const response = await request(app)
        .get(`/api/users/${studentUserId}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });
    
    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get(`/api/users/${studentUserId}`)
        .set('Authorization', 'Bearer invalid_token');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
    
    it('should reject student accessing another student profile', async () => {
      const response = await request(app)
        .get(`/api/users/${anotherStudentUserId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(response.body.error.message).toBe('You do not have permission to access this profile');
    });
    
    it('should allow admin to access any user profile', async () => {
      const response = await request(app)
        .get(`/api/users/${studentUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(studentUserId);
      expect(response.body.user.password).toBeUndefined();
    });
    
    it('should return 404 for non-existent user', async () => {
      const nonExistentId = 'non-existent-id-12345';
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
      expect(response.body.error.message).toBe('User not found');
    });
  });
});
