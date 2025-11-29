# Calendar Leave Selection System - Design Document

## Overview

The Calendar Leave Selection System enhances the existing E-Leave Management System by replacing traditional start/end date inputs with an interactive 3D calendar interface. Students select individual dates that each count as one leave day, providing granular control over leave requests while maintaining integration with the existing monthly leave limit system.

### Technology Integration

- **Frontend Enhancement**: New React components integrated with existing Three.js 3D framework
- **Backend Extension**: Enhanced API endpoints to handle calendar-based date arrays
- **Database Compatibility**: Maintains existing schema while supporting new date storage format
- **UI Consistency**: Follows established 3D light theme design patterns

## Architecture

### Enhanced System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Browser                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │           React Application (Port 3000)            │ │
│  │  ┌──────────────┐  ┌──────────────────────────┐   │ │
│  │  │ Student Panel│  │     Admin Panel          │   │ │
│  │  │   Enhanced   │  │    Enhanced              │   │ │
│  │  └──────────────┘  └──────────────────────────┘   │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │   NEW: Calendar Components (3D)              │ │ │
│  │  │   - CalendarInterface                        │ │ │
│  │  │   - DateSelector3D                           │ │ │
│  │  │   - LeaveBalanceIndicator                    │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API (Enhanced)
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js Server (Port 5000)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Enhanced API Routes                   │ │
│  │  /api/leaves (supports calendar dates)            │ │
│  │  /api/calendar/validate-dates                     │ │
│  │  /api/calendar/holidays                           │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │           Enhanced Business Logic                  │ │
│  │  Calendar Date Processing                         │ │
│  │  Multi-Month Leave Limit Calculation              │ │
│  │  Date Validation Service                          │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Calendar Data Flow

```
Student Interaction → Calendar Component → Date Selection → 
Validation → Balance Check → Summary Display → 
API Submission → Database Storage → Admin Review
```

## Components and Interfaces

### New Frontend Components

#### 1. CalendarLeaveForm.jsx
**Purpose**: Main container component replacing the traditional LeaveSubmissionForm for calendar-based requests

**Props**:
```javascript
{
  userId: string,
  userProfile: { name, rollNumber, stream },
  onSubmit: function,
  initialSelectedDates?: Date[]
}
```

**State Management**:
```javascript
{
  selectedDates: Date[],
  currentMonth: Date,
  leaveBalance: { used: number, remaining: number, limit: number },
  isLoading: boolean,
  validationErrors: string[],
  holidays: Date[]
}
```

**Key Features**:
- Fetches user's current leave balance on mount
- Manages calendar navigation state
- Handles date selection/deselection logic
- Validates selections against business rules
- Provides real-time balance updates

#### 2. Calendar3D.jsx
**Purpose**: Interactive 3D calendar grid component with month navigation

**Props**:
```javascript
{
  currentMonth: Date,
  selectedDates: Date[],
  onDateSelect: function,
  onMonthChange: function,
  disabledDates: Date[],
  holidays: Date[],
  maxFutureMonths: number
}
```

**3D Styling**:
- Each date cell as a 3D card with depth
- Hover effects: slight elevation and glow
- Selection animation: scale up with color transition
- Disabled dates: grayed out with reduced opacity
- Holiday dates: special styling with holiday indicator

**Interaction Logic**:
```javascript
// Date cell click handler
const handleDateClick = (date) => {
  if (isDateDisabled(date)) return;
  
  if (isDateSelected(date)) {
    onDateSelect(selectedDates.filter(d => !isSameDay(d, date)));
  } else {
    onDateSelect([...selectedDates, date]);
  }
};

// Date validation
const isDateDisabled = (date) => {
  return isPast(date) || 
         isSunday(date) || 
         isHoliday(date) || 
         isBeyondMaxFuture(date);
};

const isSunday = (date) => {
  return date.getDay() === 0; // 0 = Sunday
};
```

#### 3. DateSelector3D.jsx
**Purpose**: Individual date cell component with 3D styling and interactions

