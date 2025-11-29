import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from './auth.js';
import db from '../database/db.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication API Endpoints', () => {
  
  beforeEach(async () => {
    // Reset database to initial state before each test
    await db.read();
    db.data.users = db.data.users.filter(user => 
      user.email === 'admin@college.edu' || user.email === 'john@student.edu' || user.email === 'jane@student.edu'
    );
    await db.write();
  });
  
  describe('POST /api/auth/register', () => {
    
    it('should successfully register a new student user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test@student.edu',
          password: 'password123',
          role: 'student',
          stream: 'BCA',
          rollNumber: 'BCA2024001'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.userId).toBeDefined();
    });
    
    it('should successfully register a new admin user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Admin',
          email: 'testadmin@college.edu',
          password: 'admin123',
          role: 'admin'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBeDefined();
    });
    
    it('should reject registration with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'john@student.edu', // Existing email
          password: 'password123',
          role: 'student',
          stream: 'BA',
          rollNumber: 'BA2024001'
        });
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
      expect(response.body.error.message).toBe('Email address already registered');
    });
    
    it('should reject registration without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com'
          // Missing password and role
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
    
    it('should reject student registration without stream', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test@student.edu',
          password: 'password123',
          role: 'student',
          rollNumber: 'BCA2024002'
          // Missing stream
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('STREAM_REQUIRED');
    });
    
    it('should reject registration with invalid stream', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test@student.edu',
          password: 'password123',
          role: 'student',
          stream: 'INVALID',
          rollNumber: 'BCA2024001'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_STREAM');
    });
    
    it('should reject student registration without roll number', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test@student.edu',
          password: 'password123',
          role: 'student',
          stream: 'BCA'
          // Missing rollNumber
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('ROLLNUMBER_REQUIRED');
      expect(response.body.error.message).toBe('Roll number is required for student registration');
    });
    
    it('should reject registration with duplicate roll number', async () => {
      // First, register a student with a roll number
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First Student',
          email: 'first@student.edu',
          password: 'password123',
          role: 'student',
          stream: 'BCA',
          rollNumber: 'BCA2024999'
        });
      
      // Try to register another student with the same roll number
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second Student',
          email: 'second@student.edu',
          password: 'password123',
          role: 'student',
          stream: 'BA',
          rollNumber: 'BCA2024999' // Duplicate roll number
        });
      
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ROLLNUMBER');
      expect(response.body.error.message).toBe('Roll number already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    
    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@student.edu',
          password: 'student123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('john@student.edu');
      expect(response.body.user.role).toBe('student');
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });
    
    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.error.message).toBe('Invalid email or password');
    });
    
    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@student.edu',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.error.message).toBe('Invalid email or password');
    });
    
    it('should reject login without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@student.edu'
          // Missing password
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
