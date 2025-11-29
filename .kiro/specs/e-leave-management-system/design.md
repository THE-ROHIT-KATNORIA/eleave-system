# E-Leave Management System - Design Document

## Overview

The E-Leave Management System is a full-stack web application featuring a React frontend with Three.js 3D elements, an Express.js backend, and a JSON-based database. The system provides separate interfaces for students and administrators, with an emphasis on visual appeal through 3D design elements and a light theme.

### Technology Stack

- **Frontend**: React 18+, Three.js (via @react-three/fiber and @react-three/drei), React Router, Axios
- **Backend**: Express.js, CORS, lowdb (JSON database)
- **Styling**: CSS Modules or Styled Components with light theme
- **3D Graphics**: Three.js, @react-three/fiber, @react-three/drei

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │           React Application (Port 3000)            │ │
│  │  ┌──────────────┐  ┌──────────────────────────┐   │ │
│  │  │ Student Panel│  │     Admin Panel          │   │ │
│  │  └──────────────┘  └──────────────────────────┘   │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │   Three.js 3D Scene Components               │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js Server (Port 5000)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │              API Routes Layer                      │ │
│  │  /api/auth  /api/leaves  /api/users               │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Business Logic Layer                     │ │
│  │  Authentication  Leave Management  User Management│ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Data Access Layer                     │ │
│  │              lowdb JSON Database                   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │   db.json     │
                  └───────────────┘
```

### Application Flow

1. User accesses the application and sees a 3D landing page with login
2. User authenticates (student or admin)
3. System routes to appropriate panel based on user role
4. Student Panel: Submit leave, view status with 3D visual feedback
5. Admin Panel: View categorized leaves by stream, approve/reject/delete with 3D transitions

## Components and Interfaces

### Roll Number Feature Implementation

The roll number feature ensures data consistency and reduces manual entry errors by:

1. **Registration Phase**
   - Student registration form includes a required roll number field
   - Backend validates roll number uniqueness before account creation
   - Roll number is stored in the user profile along with name, email, and stream

2. **Leave Submission Phase**
   - When student opens leave submission form, system fetches user profile via API
   - Name, roll number, and stream fields are pre-populated from profile data
   - These fields are rendered as disabled/read-only inputs (visual feedback that they cannot be edited)
   - Only start date, end date, and reason fields are editable
   - On form submission, profile data is included automatically with the leave request

3. **Display Phase**
   - Leave request cards show roll number alongside student name
   - Admin panel displays roll number for easy student identification
   - Student status view shows roll number in leave history

### Frontend Components

#### Core Layout Components

1. **App.jsx**
   - Root component with routing configuration
   - Manages authentication state
   - Provides theme context

2. **LandingPage.jsx**
   - 3D hero section with animated elements
   - Login/Register forms
   - Register form includes: name, email, password, roll number (for students), stream (for students)
   - Roll number validation (required for students, unique check)
   - Three.js scene with floating geometric shapes

3. **Navbar.jsx**
   - Navigation with user info
   - Logout functionality
   - Responsive design with light theme

#### Student Panel Components

4. **StudentDashboard.jsx**
   - Overview of leave statistics
   - 3D card components for quick actions
   - Navigation to submit/view leaves
   - Monthly leave limit indicator component

5. **LeaveLimitIndicator.jsx**
   - Visual display of remaining leaves for current month
   - Shows "X leaves left" with progress bar or circular indicator
   - 3D styled component with light theme
   - Updates dynamically when leave status changes
   - Fetches approved leave count for current month from API

6. **LeaveSubmissionForm.jsx**
   - Read-only pre-filled fields: name, roll number, stream (from user profile)
   - Editable form fields: start date, end date, reason
   - Form validation
   - 3D submit button with animation
   - Fetches user profile data on component mount

7. **LeaveStatusView.jsx**
   - List of submitted leaves
   - Status badges (Pending, Approved, Rejected)
   - 3D card layout with hover effects
   - Filter and search functionality

#### Admin Panel Components

7. **AdminDashboard.jsx**
   - Statistics overview (total, pending, approved, rejected)
   - 3D data visualization
   - Quick access to stream sections

8. **StreamSection.jsx**
   - Tabbed interface for each stream
   - Leave request cards organized by stream
   - Filter controls

9. **LeaveRequestCard.jsx**
   - Display leave details including student name, roll number, stream
   - Action buttons (Approve, Reject, Delete)
   - 3D flip animation on hover
   - Status indicator
   - Monthly leave limit badge showing approved/remaining leaves for the student
   - Color-coded indicator (green: 0-1 used, yellow: 2 used, red: 3 used)
   - Fetches student's monthly limit data from API

#### 3D Components

10. **Scene3D.jsx**
    - Main Three.js canvas wrapper
    - Lighting setup
    - Camera controls

11. **FloatingShapes.jsx**
    - Animated geometric shapes (spheres, cubes, toruses)
    - Particle effects
    - Interactive on mouse movement

12. **AnimatedCard3D.jsx**
    - Reusable 3D card component
    - Hover animations
    - Depth effects

13. **LoadingSpinner3D.jsx**
    - 3D loading animation
    - Used during API calls

### Backend API Endpoints

#### Authentication Routes (`/api/auth`)

```javascript
POST /api/auth/login
  Request: { email, password }
  Response: { token, user: { id, name, email, role } }