**Props**:
```javascript
{
  date: Date,
  isSelected: boolean,
  isDisabled: boolean,
  isHoliday: boolean,
  isToday: boolean,
  onClick: function
}
```

**3D Implementation**:
```javascript
// Three.js mesh for date cell
const DateCell = ({ date, isSelected, isDisabled }) => {
  const meshRef = useRef();
  
  // Animation on selection
  useFrame(() => {
    if (isSelected) {
      meshRef.current.scale.setScalar(1.1);
      meshRef.current.position.z = 0.2;
    } else {
      meshRef.current.scale.setScalar(1.0);
      meshRef.current.position.z = 0;
    }
  });

  return (
    <mesh ref={meshRef} onClick={() => !isDisabled && onClick(date)}>
      <boxGeometry args={[0.8, 0.8, 0.1]} />
      <meshStandardMaterial 
        color={getDateColor(isSelected, isDisabled, isHoliday)}
        transparent
        opacity={isDisabled ? 0.3 : 1.0}
      />
    </mesh>
  );
};
```

#### 4. LeaveBalanceIndicator3D.jsx
**Purpose**: Real-time display of leave balance with calendar selection impact

**Props**:
```javascript
{
  currentBalance: { 
    approved: number,    // Approved leave days
    pending: number,     // Pending leave days  
    total: number,       // Total (approved + pending)
    remaining: number,   // Remaining from limit
    limit: number        // Monthly limit (default 3)
  },
  selectedDatesCount: number,
  selectedDatesByMonth: Map<string, Date[]>
}
```

**Display Logic**:
```javascript
const calculateBalanceImpact = () => {
  const impactByMonth = new Map();
  
  selectedDatesByMonth.forEach((dates, monthKey) => {
    const monthLimit = getMonthlyLimit(monthKey);
    const usageBreakdown = getMonthUsageBreakdown(monthKey);
    const currentTotal = usageBreakdown.total; // approved + pending
    const newTotal = currentTotal + dates.length;
    
    impactByMonth.set(monthKey, {
      approved: usageBreakdown.approved,
      pending: usageBreakdown.pending,
      currentTotal: currentTotal,
      selected: dates.length,
      newTotal: newTotal,
      exceeds: newTotal > monthLimit,
      overage: Math.max(0, newTotal - monthLimit)
    });
  });
  
  return impactByMonth;
};
```

**3D Visualization**:
- Circular progress indicator with 3D depth showing approved (solid) and pending (striped pattern) sections
- Color coding: Green (safe), Yellow (warning), Red (exceeds)
- Animated transitions when selection changes
- Tooltip showing detailed breakdown: "X approved + Y pending = Z total days used"
- Clear visual distinction between approved and pending leaves

#### 5. SelectedDatesSummary.jsx
**Purpose**: Summary panel showing all selected dates with management options

**Props**:
```javascript
{
  selectedDates: Date[],
  onRemoveDate: function,
  onClearAll: function,
  groupByMonth: boolean
}
```

**Features**:
- Groups dates by month for better organization
- Individual date removal with 3D button animations
- "Clear All" functionality with confirmation
- Export selected dates to different formats
- Drag-and-drop reordering (future enhancement)

#### 6. CalendarNavigation3D.jsx
**Purpose**: Month navigation controls with 3D styling

**Props**:
```javascript
{
  currentMonth: Date,
  onMonthChange: function,
  minMonth: Date,
  maxMonth: Date
}
```

**3D Elements**:
- Previous/Next buttons as 3D arrows
- Month/Year display with depth effect
- Smooth transition animations between months
- Disabled state styling for boundary months

### Enhanced Backend Components

#### 1. Calendar Date Validation Service

