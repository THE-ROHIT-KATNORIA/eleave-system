# API Documentation

## Overview

The E-Leave Management System API is a RESTful API built with Express.js. It provides endpoints for user authentication and leave request management.

**Base URL:** `http://localhost:5000/api`

**Version:** 1.0.0

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, include the token in the Authorization header for all protected endpoints.

```http
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

Tokens expire after 24 hours. Users must login again to obtain a new token.

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Endpoints

### Health Check

#### GET /api/health

Check if the server is running.

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

---

## Authentication Endpoints

### Register User

#### POST /api/auth/register

Register a new user (student or admin).

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "stream": "BCA"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Valid email address (must be unique) |
| password | string | Yes | Password (min 6 characters) |
| role | string | Yes | User role: "student" or "admin" |
| stream | string | Conditional | Required for students. One of: BCA, BA, PGDCA, BSC, BCOM |

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**

- **400 Bad Request** - Missing required fields
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "All fields are required"
  }
}
```

- **400 Bad Request** - Email already exists
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "Email already registered"
  }
}
```

- **400 Bad Request** - Invalid role
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Role must be either 'student' or 'admin'"
  }
}
```

---

### Login

#### POST /api/auth/login

Authenticate a user and receive a JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address |
| password | string | Yes | User's password |

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "stream": "BCA"
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing credentials
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email and password are required"
  }
}
```

- **401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

---

## Leave Management Endpoints

### Get Leaves

#### GET /api/leaves

Retrieve leave requests based on user role and filters.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | string | Conditional | Required for students. User ID to filter leaves |
| role | string | Yes | User role: "student" or "admin" |
| stream | string | No | Filter by stream (admin only) |

**Examples:**

Student viewing their leaves:
```http
GET /api/leaves?userId=550e8400-e29b-41d4-a716-446655440000&role=student
```

Admin viewing all leaves:
```http
GET /api/leaves?role=admin
```

Admin viewing BCA stream leaves:
```http
GET /api/leaves?role=admin&stream=BCA
```

**Success Response (200):**
```json
{
  "success": true,
  "leaves": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "userName": "John Doe",
      "stream": "BCA",
      "startDate": "2025-02-01",
      "endDate": "2025-02-03",
      "reason": "Medical appointment",
      "status": "pending",
      "submittedAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid token
- **400 Bad Request** - Missing required parameters

---

### Create Leave Request

#### POST /api/leaves

Submit a new leave request.

**Authentication:** Required

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "John Doe",
  "stream": "BCA",
  "startDate": "2025-02-01",
  "endDate": "2025-02-03",
  "reason": "Medical appointment"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | ID of the user submitting the leave |
| userName | string | Yes | Name of the user |
| stream | string | Yes | Academic stream (BCA, BA, PGDCA, BSC, BCOM) |
| startDate | string | Yes | Leave start date (YYYY-MM-DD format) |
| endDate | string | Yes | Leave end date (YYYY-MM-DD format) |
| reason | string | Yes | Reason for leave |

**Validation Rules:**
- Start date must be before or equal to end date
- Dates must be in valid format (YYYY-MM-DD)
- All fields are required
- Stream must be one of: BCA, BA, PGDCA, BSC, BCOM

**Success Response (201):**
```json
{
  "success": true,
  "message": "Leave request created successfully",
  "leaveId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Error Responses:**

- **400 Bad Request** - Missing required fields
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "All fields are required"
  }
}
```

- **400 Bad Request** - Invalid date range
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "End date must be after or equal to start date"
  }
}
```

---

### Update Leave Status

#### PATCH /api/leaves/:id

Update the status of a leave request (approve or reject).

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Request Body:**
```json
{
  "status": "approved"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | New status: "approved" or "rejected" |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Leave status updated successfully",
  "leave": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "John Doe",
    "stream": "BCA",
    "startDate": "2025-02-01",
    "endDate": "2025-02-03",
    "reason": "Medical appointment",
    "status": "approved",
    "submittedAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-16T14:30:00.000Z"
  }
}
```

**Error Responses:**

- **403 Forbidden** - Not an admin
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only admins can update leave status"
  }
}
```