POST /api/auth/register
  Request: { name, email, password, role, stream?, rollNumber? }
  Response: { message, userId }
  Note: rollNumber is required when role is 'student'
```

#### Leave Routes (`/api/leaves`)

```javascript
GET /api/leaves
  Query: ?userId=<id>&role=<student|admin>&stream=<stream>
  Response: { leaves: [...] }

POST /api/leaves
  Request: { userId, userName, rollNumber, stream, startDate, endDate, reason }
  Response: { message, leaveId }
  Note: userName, rollNumber, and stream are auto-populated from user profile

PATCH /api/leaves/:id
  Request: { status: 'approved' | 'rejected' }
  Response: { message, leave }

DELETE /api/leaves/:id
  Response: { message }

GET /api/leaves/stats
  Query: ?stream=<stream>
  Response: { total, pending, approved, rejected }

GET /api/leaves/monthly-limit/:userId
  Response: { 
    monthlyLimit: 3,
    approvedThisMonth: number,
    remainingLeaves: number,
    currentMonth: string,
    currentYear: number
  }
  Note: Returns the monthly leave limit status for a specific student
```

#### User Routes (`/api/users`)

```javascript
GET /api/users/:id
  Response: { user: { id, name, email, role, stream, rollNumber } }
```

## Data Models

### User Model

```javascript
{
  id: string,              // UUID
  name: string,
  email: string,           // Unique
  password: string,        // Hashed
  role: 'student' | 'admin',
  stream: string,          // Only for students: BCA, BA, PGDCA, BSC, BCOM
  rollNumber: string,      // Only for students: Unique identifier
  createdAt: timestamp
}
```

### Leave Request Model

```javascript
{
  id: string,              // UUID
  userId: string,          // Reference to User
  userName: string,
  rollNumber: string,      // Student's roll number from profile
  stream: string,          // BCA, BA, PGDCA, BSC, BCOM
  startDate: string,       // ISO date format
  endDate: string,         // ISO date format
  reason: string,
  status: 'pending' | 'approved' | 'rejected',
  submittedAt: timestamp,
  updatedAt: timestamp
}
```

### Monthly Leave Limit Logic

The monthly leave limit is calculated dynamically based on approved leaves:

- **Monthly Limit**: 3 approved leaves per calendar month
- **Calculation**: Count leaves where `status === 'approved'` and the approval date (updatedAt) falls within the current month
- **Reset**: Automatically resets at the start of each new month (no database changes needed)
- **Only Approved Leaves Count**: Pending and rejected leaves do not affect the limit

### Database Structure (db.json)

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "password": "hashed_password",
      "role": "student",
      "stream": "BCA",
      "rollNumber": "BCA2023001",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "leaves": [
    {
      "id": "uuid",
      "userId": "uuid",
      "userName": "John Doe",
      "rollNumber": "BCA2023001",
      "stream": "BCA",
      "startDate": "2025-01-15",
      "endDate": "2025-01-17",
      "reason": "Medical emergency",
      "status": "pending",
      "submittedAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T10:00:00.000Z"
    }
  ]
}
```