```javascript
// services/calendarValidation.js
class CalendarValidationService {
  
  validateDateSelection(dates, userId) {
    const errors = [];
    
    // Check for past dates
    const pastDates = dates.filter(date => isPast(date));
    if (pastDates.length > 0) {
      errors.push(`Cannot select past dates: ${formatDates(pastDates)}`);
    }
    
    // Check for Sundays only (Monday-Saturday allowed)
    const sundayDates = dates.filter(date => date.getDay() === 0);
    if (sundayDates.length > 0) {
      errors.push(`Cannot select Sundays: ${formatDates(sundayDates)}`);
    }
    
    // Check for holidays
    const holidayDates = dates.filter(date => this.isHoliday(date));
    if (holidayDates.length > 0) {
      errors.push(`Cannot select holidays: ${formatDates(holidayDates)}`);
    }
    
    // Check monthly limits
    const monthlyImpact = this.calculateMonthlyImpact(dates, userId);
    monthlyImpact.forEach((impact, month) => {
      if (impact.exceeds) {
        errors.push(`Exceeds monthly limit for ${month} by ${impact.overage} days`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      warnings: this.generateWarnings(dates, userId)
    };
  }
  
  calculateMonthlyImpact(selectedDates, userId) {
    const datesByMonth = groupBy(selectedDates, date => format(date, 'yyyy-MM'));
    const impact = new Map();
    
    datesByMonth.forEach((dates, monthKey) => {
      const currentUsage = this.getCurrentMonthUsage(userId, monthKey);
      const newTotal = currentUsage + dates.length;
      const monthlyLimit = 3; // Could be configurable per stream
      
      impact.set(monthKey, {
        current: currentUsage,
        selected: dates.length,
        newTotal: newTotal,
        exceeds: newTotal > monthlyLimit,
        overage: Math.max(0, newTotal - monthlyLimit)
      });
    });
    
    return impact;
  }
  
  getCurrentMonthUsage(userId, monthKey) {
    // Query database for approved and pending leaves in the specified month
    const [year, month] = monthKey.split('-');
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    const leaves = db.get('leaves')
      .filter(leave => 
        leave.userId === userId &&
        (leave.status === 'approved' || leave.status === 'pending')
      )
      .value();
    
    let totalDays = 0;
    leaves.forEach(leave => {
      if (leave.requestType === 'calendar' && leave.selectedDates) {
        // Count individual dates in the month
        leave.selectedDates.forEach(dateString => {
          const date = new Date(dateString);
          if (this.isDateInRange(date, startOfMonth, endOfMonth)) {
            totalDays++;
          }
        });
      } else if (leave.requestType === 'traditional') {
        // For traditional requests, count as 1 day if in range
        const leaveDate = new Date(leave.updatedAt || leave.submittedAt);
        if (this.isDateInRange(leaveDate, startOfMonth, endOfMonth)) {
          totalDays++;
        }
      }
    });
    
    return totalDays;
  }
  
  getMonthUsageBreakdown(userId, monthKey) {
    // Get separate counts for approved and pending leaves
    const [year, month] = monthKey.split('-');
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    
    const leaves = db.get('leaves')
      .filter(leave => leave.userId === userId)
      .value();
    
    let approvedDays = 0;
    let pendingDays = 0;
    
    leaves.forEach(leave => {
      let daysInMonth = 0;
      
      if (leave.requestType === 'calendar' && leave.selectedDates) {
        leave.selectedDates.forEach(dateString => {
          const date = new Date(dateString);
          if (this.isDateInRange(date, startOfMonth, endOfMonth)) {
            daysInMonth++;
          }
        });
      } else if (leave.requestType === 'traditional') {
        const leaveDate = new Date(leave.updatedAt || leave.submittedAt);
        if (this.isDateInRange(leaveDate, startOfMonth, endOfMonth)) {
          daysInMonth = 1;
        }
      }
      
      if (leave.status === 'approved') {
        approvedDays += daysInMonth;
      } else if (leave.status === 'pending') {
        pendingDays += daysInMonth;
      }
    });
    
    return {
      approved: approvedDays,
      pending: pendingDays,
      total: approvedDays + pendingDays
    };
  }
}
```

#### 2. Holiday Management Service

