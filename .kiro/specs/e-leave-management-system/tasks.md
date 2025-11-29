# Implementation Plan

- [x] 1. Initialize project structure and dependencies







  - Create root directory with client and server folders
  - Initialize React app in client folder using Vite or Create React App
  - Initialize Express.js server in server folder with package.json
  - Install frontend dependencies: react-router-dom, axios, @react-three/fiber, @react-three/drei, three
  - Install backend dependencies: express, cors, lowdb, uuid, bcrypt, jsonwebtoken
  - Create basic folder structure for components, pages, services, and API routes
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [x] 2. Set up backend server and database







  - [x] 2.1 Create Express server with CORS configuration


    - Write server.js with Express app initialization
    - Configure CORS middleware to allow frontend origin
    - Set up JSON body parser middleware
    - Add basic error handling middleware
    - _Requirements: 7.2, 7.4_
  
  - [x] 2.2 Initialize lowdb JSON database


    - Create database initialization file with db.json structure
    - Set up database connection using lowdb
    - Create initial schema with users and leaves collections
    - Add rollNumber field to user schema for students
    - Add seed data for testing (sample admin and student users with roll numbers)
    - _Requirements: 7.3, 6.1, 6.3_
  
  - [x] 2.3 Implement authentication utilities


    - Create password hashing functions using bcrypt
    - Implement JWT token generation and verification
    - Create authentication middleware for protected routes
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Build authentication API endpoints






  - [x] 3.1 Update POST /api/auth/register endpoint for roll number







    - Add rollNumber field to registration request validation
    - Implement roll number uniqueness check for student accounts
    - Require rollNumber when role is 'student'
    - Store rollNumber in user profile along with name, email, and stream
    - Return appropriate error if roll number already exists
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 3.2 Create POST /api/auth/login endpoint


    - Implement login logic with credential verification
    - Compare hashed passwords
    - Generate JWT token on successful authentication
    - Return user data and token
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 3.3 Write API endpoint tests for authentication


    - Test successful registration
    - Test duplicate email rejection
    - Test successful login
    - Test invalid credentials
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 4. Build leave management API endpoints





  - [x] 4.1 Create GET /api/leaves endpoint


    - Implement query filtering by userId, role, and stream
    - Return leaves for students (their own) or admins (filtered by stream)
    - Add sorting by submission date
    - _Requirements: 2.1, 2.2, 3.1, 3.2_
  

  - [x] 4.2 Update POST /api/leaves endpoint for roll number






    - Add rollNumber field to leave request schema
    - Accept rollNumber in request body (auto-populated from frontend)
    - Store rollNumber with leave request data
    - Validate that rollNumber matches the authenticated user's profile
    - _Requirements: 1.1, 1.2, 1.3, 7.4, 7.5_
  

  - [x] 4.3 Create PATCH /api/leaves/:id endpoint

    - Implement status update logic (approve/reject)
    - Verify admin authorization
    - Update leave status and timestamp
    - _Requirements: 4.1, 4.2, 4.3_
  

  - [x] 4.4 Create DELETE /api/leaves/:id endpoint

    - Implement leave deletion logic
    - Verify admin authorization
    - Remove leave from database
    - _Requirements: 4.4, 4.5_
  

  - [x] 4.5 Create GET /api/leaves/stats endpoint

    - Calculate statistics (total, pending, approved, rejected)
    - Support filtering by stream
    - Return aggregated data for dashboard
    - _Requirements: 3.1, 3.2_
  

  - [x] 4.6 Create GET /api/users/:id endpoint for user profile











    - Implement endpoint to fetch user profile by ID
    - Return user data including name, email, role, stream, and rollNumber
    - Add authentication middleware to verify user can access the profile
    - Exclude password from response
    - _Requirements: 7.1, 7.2_

  - [x] 4.7 Write API endpoint tests for leave management

    - Test leave creation with valid data
    - Test leave retrieval with filters
    - Test status updates
    - Test deletion
    - Test statistics calculation
    - _Requirements: 1.1, 1.3, 2.1, 4.2, 4.3, 4.5_

- [x] 5. Create frontend routing and authentication context





  - [x] 5.1 Set up React Router with route configuration


    - Create App.jsx with router setup
    - Define routes for landing, student dashboard, admin dashboard
    - Implement protected route component
    - _Requirements: 6.2, 6.3_
  
  - [x] 5.2 Create authentication context and hooks


    - Implement AuthContext for managing user state
    - Create useAuth hook for accessing auth state
    - Add login, logout, and register functions
    - Store JWT token in localStorage
    - Implement automatic token validation on app load
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 5.3 Create API service layer


    - Create axios instance with base URL configuration
    - Implement request interceptor to attach JWT token
    - Create service functions for all API endpoints
    - Add error handling and response transformation
    - _Requirements: 7.4_

