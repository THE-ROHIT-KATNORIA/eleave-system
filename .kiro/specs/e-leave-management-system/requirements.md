# Requirements Document

## Introduction

The E-Leave Management System is a web-based application designed for college students to submit and track leave requests. Students can submit leave applications and view their submission history. The system organizes requests by academic streams (BCA, BA, PGDCA, BSC, BCOM). The application features an attractive 3D interface with a light theme to engage users.

## Glossary

- **Student Panel**: The user interface accessible to students for submitting and tracking leave requests
- **Leave Request**: A formal application submitted by a student requesting absence from college
- **Stream**: An academic program or course (BCA, BA, PGDCA, BSC, BCOM)
- **System**: The E-Leave Management System application
- **User**: A student using the System
- **Roll Number**: A unique identifier assigned to each student for academic record tracking
- **Student Profile**: Permanent student information including name, email, roll number, and stream stored during account creation

## Requirements

### Requirement 1

**User Story:** As a student, I want to submit a leave request with my stream information, so that my request can be properly routed to the relevant administrator.

#### Acceptance Criteria

1. WHEN a student accesses the Student Panel, THE System SHALL display a leave submission form with fields for leave details and stream selection
2. THE System SHALL provide stream options including BCA, BA, PGDCA, BSC, and BCOM in the submission form
3. WHEN a student submits a complete leave request form, THE System SHALL store the request with a "Pending" status
4. WHEN a student submits an incomplete leave request form, THE System SHALL display validation error messages indicating required fields
5. WHEN a leave request is successfully submitted, THE System SHALL display a confirmation message to the student

### Requirement 2

**User Story:** As a student, I want to view my submitted leave requests, so that I can track my leave history.

#### Acceptance Criteria

1. WHEN a student accesses the leave status section, THE System SHALL display a list of all leave requests submitted by that student
2. THE System SHALL display submission date, leave dates, and reason for each leave request
3. WHEN a student has no leave requests, THE System SHALL display a message indicating no requests exist

### Requirement 3

**User Story:** As a user, I want to experience an attractive 3D interface with a light theme, so that the application is visually engaging and pleasant to use.

#### Acceptance Criteria

1. THE System SHALL render 3D visual elements using Three.js library on the user interface
2. THE System SHALL apply a light color theme across all pages and components
3. THE System SHALL display 3D animations or interactive elements that enhance user engagement
4. THE System SHALL maintain responsive design principles ensuring 3D elements render properly on different screen sizes
5. THE System SHALL ensure 3D elements do not negatively impact page load time beyond 3 seconds on standard network connections

### Requirement 4

**User Story:** As a student, I want to provide my roll number during account creation, so that my permanent details are stored and automatically used in leave requests.

#### Acceptance Criteria

1. WHEN a student accesses the account creation form, THE System SHALL display fields for name, email, password, roll number, and stream
2. THE System SHALL validate that the roll number field is not empty before allowing account creation
3. WHEN a student submits the account creation form with valid data, THE System SHALL store the name, email, roll number, and stream as permanent Student Profile information
4. THE System SHALL ensure the roll number is unique across all student accounts
5. WHEN a student account is successfully created, THE System SHALL display a confirmation message with the registered details

### Requirement 5

**User Story:** As a student, I want my name, roll number, and stream to be automatically filled in leave request forms, so that I don't have to enter the same information repeatedly and cannot accidentally change my permanent details.

#### Acceptance Criteria

1. WHEN a student accesses the leave submission form, THE System SHALL retrieve the student's name, roll number, and stream from the Student Profile
2. THE System SHALL display the name, roll number, and stream fields as read-only pre-filled fields in the leave submission form
3. THE System SHALL prevent the student from editing the name, roll number, and stream fields in the leave submission form
4. WHEN a student submits a leave request, THE System SHALL include the Student Profile information (name, roll number, stream) with the leave request data
5. THE System SHALL display the roll number alongside the student name in all leave request displays

### Requirement 6

**User Story:** As a student, I want user authentication to securely access my leave requests, so that my data is protected.

#### Acceptance Criteria

1. THE System SHALL provide a login interface for students to authenticate
2. WHEN a student logs in with valid credentials, THE System SHALL grant access to the Student Panel
3. THE System SHALL maintain user session state during active use
4. WHEN a student logs out, THE System SHALL terminate the session and redirect to the login page

### Requirement 7

**User Story:** As a developer, I want the system built with React frontend and Express.js backend using JSON database, so that the application is maintainable and meets technical requirements.

#### Acceptance Criteria

1. THE System SHALL implement the frontend user interface using React framework
2. THE System SHALL implement the backend API using Express.js framework
3. THE System SHALL use lowdb or json-server for JSON-based database storage
4. THE System SHALL implement RESTful API endpoints for all data operations
5. THE System SHALL integrate Three.js library for 3D rendering capabilities

### Requirement 8

**User Story:** As a student, I want to see how many leaves I have remaining for the current month, so that I can plan my leave requests accordingly.

#### Acceptance Criteria

1. THE System SHALL display a leave limit indicator on the Student Dashboard showing the number of leaves remaining for the current month
2. THE System SHALL set the monthly leave limit to 3 approved leaves per student per calendar month
3. WHEN a student views the leave limit indicator, THE System SHALL display the count of remaining leaves for the current month
4. THE System SHALL calculate remaining leaves by subtracting approved leaves in the current month from the monthly limit of 3
5. THE System SHALL update the leave limit indicator in real-time when a leave status changes to approved

### Requirement 9

**User Story:** As a student, I want only approved leaves to count against my monthly limit, so that pending or rejected leaves do not affect my available leave balance.

#### Acceptance Criteria

1. WHEN a student submits a leave request, THE System SHALL NOT decrement the monthly leave count until the leave is approved
2. WHEN an admin approves a leave request, THE System SHALL decrement the student's remaining leave count for that month by 1
3. WHEN an admin rejects a leave request, THE System SHALL NOT decrement the student's monthly leave count
4. WHEN a leave request status is pending, THE System SHALL NOT include it in the monthly leave count calculation
5. THE System SHALL reset the leave count to 3 at the beginning of each calendar month

### Requirement 10

**User Story:** As an admin, I want to see each student's monthly leave limit status on their leave request cards, so that I can make informed approval decisions based on their remaining leave balance.

#### Acceptance Criteria

1. WHEN an admin views a leave request card in the Admin Panel, THE System SHALL display the student's current monthly leave limit status
2. THE System SHALL show the number of approved leaves the student has used in the current month
3. THE System SHALL show the number of remaining leaves available for the student in the current month
4. THE System SHALL display the leave limit information in a visually distinct format with color coding (green for available leaves, yellow for low balance, red for limit reached)
5. THE System SHALL update the leave limit display in real-time when the admin approves or rejects a leave request