```javascript
// services/holidayService.js
class HolidayService {
  
  constructor() {
    this.holidays = new Map(); // Cache for performance
    this.loadHolidays();
  }
  
  loadHolidays() {
    // Load from configuration file or database
    const holidayConfig = [
      { date: '2025-01-26', name: 'Republic Day', type: 'national' },
      { date: '2025-03-14', name: 'Holi', type: 'festival' },
      { date: '2025-08-15', name: 'Independence Day', type: 'national' },
      // Add more holidays...
    ];
    
    holidayConfig.forEach(holiday => {
      this.holidays.set(holiday.date, holiday);
    });
  }
  
  isHoliday(date) {
    const dateString = format(date, 'yyyy-MM-dd');
    return this.holidays.has(dateString);
  }
  
  getHolidaysInRange(startDate, endDate) {
    const holidays = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (this.isHoliday(current)) {
        holidays.push({
          date: new Date(current),
          ...this.holidays.get(format(current, 'yyyy-MM-dd'))
        });
      }
      current.setDate(current.getDate() + 1);
    }
    
    return holidays;
  }
}
```

### Enhanced API Endpoints

#### 1. Calendar Leave Submission

```javascript
// POST /api/leaves/calendar
{
  "userId": "uuid",
  "selectedDates": [
    "2025-01-15",
    "2025-01-17",
    "2025-01-22"
  ],
  "reason": "Personal work",
  "requestType": "calendar"
}

// Response
{
  "success": true,
  "leaveId": "uuid",
  "message": "Calendar leave request submitted successfully",
  "selectedDatesCount": 3,
  "monthlyImpact": {
    "2025-01": {
      "previousUsage": 1,
      "newDates": 3,
      "totalAfterApproval": 4,
      "exceedsLimit": true,
      "overage": 1
    }
  }
}
```

#### 2. Date Validation Endpoint

```javascript
// POST /api/calendar/validate-dates
{
  "userId": "uuid",
  "selectedDates": ["2025-01-15", "2025-01-17"]
}

// Response
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "This request will use 2 of your 3 remaining leave days for January"
  ],
  "monthlyImpact": {
    "2025-01": {
      "current": 1,
      "selected": 2,
      "newTotal": 3,
      "exceeds": false
    }
  }
}
```

#### 3. Holiday Calendar Endpoint

```javascript
// GET /api/calendar/holidays?startDate=2025-01-01&endDate=2025-12-31
{
  "holidays": [
    {
      "date": "2025-01-26",
      "name": "Republic Day",
      "type": "national"
    },
    {
      "date": "2025-03-14",
      "name": "Holi",
      "type": "festival"
    }
  ]
}
```

#### 4. Monthly Leave Limit Endpoint (Enhanced)

**CRITICAL FIX**: This endpoint must count individual days from selectedDates array, not count submissions.

```javascript
// GET /api/leaves/monthly-limit/:userId
// Response
{
  "success": true,
  "data": {
    "monthlyLimit": 3,
    "approvedThisMonth": 3,  // ← Total DAYS, not submission count
    "remainingLeaves": 0,
    "currentMonth": "January",
    "currentYear": 2025
  }
}
```

**Implementation Logic**:
```javascript
// WRONG (current implementation - counts submissions):
const approvedThisMonth = userLeaves.filter(leave => {
  if (leave.status !== 'approved') return false;
  // ...
}).length;  // ← Counts submissions, not days!

// CORRECT (should count individual days):
let approvedDaysThisMonth = 0;
userLeaves.forEach(leave => {
  if (leave.status !== 'approved') return;
  
  const updatedDate = new Date(leave.updatedAt);
  if (updatedDate.getMonth() !== currentMonth || 
      updatedDate.getFullYear() !== currentYear) return;
  
  // For calendar requests, count each selected date
  if (leave.requestType === 'calendar' && leave.selectedDates) {
    approvedDaysThisMonth += leave.selectedDates.length;
  } else {
    // For traditional requests, count as 1 day
    approvedDaysThisMonth += 1;
  }
});
```

