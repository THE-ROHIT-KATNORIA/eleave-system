# Requirements Document

## Introduction

The Calendar Leave Selection System enhances the existing E-Leave Management System by replacing the traditional start/end date selection with an interactive calendar interface. Students can select individual dates from a calendar, where each selected date counts as one leave day against their monthly limit. This provides more granular control over leave requests and better visualization of leave patterns.

## Glossary

- **Calendar Interface**: An interactive monthly calendar component where students can select individual dates for leave requests
- **Leave Day**: A single calendar date selected by a student that counts as one unit against their monthly leave limit
- **Date Selection**: The process of clicking on calendar dates to include them in a leave request
- **Multi-Date Selection**: The ability to select multiple non-consecutive dates in a single leave request
- **Monthly Leave Limit**: The maximum number of individual leave days a student can have approved per calendar month (currently 3)
- **Selected Date Count**: The total number of individual dates selected in the current leave request
- **Calendar Leave Request**: A leave request containing one or more individually selected calendar dates
- **Date Validation**: The process of checking if selected dates are valid for leave requests (not weekends, holidays, past dates)
- **Leave Balance**: The remaining number of leave days available to a student for the current month
- **System**: The enhanced E-Leave Management System with calendar functionality

## Requirements

### Requirement 1

**User Story:** As a student, I want to select individual dates from a calendar interface instead of entering start and end dates, so that I can request leave for specific non-consecutive days.

#### Acceptance Criteria

1. WHEN a student accesses the leave submission form, THE System SHALL display an interactive monthly calendar interface replacing the start date and end date fields
2. WHEN a student clicks on a calendar date, THE System SHALL toggle the selection state of that date (selected/unselected)
3. WHEN a student selects multiple dates, THE System SHALL visually highlight all selected dates on the calendar
4. THE System SHALL display the total count of selected dates prominently near the calendar
5. WHEN a student deselects a previously selected date, THE System SHALL remove the visual highlight and update the selected date count

### Requirement 2

**User Story:** As a student, I want each selected calendar date to count as one leave day against my monthly limit, so that I understand exactly how my leave balance will be affected.

#### Acceptance Criteria

1. WHEN a student selects dates on the calendar, THE System SHALL display a real-time counter showing "X dates selected = X leave days"
2. THE System SHALL calculate the impact on monthly leave balance and display "X leave days remaining after this request"
3. WHEN the selected date count would exceed the student's remaining monthly leave balance, THE System SHALL display a warning message
4. THE System SHALL allow students to submit requests that exceed their monthly limit but display a clear warning about the overage
5. WHEN a calendar leave request is approved, THE System SHALL count each individual selected date as one leave day against the monthly limit
6. WHEN calculating monthly leave usage, THE System SHALL iterate through the selectedDates array and count each date individually, not count the submission as a single unit
7. THE System SHALL display monthly leave usage in the dashboard based on total days selected across all submissions, not the number of submissions

### Requirement 3

**User Story:** As a student, I want to see my current leave balance including both approved and pending leaves, so that I can make informed decisions about my leave requests.

#### Acceptance Criteria

1. WHEN a student opens the calendar leave selection interface, THE System SHALL display the current monthly leave balance at the top of the form
2. THE System SHALL show approved leave days and pending leave days separately in the format "X approved + Y pending = Z total days used"
3. THE System SHALL count each individual selected date in pending leave requests as one pending leave day against the monthly limit
4. WHEN a student selects dates on the calendar, THE System SHALL update a preview showing "After this request: X leave days remaining"
5. WHEN the selected dates would result in exceeding the monthly limit (including pending leaves), THE System SHALL display the preview in red with text "Exceeds monthly limit by X days"
6. THE System SHALL update the balance preview in real-time as dates are selected or deselected

### Requirement 4

**User Story:** As a student, I want the calendar to prevent me from selecting invalid dates, so that I don't accidentally request leave for inappropriate days.

#### Acceptance Criteria