- **404 Not Found** - Leave not found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Leave request not found"
  }
}
```

- **400 Bad Request** - Invalid status
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Status must be either 'approved' or 'rejected'"
  }
}
```

---

### Delete Leave Request

#### DELETE /api/leaves/:id

Delete a leave request permanently.

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Leave request ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Leave request deleted successfully"
}
```

**Error Responses:**

- **403 Forbidden** - Not an admin
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Only admins can delete leave requests"
  }
}
```

- **404 Not Found** - Leave not found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Leave request not found"
  }
}
```

---

### Get Leave Statistics

#### GET /api/leaves/stats

Get aggregated statistics for leave requests.

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| stream | string | No | Filter statistics by stream |

**Examples:**

All leaves statistics:
```http
GET /api/leaves/stats
```

BCA stream statistics:
```http
GET /api/leaves/stats?stream=BCA
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "pending": 8,
    "approved": 12,
    "rejected": 5
  }
}
```

**Error Responses:**

- **403 Forbidden** - Not an admin

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid input data or missing required fields |
| DUPLICATE_EMAIL | 400 | Email address already registered |
| INVALID_CREDENTIALS | 401 | Incorrect email or password |
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| TOKEN_EXPIRED | 401 | JWT token has expired |
| FORBIDDEN | 403 | User doesn't have permission for this action |
| NOT_FOUND | 404 | Requested resource not found |
| INTERNAL_ERROR | 500 | Server error occurred |

## Rate Limiting

Currently, there is no rate limiting implemented. For production deployment, consider implementing rate limiting to prevent abuse.

## CORS Configuration

The API is configured to accept requests from:
- Development: `http://localhost:3000`
- Production: Configure via `FRONTEND_URL` environment variable

## Data Models

### User Model

```typescript
{
  id: string;              // UUID
  name: string;            // User's full name
  email: string;           // Unique email address
  password: string;        // Bcrypt hashed password
  role: 'student' | 'admin';
  stream: string | null;   // Only for students
  createdAt: string;       // ISO 8601 timestamp
}
```

### Leave Request Model

```typescript
{
  id: string;              // UUID
  userId: string;          // Reference to User.id
  userName: string;        // User's name (denormalized)
  stream: string;          // BCA, BA, PGDCA, BSC, BCOM
  startDate: string;       // YYYY-MM-DD format
  endDate: string;         // YYYY-MM-DD format
  reason: string;          // Reason for leave
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;     // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

## Example Workflows

### Student Workflow

1. **Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student",
    "stream": "BCA"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

3. **Submit Leave**
```bash
curl -X POST http://localhost:5000/api/leaves \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "userId": "<user-id>",
    "userName": "John Doe",
    "stream": "BCA",
    "startDate": "2025-02-01",
    "endDate": "2025-02-03",
    "reason": "Medical appointment"
  }'
```

4. **View Leaves**
```bash
curl -X GET "http://localhost:5000/api/leaves?userId=<user-id>&role=student" \
  -H "Authorization: Bearer <token>"
```

### Admin Workflow

1. **Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@college.edu",
    "password": "admin123"
  }'
```

2. **View All Leaves**
```bash
curl -X GET "http://localhost:5000/api/leaves?role=admin" \
  -H "Authorization: Bearer <token>"
```

3. **Approve Leave**
```bash
curl -X PATCH http://localhost:5000/api/leaves/<leave-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "approved"
  }'
```

4. **Get Statistics**
```bash
curl -X GET "http://localhost:5000/api/leaves/stats" \
  -H "Authorization: Bearer <token>"
```

## Testing the API

### Using cURL

See example workflows above.

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Your JWT token after login
3. Use `{{base_url}}` and `{{token}}` in requests

### Using the Integration Tests

```bash
cd server
npm test integration.test.js
```

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Tokens**: Tokens are signed with a secret key and expire after 24 hours
3. **Input Validation**: All inputs are validated before processing
4. **Authorization**: Role-based access control for admin endpoints
5. **CORS**: Configured to accept requests only from trusted origins

## Future Enhancements

- Rate limiting
- Refresh tokens
- Email notifications
- File uploads for leave documents
- Pagination for large datasets
- Advanced filtering and sorting
- Audit logs
- Password reset functionality

---

**Last Updated:** November 15, 2025
