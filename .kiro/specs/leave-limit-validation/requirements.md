# Requirements Document

## Introduction

This feature enhances the e-leave management system by implementing leave limit validation with user-friendly warnings. When users attempt to submit leave requests that would exceed their allocated leave limits, the system will display clear warning messages and prevent submission, ensuring transparency and proper leave management.

## Glossary

- **Leave_Management_System**: The e-leave management application that handles leave requests and approvals
- **User**: An employee who can submit leave requests through the system
- **Leave_Limit**: The maximum number of leave days allocated to a user for a specific period
- **Leave_Request**: A formal request submitted by a user to take time off
- **Warning_Dialog**: A modal or alert component that displays warning messages to users
- **Submit_Button**: The UI element users click to submit their leave request

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a clear warning when I try to submit a leave request that exceeds my limit, so that I understand why my request cannot be processed.

#### Acceptance Criteria

1. WHEN a User clicks the Submit_Button for a Leave_Request that would exceed their Leave_Limit, THE Leave_Management_System SHALL display a Warning_Dialog with the message "Leave limit reached"
2. WHILE the Warning_Dialog is displayed, THE Leave_Management_System SHALL prevent the Leave_Request from being submitted
3. THE Leave_Management_System SHALL calculate the total leave days including the current request before validation
4. THE Warning_Dialog SHALL include information about the user's current leave usage and remaining balance
5. THE Warning_Dialog SHALL provide a clear action to close the warning and return to the form

### Requirement 2

**User Story:** As a user, I want to understand my current leave status before submitting a request, so that I can make informed decisions about my leave planning.

#### Acceptance Criteria

1. THE Leave_Management_System SHALL display the user's current leave balance prominently on the leave request form
2. WHEN a User enters leave dates, THE Leave_Management_System SHALL dynamically calculate and display the projected leave usage
3. IF the projected usage would exceed the Leave_Limit, THE Leave_Management_System SHALL highlight this information before submission
4. THE Leave_Management_System SHALL show both used leave days and remaining leave days clearly

### Requirement 3

**User Story:** As a user, I want the system to validate my leave limits in real-time, so that I don't waste time filling out requests that cannot be approved.

#### Acceptance Criteria

1. WHEN a User selects leave dates that would exceed their Leave_Limit, THE Leave_Management_System SHALL immediately indicate this visually
2. THE Leave_Management_System SHALL disable the Submit_Button when leave limits would be exceeded
3. THE Leave_Management_System SHALL provide real-time feedback as users modify their leave request dates
4. THE Leave_Management_System SHALL re-enable the Submit_Button when the request is within acceptable limits