1. THE System SHALL disable past dates on the calendar to prevent selection of dates that have already occurred
2. THE System SHALL disable Sundays on the calendar as they are not valid leave days (Monday through Saturday are allowed)
3. THE System SHALL disable any dates that are marked as college holidays in the system
4. WHEN a student attempts to click on a disabled date, THE System SHALL provide visual feedback (cursor change, tooltip) indicating why the date cannot be selected
5. THE System SHALL only allow selection of valid future dates (Monday-Saturday) that are not holidays

### Requirement 5

**User Story:** As a student, I want to navigate between months in the calendar, so that I can select leave dates from different months in a single request.

#### Acceptance Criteria

1. THE System SHALL provide navigation controls (previous/next month buttons) on the calendar interface
2. WHEN a student navigates to a different month, THE System SHALL maintain all previously selected dates from other months
3. THE System SHALL display the month and year clearly at the top of the calendar
4. THE System SHALL allow selection of dates up to 6 months in the future from the current date
5. WHEN a student navigates beyond the 6-month limit, THE System SHALL disable the next month button and display an informational message

### Requirement 6

**User Story:** As a student, I want to see a summary of all my selected dates before submitting, so that I can review and confirm my leave request.

#### Acceptance Criteria

1. THE System SHALL display a "Selected Dates" summary section below the calendar showing all chosen dates
2. THE System SHALL format the selected dates list as "Day, Month Date, Year" (e.g., "Monday, January 15, 2025")
3. THE System SHALL group selected dates by month when dates span multiple months
4. THE System SHALL provide a "Clear All" button to deselect all dates at once
5. THE System SHALL allow individual removal of dates from the summary list without returning to the calendar

### Requirement 7

**User Story:** As an admin, I want to see calendar leave requests with individual dates clearly listed, so that I can understand exactly which days the student is requesting.

#### Acceptance Criteria

1. WHEN an admin views a calendar leave request card, THE System SHALL display all selected dates in a clear, organized format
2. THE System SHALL show the total number of leave days requested (count of selected dates)
3. THE System SHALL group and display dates by month when the request spans multiple months
4. THE System SHALL highlight if the request would cause the student to exceed their monthly limit for any affected month
5. WHEN an admin approves a calendar leave request, THE System SHALL count each individual selected date against the student's monthly limit for the respective month

### Requirement 8

**User Story:** As a student, I want the calendar interface to be visually appealing and consistent with the existing 3D theme, so that the user experience remains cohesive.

#### Acceptance Criteria

1. THE System SHALL implement the calendar using 3D styling consistent with the existing application theme
2. THE System SHALL use the established light color palette for calendar elements (backgrounds, borders, text)
3. THE System SHALL provide smooth 3D hover effects when hovering over selectable dates
4. THE System SHALL animate the selection/deselection of dates with 3D transitions (scale, depth changes)
5. THE System SHALL maintain responsive design ensuring the calendar works properly on different screen sizes

### Requirement 9

**User Story:** As a developer, I want the calendar leave selection to integrate seamlessly with the existing leave management system, so that no existing functionality is broken.

#### Acceptance Criteria

1. THE System SHALL maintain backward compatibility with existing leave requests that use start/end date format
2. THE System SHALL store calendar leave requests in the same database structure with appropriate date formatting
3. THE System SHALL ensure that monthly leave limit calculations work correctly for both calendar-based and traditional leave requests
4. THE System SHALL maintain all existing API endpoints while adding new calendar-specific functionality
5. THE System SHALL preserve all existing admin panel functionality for managing calendar-based leave requests

### Requirement 10

**User Story:** As a student, I want to receive clear feedback about my calendar selections, so that I understand the system's response to my actions.

#### Acceptance Criteria

1. WHEN a student selects a date, THE System SHALL provide immediate visual feedback with a selection animation
2. WHEN a student attempts to select more dates than their remaining leave balance, THE System SHALL display a warning tooltip
3. WHEN a student submits a calendar leave request, THE System SHALL show a confirmation message listing all selected dates
4. THE System SHALL display loading states during calendar navigation and date selection processing
5. WHEN there are validation errors with the selected dates, THE System SHALL highlight the problematic dates and explain the issue