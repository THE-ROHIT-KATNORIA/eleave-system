# E-Leave Management System - User Guide

Welcome to the E-Leave Management System! This guide will help you navigate and use all features of the application.

## Table of Contents

- [Getting Started](#getting-started)
- [Student Guide](#student-guide)
- [Administrator Guide](#administrator-guide)
- [Features Overview](#features-overview)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

## Getting Started

### System Requirements

- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet Connection**: Required for accessing the application
- **Screen Resolution**: Minimum 320px width (mobile-friendly)
- **WebGL Support**: Required for 3D graphics (most modern browsers support this)

### Accessing the Application

1. Open your web browser
2. Navigate to the application URL (e.g., `http://localhost:3000` for development)
3. You'll see the landing page with login and registration forms

### First Time Users

If you're a new user, you'll need to register an account:

1. Click on the **Register** section on the landing page
2. Fill in your details
3. Choose your role (Student or Administrator)
4. Click "Register"
5. After successful registration, login with your credentials

---

## Student Guide

### 1. Registration

**Step-by-Step:**

1. On the landing page, locate the **Register** form
2. Fill in the following information:
   - **Name**: Your full name
   - **Email**: Your college email address
   - **Password**: Choose a secure password (minimum 6 characters)
   - **Role**: Select "Student"
   - **Stream**: Choose your academic program:
     - BCA (Bachelor of Computer Applications)
     - BA (Bachelor of Arts)
     - PGDCA (Post Graduate Diploma in Computer Applications)
     - BSC (Bachelor of Science)
     - BCOM (Bachelor of Commerce)
3. Click the **Register** button
4. Wait for the success message
5. You can now login with your credentials

**Tips:**
- Use your official college email
- Remember your password (write it down securely)
- Select the correct stream as it cannot be changed later

### 2. Login

**Step-by-Step:**

1. On the landing page, locate the **Login** form
2. Enter your email address
3. Enter your password
4. Click the **Login** button
5. You'll be redirected to the Student Dashboard

**Troubleshooting:**
- If login fails, check your email and password
- Ensure Caps Lock is off
- Contact your administrator if you've forgotten your password

### 3. Student Dashboard

After logging in, you'll see your dashboard with:

#### Statistics Overview
- **Total Leaves**: Total number of leave requests you've submitted
- **Pending**: Leaves awaiting admin approval
- **Approved**: Leaves that have been approved
- **Rejected**: Leaves that have been rejected

#### Navigation Options
- **Submit New Leave**: Create a new leave request
- **View Leave Status**: See all your submitted leaves

#### 3D Elements
- Interactive 3D cards that respond to mouse movement
- Smooth animations and transitions
- Engaging visual experience

### 4. Submitting a Leave Request

**Step-by-Step:**

1. From the dashboard, click **"Submit New Leave"** or navigate to the submission form
2. Fill in the leave request form:
   
   **Stream**
   - Select your academic stream from the dropdown
   - This should match your registered stream
   
   **Start Date**
   - Click on the date picker
   - Select the first day of your leave
   - Cannot select past dates
   
   **End Date**
   - Click on the date picker
   - Select the last day of your leave
   - Must be on or after the start date
   
   **Reason**
   - Enter a clear, detailed reason for your leave
   - Examples:
     - "Medical appointment with doctor"
     - "Family emergency"
     - "Attending cousin's wedding"
     - "Personal health issues"

3. Review your information
4. Click **"Submit Leave Request"**
5. Wait for the confirmation message
6. Your leave is now submitted with "Pending" status

**Important Notes:**
- All fields are required
- End date must be on or after start date
- Be specific and honest in your reason
- You cannot edit a leave after submission
- Admins will review your request

**Best Practices:**
- Submit leaves well in advance
- Provide detailed reasons
- Check your leave status regularly
- Plan your leaves according to college calendar

### 5. Viewing Leave Status

**Step-by-Step:**

1. From the dashboard, click **"View Leave Status"**
2. You'll see a list of all your submitted leaves

#### Understanding Leave Cards

Each leave request is displayed as a card showing:

**Leave Information:**
- **Dates**: Start date to end date
- **Reason**: Your stated reason for leave
- **Stream**: Your academic stream
- **Status**: Current status with color coding:
  - 🟡 **Pending** (Yellow): Awaiting admin review
  - 🟢 **Approved** (Green): Leave has been approved
  - 🔴 **Rejected** (Red): Leave has been rejected
- **Submitted**: Date and time you submitted the request

**Visual Features:**
- 3D card effects with hover animations
- Color-coded status badges
- Smooth transitions
- Easy-to-read layout

#### Filtering and Searching

- Use the search box to find specific leaves
- Filter by status (All, Pending, Approved, Rejected)
- Sort by date (newest first or oldest first)

**Tips:**
- Check your status regularly
- Pending leaves typically take 1-3 business days
- Contact admin if a leave is pending for too long
- Keep track of approved leaves for your records

### 6. Logging Out

**Step-by-Step:**

1. Click on your name in the navigation bar (top right)
2. Click **"Logout"**
3. You'll be redirected to the landing page
4. Your session is now ended

**Security Tips:**
- Always logout when using shared computers
- Don't share your password
- Close the browser after logging out on public computers

---

## Administrator Guide

### 1. Login

**Step-by-Step:**

1. On the landing page, locate the **Login** form
2. Enter your admin email address
3. Enter your admin password
4. Click the **Login** button
5. You'll be redirected to the Admin Dashboard

**Default Admin Credentials (Development):**
- Email: `admin@college.edu`
- Password: `admin123`

**Security Note:** Change the default password immediately in production.

### 2. Admin Dashboard

After logging in, you'll see the admin dashboard with:

#### Statistics Overview
- **Total Leaves**: All leave requests in the system
- **Pending**: Leaves awaiting your review
- **Approved**: Leaves you've approved
- **Rejected**: Leaves you've rejected

#### Quick Actions
- **View by Stream**: Navigate to stream-specific sections
- **Statistics**: View detailed analytics
- **Manage Requests**: Access leave management interface

#### 3D Visualizations
- Interactive 3D elements
- Data visualization components
- Engaging admin interface

### 3. Viewing Leave Requests

**Step-by-Step:**

1. From the dashboard, click **"View by Stream"**
2. You'll see tabs for each academic stream:
   - BCA
   - BA
   - PGDCA
   - BSC
   - BCOM

3. Click on a stream tab to view leaves for that stream
4. Each leave is displayed as a card with full details

#### Understanding Leave Request Cards

Each card shows:

**Student Information:**
- Student name
- Academic stream
- Email (if available)

**Leave Details:**
- Start date and end date
- Number of days
- Reason for leave
- Submission date and time

**Current Status:**
- Pending (awaiting action)
- Approved (already approved)
- Rejected (already rejected)

**Available Actions:**
- Approve button (green)
- Reject button (red)
- Delete button (gray)

### 4. Managing Leave Requests

#### Approving a Leave

**Step-by-Step:**

1. Navigate to the stream section
2. Find the leave request to approve
3. Review the details:
   - Check the dates
   - Read the reason
   - Verify student information
4. Click the **"Approve"** button
5. The status updates immediately to "Approved"
6. The student can now see the approved status

**When to Approve:**
- Valid reason provided
- Dates are reasonable
- No conflicts with important events
- Student has good attendance record

#### Rejecting a Leave

**Step-by-Step:**

1. Navigate to the stream section
2. Find the leave request to reject
3. Review the details carefully
4. Click the **"Reject"** button
5. The status updates immediately to "Rejected"
6. The student can now see the rejected status

**When to Reject:**
- Insufficient or invalid reason
- Dates conflict with exams or important events
- Student has poor attendance
- Leave duration is excessive

**Best Practice:** Consider communicating with the student about why their leave was rejected.

#### Deleting a Leave Request

**Step-by-Step:**

1. Navigate to the stream section
2. Find the leave request to delete
3. Click the **"Delete"** button
4. Confirm the deletion (if prompted)
5. The leave is permanently removed from the system

**When to Delete:**
- Duplicate submissions
- Test entries
- Requests submitted in error
- Old/archived requests

**Warning:** Deletion is permanent and cannot be undone.

### 5. Filtering and Searching

#### By Stream
- Use the stream tabs to view leaves for specific programs
- Each stream shows only relevant leaves
- Statistics update based on selected stream

#### By Status
- Filter to show only pending leaves
- View approved or rejected leaves
- See all leaves together

#### Search Function
- Search by student name
- Search by date range
- Search by reason keywords

### 6. Viewing Statistics

**Step-by-Step:**

1. From the dashboard, view the statistics cards
2. Click on individual stats for detailed breakdown
3. Use the stream filter to see stream-specific statistics

**Available Statistics:**
- Total number of leaves
- Pending leaves count
- Approved leaves count
- Rejected leaves count
- Breakdown by stream
- Trends over time (if available)

**Using Statistics:**
- Identify patterns in leave requests
- Monitor pending requests
- Track approval/rejection rates
- Plan resource allocation

### 7. Best Practices for Administrators

#### Review Process
1. Check pending leaves daily
2. Respond to requests within 1-3 business days
3. Be consistent in decision-making
4. Document reasons for rejections (if system allows)

#### Communication
1. Inform students of decisions promptly
2. Be available for questions
3. Maintain professional communication
4. Provide clear guidelines for leave requests

#### Record Keeping
1. Regularly review statistics
2. Monitor trends
3. Keep track of frequent requesters
4. Archive old requests periodically

#### Security
1. Logout after each session
2. Don't share admin credentials
3. Use strong passwords
4. Report suspicious activity

---

## Features Overview

### 3D Interface

The application features an engaging 3D interface powered by Three.js:

**Landing Page:**
- Floating geometric shapes
- Interactive elements that respond to mouse movement
- Smooth animations and transitions
- Gradient background with depth

**Dashboard:**
- 3D card components
- Hover effects with depth
- Animated statistics
- Interactive navigation elements

**Performance:**
- Optimized for smooth 60 FPS
- Works on mobile devices
- Graceful fallback if WebGL is unavailable
- Responsive to screen size

### Responsive Design

The application works on all devices:

**Mobile (320px - 480px):**
- Single column layout
- Touch-friendly buttons
- Optimized 3D elements
- Easy navigation

**Tablet (481px - 768px):**
- Two-column layout
- Balanced design
- Full 3D effects
- Comfortable viewing

**Desktop (769px+):**
- Multi-column layout
- Full feature set
- Enhanced 3D effects
- Optimal user experience

### Light Theme

Consistent light theme throughout:

**Colors:**
- Primary: Indigo (#6366f1)
- Secondary: Purple (#8b5cf6)
- Background: Light gray (#f8fafc)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)

**Design Elements:**
- Clean, modern interface
- High contrast for readability
- Consistent spacing
- Professional appearance

---

## Troubleshooting

### Common Issues

#### Cannot Login

**Problem:** Login button doesn't work or shows error

**Solutions:**
1. Check your email and password
2. Ensure Caps Lock is off
3. Clear browser cache and cookies
4. Try a different browser
5. Contact administrator

#### 3D Elements Not Showing

**Problem:** 3D graphics don't render

**Solutions:**
1. Check if your browser supports WebGL
2. Update your graphics drivers
3. Try a different browser
4. Disable browser extensions
5. Check browser console for errors

#### Leave Submission Fails

**Problem:** Cannot submit leave request

**Solutions:**
1. Check all required fields are filled
2. Ensure end date is after start date
3. Verify you're logged in
4. Check internet connection
5. Try refreshing the page

#### Page Loads Slowly

**Problem:** Application takes too long to load

**Solutions:**
1. Check your internet connection
2. Clear browser cache
3. Close unnecessary browser tabs
4. Disable browser extensions
5. Try a different network

#### Cannot See Submitted Leaves

**Problem:** Leave status page is empty

**Solutions:**
1. Ensure you've submitted leaves
2. Check if you're logged in
3. Refresh the page
4. Clear browser cache
5. Contact administrator

### Browser Compatibility

**Supported Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Not Supported:**
- Internet Explorer
- Very old browser versions

### Getting Help

If you encounter issues:

1. **Check this guide** for solutions
2. **Contact your administrator** for account issues
3. **Report bugs** to the development team
4. **Check system status** for outages

---

## FAQ

### General Questions

**Q: Is my data secure?**
A: Yes, passwords are encrypted, and the system uses secure authentication.

**Q: Can I use this on my phone?**
A: Yes, the application is fully responsive and works on mobile devices.

**Q: Do I need to install anything?**
A: No, it's a web application that runs in your browser.

### Student Questions

**Q: How long does it take for leave approval?**
A: Typically 1-3 business days, depending on admin availability.

**Q: Can I edit a submitted leave?**
A: No, you cannot edit after submission. Contact your administrator if changes are needed.

**Q: Can I cancel a leave request?**
A: No, but you can ask your administrator to delete it.

**Q: How many leaves can I submit?**
A: There's no limit, but submit only genuine requests.

**Q: Will I get notified when my leave is approved?**
A: Currently, you need to check the status page. Email notifications may be added in future.

### Administrator Questions

**Q: Can I undo an approval or rejection?**
A: Yes, you can change the status by clicking the appropriate button again.

**Q: Can I see deleted leaves?**
A: No, deletion is permanent.

**Q: How do I export leave data?**
A: This feature may be added in future updates.

**Q: Can I add more streams?**
A: Contact the development team to add new streams.

**Q: How do I reset a student's password?**
A: This feature is not currently available. Students must remember their passwords.

---

## Tips for Best Experience

### For Students

1. **Submit leaves in advance** - Don't wait until the last minute
2. **Be specific in reasons** - Clear reasons help admins make decisions
3. **Check status regularly** - Monitor your pending requests
4. **Keep records** - Take screenshots of approved leaves
5. **Plan ahead** - Check college calendar before requesting leaves

### For Administrators

1. **Review daily** - Check pending requests every day
2. **Be consistent** - Apply the same standards to all students
3. **Respond quickly** - Students appreciate timely responses
4. **Use filters** - Stream filters help manage large numbers of requests
5. **Monitor statistics** - Track trends and patterns

### For Everyone

1. **Use a modern browser** - For best performance and security
2. **Logout when done** - Especially on shared computers
3. **Keep credentials secure** - Don't share passwords
4. **Report issues** - Help improve the system by reporting bugs
5. **Provide feedback** - Suggestions help make the system better

---

## Keyboard Shortcuts

- **Tab**: Navigate between form fields
- **Enter**: Submit forms
- **Esc**: Close modals (if applicable)
- **Ctrl/Cmd + R**: Refresh page

---

## Accessibility

The application is designed to be accessible:

- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Readers**: Compatible with screen readers
- **High Contrast**: Good color contrast for readability
- **Focus Indicators**: Clear focus states for navigation
- **Semantic HTML**: Proper structure for assistive technologies

---

## Contact and Support

For assistance:

- **Technical Issues**: Contact IT support
- **Account Problems**: Contact your administrator
- **Feature Requests**: Submit to development team
- **Bug Reports**: Report via issue tracker

---

**Thank you for using the E-Leave Management System!**

*Last Updated: November 15, 2025*