## 3D Design Specifications

### Visual Theme

- **Color Palette** (Light Theme):
  - Primary: #6366f1 (Indigo)
  - Secondary: #8b5cf6 (Purple)
  - Background: #f8fafc (Light gray)
  - Surface: #ffffff (White)
  - Text: #1e293b (Dark slate)
  - Accent: #06b6d4 (Cyan)

### 3D Elements

1. **Landing Page Scene**
   - Floating geometric shapes (spheres, cubes, toruses)
   - Gentle rotation and floating animation
   - Interactive: shapes respond to mouse movement
   - Soft shadows and ambient lighting

2. **Dashboard Cards**
   - 3D card components with depth
   - Hover effect: card lifts and rotates slightly
   - Smooth transitions using spring animations

3. **Leave Status Indicators**
   - 3D badges with glow effects
   - Color-coded: Green (Approved), Red (Rejected), Yellow (Pending)
   - Pulsing animation for pending status

4. **Background Elements**
   - Subtle particle system
   - Gradient mesh background
   - Depth of field effect

5. **Transitions**
   - Page transitions with 3D wipe effects
   - Button clicks trigger ripple animations in 3D space

### Performance Considerations

- Use instanced meshes for repeated geometries
- Implement level of detail (LOD) for complex scenes
- Lazy load 3D components
- Optimize texture sizes
- Use React.memo for 3D components
- Implement viewport-based rendering (only render visible 3D elements)

## Error Handling

### Frontend Error Handling

1. **API Errors**
   - Display user-friendly error messages
   - Toast notifications for errors
   - Fallback UI for failed data loads

2. **Form Validation**
   - Real-time validation feedback
   - Clear error messages below fields
   - Prevent submission with invalid data

3. **3D Rendering Errors**
   - Fallback to 2D UI if WebGL not supported
   - Error boundaries around 3D components
   - Graceful degradation

### Backend Error Handling

1. **Request Validation**
   - Validate all incoming data
   - Return 400 Bad Request with error details
   - Sanitize inputs to prevent injection

2. **Authentication Errors**
   - Return 401 Unauthorized for invalid credentials
   - Return 403 Forbidden for insufficient permissions

3. **Database Errors**
   - Catch and log database errors
   - Return 500 Internal Server Error
   - Implement retry logic for transient failures

4. **Not Found Errors**
   - Return 404 for non-existent resources
   - Provide helpful error messages

### Error Response Format

```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable error message',
    details: {} // Optional additional context
  }
}
```

## Testing Strategy

### Frontend Testing

1. **Component Testing**
   - Test React components with React Testing Library
   - Test user interactions (form submission, button clicks)
   - Test conditional rendering based on user role

2. **3D Component Testing**
   - Mock Three.js components
   - Test component mounting and unmounting
   - Verify proper cleanup of 3D resources

3. **Integration Testing**
   - Test API integration with mock server
   - Test routing and navigation
   - Test authentication flow

### Backend Testing

1. **API Endpoint Testing**
   - Test all CRUD operations
   - Test authentication middleware
   - Test input validation
   - Test error responses

2. **Database Testing**
   - Test data persistence
   - Test query operations
   - Test data integrity

### Manual Testing Checklist

- [ ] Student can register and login
- [ ] Student can submit leave request
- [ ] Student can view leave status
- [ ] Admin can login
- [ ] Admin can view leaves by stream
- [ ] Admin can approve leave
- [ ] Admin can reject leave
- [ ] Admin can delete leave
- [ ] 3D elements render correctly
- [ ] Responsive design works on mobile
- [ ] Light theme is consistent across pages
- [ ] Form validation works correctly
- [ ] Error messages display properly