## Data Models

### Enhanced Leave Request Model

```javascript
{
  id: string,              // UUID
  userId: string,          // Reference to User
  userName: string,
  rollNumber: string,
  stream: string,
  
  // Enhanced date handling
  requestType: 'traditional' | 'calendar',
  
  // Traditional format (backward compatibility)
  startDate: string,       // ISO date format (for traditional requests)
  endDate: string,         // ISO date format (for traditional requests)
  
  // Calendar format (new)
  selectedDates: string[], // Array of ISO date strings (for calendar requests)
  selectedDatesCount: number, // Count of selected dates
  
  reason: string,
  status: 'pending' | 'approved' | 'rejected',
  submittedAt: timestamp,
  updatedAt: timestamp,
  
  // Enhanced tracking
  monthlyImpact: {         // Impact on monthly limits
    [monthKey]: {
      datesInMonth: number,
      monthlyLimitBefore: number,
      monthlyLimitAfter: number
    }
  }
}
```

### Calendar Configuration Model

```javascript
{
  id: string,
  configType: 'holiday' | 'limit' | 'validation',
  
  // Holiday configuration
  holidays: [
    {
      date: string,        // ISO date
      name: string,
      type: 'national' | 'festival' | 'college',
      recurring: boolean   // Annual recurrence
    }
  ],
  
  // Limit configuration
  limits: {
    monthlyLimit: number,  // Default 3
    maxFutureMonths: number, // Default 6
    streamSpecificLimits: {
      [stream]: number
    }
  },
  
  // Validation rules
  validationRules: {
    allowSundays: boolean,     // Default false
    allowPastDates: boolean,   // Default false
    allowHolidays: boolean,    // Default false
    maxDatesPerRequest: number // Default unlimited
  }
}
```

## 3D Design Specifications

### Calendar 3D Elements

#### 1. Calendar Grid Layout
```css
.calendar-3d-container {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.calendar-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  transform: rotateX(5deg);
  transition: transform 0.3s ease;
}

.calendar-month-grid:hover {
  transform: rotateX(0deg);
}
```

#### 2. Date Cell 3D Styling
```css
.date-cell-3d {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(145deg, #ffffff, #f1f5f9);
  box-shadow: 
    5px 5px 10px rgba(0,0,0,0.1),
    -5px -5px 10px rgba(255,255,255,0.8);
  transform: translateZ(0);
  transition: all 0.2s ease;
  cursor: pointer;
}

.date-cell-3d:hover {
  transform: translateZ(10px) scale(1.05);
  box-shadow: 
    8px 8px 15px rgba(0,0,0,0.15),
    -8px -8px 15px rgba(255,255,255,0.9);
}

.date-cell-3d.selected {
  background: linear-gradient(145deg, #6366f1, #4f46e5);
  color: white;
  transform: translateZ(15px) scale(1.1);
  box-shadow: 
    10px 10px 20px rgba(99,102,241,0.3),
    -5px -5px 10px rgba(255,255,255,0.8);
}

.date-cell-3d.disabled {
  background: linear-gradient(145deg, #e2e8f0, #cbd5e1);
  color: #94a3b8;
  cursor: not-allowed;
  transform: translateZ(-5px);
  opacity: 0.6;
}
```

#### 3. Leave Balance Indicator 3D
```css
.balance-indicator-3d {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #10b981 0deg,
    #10b981 var(--used-angle),
    #e5e7eb var(--used-angle),
    #e5e7eb 360deg
  );
  position: relative;
  transform-style: preserve-3d;
}

.balance-indicator-3d::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  bottom: 10px;
  background: #ffffff;
  border-radius: 50%;
  transform: translateZ(5px);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
}

.balance-text-3d {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateZ(10px);
  font-weight: bold;
  text-align: center;
}
```

### Animation Specifications

