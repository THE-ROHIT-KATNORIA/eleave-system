# Implementation Plan

- [x] 1. Set up calendar infrastructure and core components



  - Create calendar component directory structure
  - Install required dependencies (date-fns, react-calendar, @react-three/fiber extensions)
  - Set up calendar-specific utility functions for date manipulation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_



- [ ] 2. Implement core calendar date validation service
- [ ] 2.1 Create date validation utility functions
  - Write functions to check if date is past, Sunday, holiday, or beyond future limit


  - Implement date range validation and business rule checks
  - Create helper functions for date formatting and comparison
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_



- [ ] 2.2 Build holiday management service
  - Create holiday configuration system with predefined holidays
  - Implement holiday checking logic for calendar dates
  - Add API endpoint to fetch holidays for date range
  - _Requirements: 4.3, 4.4_



- [ ] 2.3 Implement calendar-specific validation logic
  - Create validation service for selected date arrays
  - Add monthly limit impact calculation for calendar selections
  - Implement real-time validation feedback system

  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. Create interactive 3D calendar interface components
- [ ] 3.1 Build base Calendar3D component
  - Create main calendar container with Three.js canvas
  - Implement monthly grid layout with 3D positioning

  - Add month navigation controls (previous/next buttons)
  - Set up camera positioning and lighting for calendar scene
  - _Requirements: 1.1, 5.1, 5.2, 5.3, 8.1, 8.2, 8.3_

- [ ] 3.2 Implement DateSelector3D individual date cells
  - Create 3D date cell components with hover and selection states
  - Add click handlers for date selection/deselection


  - Implement visual feedback for disabled dates (past, Sunday, holidays)
  - Add smooth 3D animations for selection state changes
  - _Requirements: 1.2, 1.3, 4.4, 8.4, 10.1, 10.2_

- [x] 3.3 Build calendar navigation and month switching


  - Implement smooth month transition animations
  - Add month/year display with 3D styling
  - Create navigation limits (6 months future, no past navigation)
  - Maintain selected dates across month navigation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [ ] 4. Implement real-time leave balance tracking with approved and pending leaves
- [ ] 4.1 Update backend balance API to include pending leaves
  - Modify GET /api/leaves/calendar/:userId/balance to count both approved and pending leaves
  - Return separate counts for approved days and pending days in the response
  - Count each individual selected date in calendar requests (not just submission count)
  - Update balance calculation to loop through selectedDates array for accurate day counting
  - _Requirements: 3.2, 3.3_

- [ ] 4.2 Create LeaveBalanceIndicator3D component with breakdown display
  - Build 3D circular progress indicator showing approved and pending leaves separately
  - Display format: "X approved + Y pending = Z total days used"
  - Add visual distinction between approved (solid) and pending (striped pattern) sections
  - Add color coding (green/yellow/red) based on total usage levels
  - Implement real-time updates when dates are selected/deselected
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2_

- [ ] 4.3 Build balance calculation and preview logic
  - Create service to calculate monthly leave impact from selected dates
  - Implement preview showing balance after current selections including pending leaves
  - Add warning system for selections exceeding monthly limits (considering pending)
  - Handle multi-month selections with per-month impact display
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.4, 3.5, 3.6_

- [ ] 5. Create selected dates summary and management
- [x] 5.1 Build SelectedDatesSummary component

  - Display all selected dates in organized list format
  - Group dates by month when spanning multiple months
  - Add individual date removal functionality
  - Implement "Clear All" button with confirmation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [ ] 5.2 Add date summary formatting and display
  - Format dates as "Day, Month Date, Year" for readability
  - Create responsive layout for date summary section
  - Add visual indicators for dates in different months
  - Implement smooth animations for adding/removing dates from summary
  - _Requirements: 6.2, 6.3, 6.5_



- [ ] 6. Integrate calendar with main leave submission form
- [ ] 6.1 Create CalendarLeaveForm main container
  - Build main form component integrating calendar with existing form fields
  - Fetch and display user profile data (name, roll number, stream)
  - Add reason field and form validation for calendar-based requests

  - Implement form submission logic for calendar date arrays
  - _Requirements: 1.1, 9.1, 9.2, 9.3_