- [x] 6. Build 3D components and scene setup




  - [x] 6.1 Create base 3D scene components


    - Implement Scene3D.jsx with Canvas and lighting setup
    - Configure camera and controls
    - Add ambient and directional lights
    - Set up responsive canvas sizing
    - _Requirements: 5.1, 5.3, 5.5_
  
  - [x] 6.2 Create FloatingShapes component


    - Implement animated geometric shapes (spheres, cubes, toruses)
    - Add rotation and floating animations using useFrame
    - Implement mouse interaction for shape movement
    - Add particle effects
    - _Requirements: 5.1, 5.3_
  
  - [x] 6.3 Create AnimatedCard3D component


    - Build reusable 3D card component with depth
    - Implement hover animations (lift and rotate)
    - Add spring animations for smooth transitions
    - Apply light theme colors
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 6.4 Create LoadingSpinner3D component


    - Design 3D loading animation
    - Implement rotation and scaling effects
    - Make it reusable across the application
    - _Requirements: 5.1, 5.3_

- [x] 7. Build landing page with 3D elements





  - [x] 7.1 Create LandingPage component structure


    - Design layout with 3D hero section
    - Integrate FloatingShapes component
    - Add gradient mesh background
    - Implement responsive design
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  

  - [x] 7.2 Update registration form to include roll number field






    - Add roll number input field to student registration form
    - Implement validation for roll number (required for students)
    - Show roll number field only when student role is selected
    - Display error message if roll number already exists
    - Update form submission to include rollNumber in API request
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  

  - [x] 7.3 Add 3D animations and transitions

    - Implement page entry animations
    - Add button hover effects with 3D transforms
    - Create smooth transitions between login and register forms
    - _Requirements: 5.1, 5.3_

- [x] 8. Build student panel components





  - [x] 8.1 Create StudentDashboard component


    - Design dashboard layout with statistics overview
    - Display leave summary (total, pending, approved, rejected)
    - Add 3D card components for navigation
    - Fetch and display user-specific data
    - _Requirements: 2.1, 2.2, 5.1, 5.3_
  
  - [x] 8.2 Update LeaveSubmissionForm to auto-populate student profile data







    - Fetch user profile data (name, rollNumber, stream) on component mount using GET /api/users/:id
    - Display name, roll number, and stream as read-only/disabled input fields
    - Ensure these fields are visually distinct (grayed out or with lock icon)
    - Keep date pickers and reason field as editable
    - Include profile data (name, rollNumber, stream) in leave submission payload
    - Prevent manual editing of profile fields
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 8.3 Update LeaveStatusView to display roll number







    - Display roll number alongside student name in leave cards
    - Show roll number in leave details view
    - Ensure roll number is visible in the card header or prominent position
    - _Requirements: 2.1, 2.2, 2.3, 7.5_
  
  - [x] 8.4 Add navigation and layout


    - Create Navbar component with user info and logout
    - Implement navigation between submission and status views
    - Apply light theme styling consistently
    - _Requirements: 5.2, 6.5_

- [x] 9. Build admin panel components





  - [x] 9.1 Create AdminDashboard component


    - Design dashboard with statistics overview
    - Display aggregated leave data (total, pending, approved, rejected)
    - Add 3D data visualization elements
    - Create quick access buttons to stream sections
    - Fetch statistics from API
    - _Requirements: 3.1, 3.2, 5.1, 5.3_
  
  - [x] 9.2 Create StreamSection component


    - Implement tabbed interface for each stream (BCA, BA, PGDCA, BSC, BCOM)
    - Add filter controls for status
    - Display leave requests organized by selected stream
    - Implement tab switching with 3D transitions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1_
  
  - [x] 9.3 Update LeaveRequestCard to display roll number







    - Add roll number display alongside student name in card header
    - Format display as "Name (Roll No: XXXXX)" or similar
    - Ensure roll number is clearly visible for admin identification
    - _Requirements: 3.3, 7.5_
  
  - [x] 9.4 Add admin navigation and layout


    - Create admin-specific navbar
    - Implement navigation between dashboard and stream sections
    - Apply consistent light theme styling
    - _Requirements: 5.2, 6.3_

- [x] 10. Implement styling and theme






  - [x] 10.1 Create light theme color system

    - Define CSS variables for color palette
    - Implement primary, secondary, background, and accent colors
    - Create consistent spacing and typography system
    - _Requirements: 5.2_
  

  - [x] 10.2 Style all components with light theme

    - Apply light theme to all pages and components
    - Ensure consistent button and form styling
    - Add shadows and depth effects
    - Implement responsive design for mobile devices
    - _Requirements: 5.2, 5.4_
  

  - [x] 10.3 Add animations and transitions

    - Implement page transition effects
    - Add button click animations
    - Create smooth hover effects
    - Add loading and success animations
    - _Requirements: 5.1, 5.3_