## Security Considerations

1. **Authentication**
   - Use bcrypt for password hashing
   - Implement JWT tokens for session management
   - Store tokens securely (httpOnly cookies or secure localStorage)

2. **Authorization**
   - Verify user role before granting access to admin routes
   - Ensure students can only view/modify their own leaves

3. **Input Validation**
   - Validate all inputs on both frontend and backend
   - Sanitize user inputs to prevent XSS attacks
   - Use parameterized queries (not applicable for JSON DB, but good practice)

4. **CORS Configuration**
   - Configure CORS to allow only frontend origin
   - Restrict allowed methods and headers

## Deployment Considerations

### Development Setup

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:5000`
- CORS enabled for local development

### Production Recommendations

- Build React app for production
- Serve static files from Express
- Use environment variables for configuration
- Implement proper logging
- Consider migrating from JSON DB to PostgreSQL/MongoDB for production
- Add rate limiting to API endpoints
- Implement HTTPS
- Use a process manager (PM2) for Node.js

## Monthly Leave Limit Implementation Details

### Backend Implementation

1. **API Endpoint**: `GET /api/leaves/monthly-limit/:userId`
   - Fetches all leaves for the user
   - Filters leaves where status is 'approved'
   - Filters by current month and year using updatedAt timestamp
   - Counts approved leaves
   - Returns: monthlyLimit (3), approvedThisMonth, remainingLeaves

2. **Leave Approval Logic**
   - When admin approves a leave via `PATCH /api/leaves/:id`
   - System updates the leave status to 'approved'
   - System updates the updatedAt timestamp to current time
   - No need to check limit before approval (business decision: admin can override)

### Frontend Implementation

1. **LeaveLimitIndicator Component**
   - Displays on StudentDashboard
   - Shows visual indicator (progress bar or circular gauge)
   - Text: "X leaves left this month" or "3/3 leaves available"
   - Color coding:
     - Green: 2-3 leaves remaining
     - Yellow: 1 leave remaining
     - Red: 0 leaves remaining
   - 3D styled with light theme
   - Auto-refreshes when returning to dashboard

2. **Visual Design Options**
   - Option 1: Circular progress indicator with number in center
   - Option 2: Horizontal bar with segments (3 boxes, filled/unfilled)
   - Option 3: Badge-style counter with icon
   - Recommended: Circular 3D indicator matching the app's aesthetic

3. **User Experience**
   - Prominent placement on dashboard (top section)
   - Tooltip explaining the limit on hover
   - Warning message if limit reached
   - Still allows submission (admin can approve if needed)

### Admin Panel Leave Limit Display

1. **LeaveRequestCard Enhancement**
   - Each leave request card in admin panel displays student's monthly leave status
   - Shows badge or indicator: "X/3 leaves used this month" or "X leaves remaining"
   - Positioned near student name/roll number for easy visibility
   - Color coding:
     - Green: 0-1 approved leaves (plenty available)
     - Yellow: 2 approved leaves (1 remaining)
     - Red: 3 approved leaves (limit reached)
   - Fetches data via GET /api/leaves/monthly-limit/:userId when card renders
   - Updates dynamically after admin approves/rejects a leave

2. **Visual Design**
   - Small badge or pill-shaped indicator
   - Icon + text format (e.g., "📅 2/3 used" or "✓ 1 left")
   - Subtle 3D styling matching the card design
   - Tooltip on hover showing detailed breakdown

3. **Implementation Notes**
   - Each card makes individual API call for student's limit data
   - Consider caching to reduce API calls if multiple cards for same student
   - Show loading state while fetching limit data
   - Graceful fallback if API call fails (hide indicator or show "N/A")

## Future Enhancements

- Email notifications for leave status updates
- Calendar view for leave dates
- Configurable monthly leave limits per stream
- Multi-level approval workflow
- Export leave reports to PDF
- Mobile app version
- Real-time updates using WebSockets
- Advanced 3D visualizations for analytics
- Leave limit warnings before submission