#### 1. Date Selection Animation
```javascript
// Three.js animation for date selection
const animateSelection = (mesh, isSelected) => {
  const targetScale = isSelected ? 1.1 : 1.0;
  const targetZ = isSelected ? 0.2 : 0;
  const targetColor = isSelected ? 0x6366f1 : 0xffffff;
  
  gsap.to(mesh.scale, {
    x: targetScale,
    y: targetScale,
    z: targetScale,
    duration: 0.3,
    ease: "back.out(1.7)"
  });
  
  gsap.to(mesh.position, {
    z: targetZ,
    duration: 0.3,
    ease: "power2.out"
  });
  
  gsap.to(mesh.material.color, {
    r: ((targetColor >> 16) & 255) / 255,
    g: ((targetColor >> 8) & 255) / 255,
    b: (targetColor & 255) / 255,
    duration: 0.3
  });
};
```

#### 2. Month Transition Animation
```javascript
// Smooth month transition with 3D effect
const animateMonthTransition = (direction) => {
  const calendar = calendarRef.current;
  
  // Slide out current month
  gsap.to(calendar, {
    x: direction === 'next' ? -100 : 100,
    rotationY: direction === 'next' ? -15 : 15,
    opacity: 0,
    duration: 0.3,
    ease: "power2.in",
    onComplete: () => {
      // Update month data
      updateCalendarMonth();
      
      // Slide in new month
      gsap.fromTo(calendar, 
        { 
          x: direction === 'next' ? 100 : -100,
          rotationY: direction === 'next' ? 15 : -15,
          opacity: 0
        },
        {
          x: 0,
          rotationY: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  });
};
```

## Error Handling

### Frontend Error Handling

#### 1. Date Selection Errors
```javascript
const handleDateSelectionError = (error) => {
  switch (error.type) {
    case 'PAST_DATE':
      showTooltip('Cannot select past dates', 'warning');
      break;
    case 'SUNDAY':
      showTooltip('Sundays are not valid leave days', 'info');
      break;
    case 'HOLIDAY':
      showTooltip(`${error.holidayName} is a holiday`, 'info');
      break;
    case 'LIMIT_EXCEEDED':
      showModal({
        title: 'Monthly Limit Exceeded',
        message: `This selection would exceed your monthly limit by ${error.overage} days. You can still submit, but admin approval may be required.`,
        actions: ['Continue Anyway', 'Cancel']
      });
      break;
    default:
      showTooltip('Invalid date selection', 'error');
  }
};
```

#### 2. Calendar Loading Errors
```javascript
const CalendarErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (error) => {
      console.error('Calendar Error:', error);
      setHasError(true);
    };
    
    window.addEventListener('unhandledrejection', handleError);
    return () => window.removeEventListener('unhandledrejection', handleError);
  }, []);
  
  if (hasError) {
    return (
      <div className="calendar-error-fallback">
        <h3>Calendar Temporarily Unavailable</h3>
        <p>Please use the traditional date selection form.</p>
        <button onClick={() => setHasError(false)}>Retry Calendar</button>
        <button onClick={() => switchToTraditionalForm()}>Use Traditional Form</button>
      </div>
    );
  }
  
  return children;
};
```

### Backend Error Handling

#### 1. Date Validation Errors
```javascript
// Comprehensive date validation with detailed error responses
const validateCalendarDates = (req, res, next) => {
  const { selectedDates, userId } = req.body;
  
  try {
    const validation = calendarValidationService.validateDateSelection(selectedDates, userId);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE_SELECTION',
          message: 'One or more selected dates are invalid',
          details: {
            errors: validation.errors,
            warnings: validation.warnings,
            invalidDates: validation.invalidDates
          }
        }
      });
    }
    
    // Attach validation results to request for use in route handler
    req.dateValidation = validation;
    next();
    
  } catch (error) {
    console.error('Date validation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_SERVICE_ERROR',
        message: 'Unable to validate selected dates'
      }
    });
  }
};
```

## Testing Strategy

### Frontend Testing