- [ ] 6.2 Add calendar form validation and submission
  - Validate selected dates before form submission
  - Display validation errors and warnings to user
  - Implement submission confirmation with selected dates summary


  - Add loading states during form processing
  - _Requirements: 10.3, 10.4, 10.5_

- [ ] 7. Enhance backend API for calendar support
- [x] 7.1 Extend leave routes for calendar requests

  - Add POST /api/leaves/calendar endpoint for calendar-based submissions
  - Modify existing leave model to support selectedDates array
  - Implement backward compatibility with traditional start/end date requests
  - Add calendar-specific validation middleware
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 7.1.1 Fix monthly-limit endpoint to count days instead of submissions



  - Update GET /api/leaves/monthly-limit/:userId to count individual days from selectedDates array
  - Loop through selectedDates and count each date for calendar requests
  - Ensure traditional requests still count as 1 day
  - Fix dashboard leave indicator to show correct day count
  - _Requirements: 2.5, 2.6, 2.7_


- [ ] 7.2 Create calendar validation API endpoints
  - Add POST /api/calendar/validate-dates for real-time validation
  - Create GET /api/calendar/holidays endpoint for holiday data
  - Implement date validation service on backend
  - Add monthly limit calculation API for calendar requests
  - _Requirements: 2.3, 4.3, 9.4_



- [ ] 7.3 Update monthly leave limit calculations
  - Modify leave counting logic to handle both traditional and calendar requests
  - Ensure calendar dates count correctly against monthly limits
  - Update admin approval logic to handle calendar date arrays
  - Maintain existing monthly limit reset functionality

  - _Requirements: 2.5, 7.1, 7.2, 7.3, 7.4, 7.5, 9.3_

- [ ] 8. Enhance admin panel for calendar leave requests
- [ ] 8.1 Update LeaveRequestCard for calendar display
  - Display all selected dates in admin leave request cards
  - Show total count of leave days requested
  - Add monthly limit impact indicators for calendar requests

  - Group and format calendar dates by month in admin view
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 8.2 Maintain admin approval functionality
  - Ensure approve/reject/delete actions work with calendar requests
  - Update leave status change logic for calendar date counting

  - Preserve existing admin panel functionality for traditional requests
  - Add visual distinction between calendar and traditional requests
  - _Requirements: 7.5, 9.1, 9.2, 9.5_

- [ ] 9. Add comprehensive error handling and user feedback
- [ ] 9.1 Implement calendar-specific error handling
  - Add error boundaries for calendar components


  - Create fallback UI when calendar fails to load
  - Implement graceful degradation to traditional form
  - Add comprehensive error messages for date selection issues
  - _Requirements: 10.1, 10.2, 10.4, 10.5_


- [ ] 9.2 Add user feedback and loading states
  - Implement loading spinners for calendar navigation and API calls
  - Add success/error toast notifications for calendar actions
  - Create confirmation dialogs for important calendar actions
  - Add tooltips and help text for calendar functionality
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_



- [ ] 10. Integrate calendar system with existing application
- [ ] 10.1 Update routing and navigation
  - Add calendar leave form to existing routing structure
  - Create navigation between traditional and calendar forms
  - Ensure proper authentication checks for calendar features

  - Update main navigation to include calendar option
  - _Requirements: 9.1, 9.2_

- [ ] 10.2 Ensure database compatibility and migration
  - Update database schema to support calendar request format
  - Create migration script for existing leave data compatibility


  - Test data integrity between traditional and calendar requests
  - Ensure all existing queries work with enhanced data model
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 10.3 Add comprehensive testing suite
  - Write unit tests for calendar components and date validation
  - Create integration tests for calendar API endpoints
  - Add end-to-end tests for complete calendar leave submission flow
  - Test calendar functionality across different screen sizes and browsers
  - _Requirements: All requirements validation_

- [ ] 11. Final integration and system testing
- [ ] 11.1 Perform end-to-end integration testing
  - Test complete calendar leave submission workflow
  - Verify monthly limit calculations work correctly with calendar selections
  - Test admin approval process for calendar-based requests
  - Ensure backward compatibility with existing leave management features
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11.2 Optimize performance and user experience
  - Optimize 3D calendar rendering performance
  - Implement efficient caching for holiday and validation data
  - Test calendar responsiveness on mobile devices
  - Fine-tune animations and transitions for smooth user experience
  - _Requirements: 8.5, 10.4_