- [x] 11. Optimize performance and add error handling





  - [x] 11.1 Optimize 3D rendering performance


    - Implement React.memo for 3D components
    - Use instanced meshes for repeated geometries
    - Add viewport-based rendering
    - Optimize texture sizes and geometries
    - Ensure page load time under 3 seconds
    - _Requirements: 5.5_
  

  - [x] 11.2 Add error boundaries and fallbacks

    - Create error boundary components
    - Implement fallback UI for 3D rendering failures
    - Add WebGL support detection
    - Provide graceful degradation to 2D UI
    - _Requirements: 5.1, 5.5_
  

  - [x] 11.3 Implement comprehensive error handling

    - Add toast notifications for errors
    - Display user-friendly error messages
    - Handle API errors gracefully
    - Add retry logic for failed requests
    - Implement form validation error display
    - _Requirements: 1.4, 1.5, 2.4_

- [x] 12. Final integration and testing






  - [x] 12.1 Connect all components and test user flows

    - Test complete student workflow (register, login, submit leave, view status)
    - Test complete admin workflow (login, view leaves, approve/reject/delete)
    - Verify stream filtering works correctly
    - Test authentication and authorization
    - Verify 3D elements render correctly across browsers
    - _Requirements: All requirements_
  

  - [x] 12.2 Test responsive design and cross-browser compatibility

    - Test on mobile devices and tablets
    - Verify 3D elements work on different screen sizes
    - Test on Chrome, Firefox, Safari, and Edge
    - Ensure light theme is consistent everywhere
    - _Requirements: 5.2, 5.4_
  

  - [x] 12.3 Create development documentation

    - Write README with setup instructions
    - Document API endpoints
    - Add code comments for complex logic
    - Create user guide for students and admins
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 13. Implement monthly leave limit feature





  - [x] 13.1 Create backend API endpoint for monthly leave limit


    - Implement GET /api/leaves/monthly-limit/:userId endpoint in server routes
    - Add logic to filter approved leaves for current month and year
    - Calculate remaining leaves (3 minus approved count)
    - Return response with monthlyLimit, approvedThisMonth, remainingLeaves, currentMonth, currentYear
    - Add authentication middleware to verify user access
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.5_

  - [x] 13.2 Create LeaveLimitIndicator component


    - Create new React component LeaveLimitIndicator.jsx in client/src/components
    - Implement API call to fetch monthly limit data using GET /api/leaves/monthly-limit/:userId
    - Design visual indicator showing remaining leaves (circular progress or bar style)
    - Add color coding: green (2-3 left), yellow (1 left), red (0 left)
    - Display text like "X leaves left this month" or "X/3 leaves available"
    - Apply 3D styling consistent with light theme
    - Add hover tooltip explaining the monthly limit
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 13.3 Integrate LeaveLimitIndicator into StudentDashboard


    - Import and add LeaveLimitIndicator component to StudentDashboard.jsx
    - Position indicator prominently in the dashboard (top section or card)
    - Ensure component refreshes when dashboard loads
    - Add responsive styling for mobile devices
    - Test visual appearance with different leave counts (0, 1, 2, 3)
    - _Requirements: 8.1, 8.3, 8.5_

  - [x] 13.4 Add frontend service function for monthly limit API


    - Add getMonthlyLeaveLimit(userId) function to API service layer
    - Handle API errors gracefully with user-friendly messages
    - Add response caching if needed for performance
    - _Requirements: 8.1, 8.3_

  - [x] 13.5 Update LeaveRequestCard to display student's monthly leave limit


    - Modify LeaveRequestCard.jsx component in admin panel
    - Add API call to fetch monthly limit data for the student (userId from leave request)
    - Display leave limit badge showing "X/3 used" or "X remaining" format
    - Implement color coding: green (0-1 used), yellow (2 used), red (3 used)
    - Position badge near student name/roll number in card header
    - Add loading state while fetching limit data
    - Add tooltip on hover showing detailed breakdown
    - Handle API errors gracefully (hide indicator or show "N/A")
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 13.6 Implement real-time update for leave limit in admin cards

    - Update LeaveRequestCard to refresh limit data after approve/reject actions
    - Trigger re-fetch of monthly limit when leave status changes
    - Ensure color coding updates immediately after approval
    - Test that multiple cards for same student show consistent data
    - _Requirements: 10.5_

  - [x] 13.7 Test monthly leave limit functionality


    - Test API endpoint returns correct count for current month
    - Test that only approved leaves are counted
    - Test that pending and rejected leaves don't affect count
    - Test student dashboard indicator displays correct remaining count
    - Test admin panel cards show correct leave limit for each student
    - Test color coding changes based on remaining leaves in both panels
    - Test month boundary (verify count resets in new month)
    - Test with multiple students to ensure isolation
    - Test real-time updates when admin approves/rejects leaves
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 10.3, 10.4, 10.5_