#### 1. Calendar Component Testing
```javascript
// Calendar3D.test.jsx
describe('Calendar3D Component', () => {
  test('renders current month correctly', () => {
    render(<Calendar3D currentMonth={new Date(2025, 0, 1)} />);
    expect(screen.getByText('January 2025')).toBeInTheDocument();
  });
  
  test('handles date selection', () => {
    const onDateSelect = jest.fn();
    render(<Calendar3D onDateSelect={onDateSelect} />);
    
    const dateCell = screen.getByText('15');
    fireEvent.click(dateCell);
    
    expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });
  
  test('disables past dates', () => {
    render(<Calendar3D currentMonth={new Date()} />);
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const pastDateCell = screen.getByText(yesterday.getDate().toString());
    expect(pastDateCell).toHaveClass('disabled');
  });
  
  test('shows holiday indicators', () => {
    const holidays = [new Date(2025, 0, 26)]; // Republic Day
    render(<Calendar3D holidays={holidays} />);
    
    const holidayCell = screen.getByText('26');
    expect(holidayCell).toHaveClass('holiday');
  });
});
```

#### 2. Leave Balance Testing
```javascript
// LeaveBalanceIndicator3D.test.jsx
describe('LeaveBalanceIndicator3D', () => {
  test('calculates balance correctly', () => {
    const balance = { used: 2, remaining: 1, limit: 3 };
    render(<LeaveBalanceIndicator3D currentBalance={balance} />);
    
    expect(screen.getByText('1 leave remaining')).toBeInTheDocument();
  });
  
  test('shows warning when limit exceeded', () => {
    const balance = { used: 3, remaining: 0, limit: 3 };
    render(<LeaveBalanceIndicator3D 
      currentBalance={balance} 
      selectedDatesCount={2} 
    />);
    
    expect(screen.getByText(/exceeds limit/i)).toBeInTheDocument();
  });
});
```

### Backend Testing

#### 1. Calendar API Testing
```javascript
// calendar.test.js
describe('Calendar API Endpoints', () => {
  test('POST /api/leaves/calendar - valid submission', async () => {
    const response = await request(app)
      .post('/api/leaves/calendar')
      .send({
        userId: 'test-user-id',
        selectedDates: ['2025-01-15', '2025-01-17'],
        reason: 'Personal work'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.selectedDatesCount).toBe(2);
  });
  
  test('POST /api/calendar/validate-dates - Sunday validation', async () => {
    const response = await request(app)
      .post('/api/calendar/validate-dates')
      .send({
        userId: 'test-user-id',
        selectedDates: ['2025-01-19'] // Sunday
      });
    
    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Cannot select Sundays');
  });
});
```

#### 2. Date Validation Service Testing
```javascript
// calendarValidation.test.js
describe('CalendarValidationService', () => {
  test('validates past dates correctly', () => {
    const service = new CalendarValidationService();
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const result = service.validateDateSelection([pastDate], 'user-id');
    
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(expect.stringMatching(/past dates/i));
  });
  
  test('calculates monthly impact correctly', () => {
    const service = new CalendarValidationService();
    const dates = [
      new Date(2025, 0, 15),
      new Date(2025, 0, 17),
      new Date(2025, 1, 5)
    ];
    
    const impact = service.calculateMonthlyImpact(dates, 'user-id');
    
    expect(impact.get('2025-01').selected).toBe(2);
    expect(impact.get('2025-02').selected).toBe(1);
  });
});
```

## Performance Considerations

### Frontend Optimization

#### 1. Calendar Rendering Optimization
```javascript
// Memoized calendar cells to prevent unnecessary re-renders
const DateCell3D = React.memo(({ date, isSelected, isDisabled, onClick }) => {
  const meshRef = useRef();
  
  // Only re-render when props actually change
  return (
    <mesh ref={meshRef} onClick={() => !isDisabled && onClick(date)}>
      <boxGeometry args={[0.8, 0.8, 0.1]} />
      <meshStandardMaterial 
        color={getDateColor(isSelected, isDisabled)}
      />
    </mesh>
  );
}, (prevProps, nextProps) => {
  return prevProps.isSelected === nextProps.isSelected &&
         prevProps.isDisabled === nextProps.isDisabled &&
         prevProps.date.getTime() === nextProps.date.getTime();
});
```

#### 2. 3D Scene Optimization
```javascript
// Efficient 3D scene management
const Calendar3DScene = () => {
  const [camera, setCamera] = useState();
  
  // Use instanced meshes for repeated date cells
  const dateInstances = useMemo(() => {
    const instances = [];
    for (let i = 0; i < 42; i++) { // Max calendar cells
      instances.push({
        position: [x, y, 0],
        scale: [1, 1, 1],
        color: defaultColor
      });
    }
    return instances;
  }, []);
  
  // Frustum culling for performance
  useFrame(() => {
    if (camera) {
      // Only render visible calendar cells
      dateInstances.forEach((instance, index) => {
        instance.visible = isInViewport(instance.position, camera);
      });
    }
  });
};
```

### Backend Optimization

#### 1. Database Query Optimization
```javascript
// Efficient leave count queries with indexing
const getMonthlyLeaveCount = async (userId, year, month) => {
  // Use database indexes on userId, status, and date fields
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  return db.get('leaves')
    .filter(leave => 
      leave.userId === userId &&
      leave.status === 'approved' &&
      new Date(leave.updatedAt) >= startDate &&
      new Date(leave.updatedAt) <= endDate
    )
    .size()
    .value();
};

// Cache frequently accessed data
const leaveCountCache = new Map();
const getCachedLeaveCount = (userId, monthKey) => {
  const cacheKey = `${userId}-${monthKey}`;
  
  if (leaveCountCache.has(cacheKey)) {
    return leaveCountCache.get(cacheKey);
  }
  
  const count = getMonthlyLeaveCount(userId, ...monthKey.split('-'));
  leaveCountCache.set(cacheKey, count);
  
  // Cache expires after 5 minutes
  setTimeout(() => leaveCountCache.delete(cacheKey), 5 * 60 * 1000);
  
  return count;
};
```

#### 2. Holiday Data Caching
```javascript
// Efficient holiday management with caching
class HolidayService {
  constructor() {
    this.holidayCache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }
  
  async getHolidaysForYear(year) {
    const cacheKey = `holidays-${year}`;
    
    if (this.holidayCache.has(cacheKey)) {
      const cached = this.holidayCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }
    
    const holidays = await this.loadHolidaysFromSource(year);
    this.holidayCache.set(cacheKey, {
      data: holidays,
      timestamp: Date.now()
    });
    
    return holidays;
  }
}
```

## Security Considerations

### Input Validation
- Validate all date inputs on both frontend and backend
- Sanitize date strings to prevent injection attacks
- Implement rate limiting on calendar API endpoints
- Validate user permissions before processing calendar requests

### Data Protection
- Ensure calendar selections are associated with authenticated users only
- Implement CSRF protection for calendar form submissions
- Validate date ranges to prevent abuse (e.g., selecting thousands of dates)
- Log calendar-related actions for audit purposes

## Integration with Existing System

### Backward Compatibility
- Maintain existing leave request format for traditional submissions
- Support both calendar and traditional requests in admin panel
- Ensure existing API endpoints continue to work
- Provide migration path for existing leave data

### Database Migration
```javascript
// Migration script to add calendar support
const migrateLeaveRequests = () => {
  const leaves = db.get('leaves').value();
  
  leaves.forEach(leave => {
    if (!leave.requestType) {
      // Convert traditional requests to new format
      leave.requestType = 'traditional';
      leave.selectedDates = generateDateRange(leave.startDate, leave.endDate);
      leave.selectedDatesCount = leave.selectedDates.length;
    }
  });
  
  db.write();
};
```

This comprehensive design provides a robust foundation for implementing the calendar-based leave selection system while maintaining seamless integration with your existing e-leave management system.