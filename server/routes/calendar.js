import express from 'express';
import { format, startOfYear, endOfYear } from 'date-fns';

const router = express.Router();

// Holiday data storage (in production, this would be in a database)
let holidays = new Map();

// Initialize default holidays
const initializeDefaultHolidays = () => {
  const currentYear = new Date().getFullYear();
  
  const defaultHolidays = [
    {
      id: 'republic-day',
      date: new Date(currentYear, 0, 26),
      name: 'Republic Day',
      type: 'national',
      recurring: true
    },
    {
      id: 'independence-day',
      date: new Date(currentYear, 7, 15),
      name: 'Independence Day',
      type: 'national',
      recurring: true
    },
    {
      id: 'gandhi-jayanti',
      date: new Date(currentYear, 9, 2),
      name: 'Gandhi Jayanti',
      type: 'national',
      recurring: true
    },
    {
      id: 'holi',
      date: new Date(currentYear, 2, 14),
      name: 'Holi',
      type: 'festival',
      recurring: false
    },
    {
      id: 'diwali',
      date: new Date(currentYear, 10, 12),
      name: 'Diwali',
      type: 'festival',
      recurring: false
    },
    {
      id: 'christmas',
      date: new Date(currentYear, 11, 25),
      name: 'Christmas',
      type: 'college',
      recurring: true
    },
    {
      id: 'new-year',
      date: new Date(currentYear, 0, 1),
      name: 'New Year',
      type: 'college',
      recurring: true
    }
  ];

  // Add next year's recurring holidays
  const nextYear = currentYear + 1;
  const recurringHolidays = defaultHolidays
    .filter(holiday => holiday.recurring)
    .map(holiday => ({
      ...holiday,
      id: `${holiday.id}-${nextYear}`,
      date: new Date(nextYear, holiday.date.getMonth(), holiday.date.getDate())
    }));

  [...defaultHolidays, ...recurringHolidays].forEach(holiday => {
    const dateKey = format(holiday.date, 'yyyy-MM-dd');
    holidays.set(dateKey, holiday);
  });
};

// Initialize holidays on startup
initializeDefaultHolidays();

// GET /api/calendar/holidays - Get holidays for date range
router.get('/holidays', (req, res) => {
  try {
    const { startDate, endDate, year, month, type } = req.query;
    
    let filteredHolidays = Array.from(holidays.values());

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      filteredHolidays = filteredHolidays.filter(holiday => 
        holiday.date >= start && holiday.date <= end
      );
    }

    // Filter by year
    if (year) {
      const yearNum = parseInt(year);
      filteredHolidays = filteredHolidays.filter(holiday => 
        holiday.date.getFullYear() === yearNum
      );
    }

    // Filter by month (0-11)
    if (month !== undefined) {
      const monthNum = parseInt(month);
      filteredHolidays = filteredHolidays.filter(holiday => 
        holiday.date.getMonth() === monthNum
      );
    }

    // Filter by type
    if (type) {
      filteredHolidays = filteredHolidays.filter(holiday => 
        holiday.type === type
      );
    }

    // Sort by date
    filteredHolidays.sort((a, b) => a.date - b.date);

    // Format dates for response
    const formattedHolidays = filteredHolidays.map(holiday => ({
      id: holiday.id,
      date: format(holiday.date, 'yyyy-MM-dd'),
      name: holiday.name,
      type: holiday.type,
      recurring: holiday.recurring
    }));

    res.json({
      success: true,
      holidays: formattedHolidays,
      count: formattedHolidays.length
    });

  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HOLIDAY_FETCH_ERROR',
        message: 'Failed to fetch holidays'
      }
    });
  }
});

// POST /api/calendar/validate-dates - Validate selected dates
router.post('/validate-dates', (req, res) => {
  try {
    const { selectedDates, userId } = req.body;

    if (!selectedDates || !Array.isArray(selectedDates)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'selectedDates must be an array'
        }
      });
    }

    const errors = [];
    const warnings = [];
    const validDates = [];
    const invalidDates = [];

    selectedDates.forEach(dateString => {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        errors.push(`Invalid date format: ${dateString}`);
        invalidDates.push(dateString);
        return;
      }

      // Check if date is in the past
      if (date < today) {
        errors.push(`Cannot select past date: ${format(date, 'yyyy-MM-dd')}`);
        invalidDates.push(dateString);
        return;
      }

      // Check if date is Sunday (day 0)
      if (date.getDay() === 0) {
        errors.push(`Cannot select Sunday: ${format(date, 'yyyy-MM-dd')}`);
        invalidDates.push(dateString);
        return;
      }

      // Check if date is a holiday
      const dateKey = format(date, 'yyyy-MM-dd');
      if (holidays.has(dateKey)) {
        const holiday = holidays.get(dateKey);
        errors.push(`Cannot select holiday (${holiday.name}): ${format(date, 'yyyy-MM-dd')}`);
        invalidDates.push(dateString);
        return;
      }

      // Check if date is beyond 6 months in future
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      if (date > maxDate) {
        errors.push(`Date beyond 6 month limit: ${format(date, 'yyyy-MM-dd')}`);
        invalidDates.push(dateString);
        return;
      }

      validDates.push(dateString);
    });

    // Calculate monthly impact
    const monthlyImpact = {};
    validDates.forEach(dateString => {
      const date = new Date(dateString);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!monthlyImpact[monthKey]) {
        monthlyImpact[monthKey] = {
          monthLabel: format(date, 'MMMM yyyy'),
          count: 0,
          dates: []
        };
      }
      
      monthlyImpact[monthKey].count++;
      monthlyImpact[monthKey].dates.push(dateString);
    });

    // Check monthly limits (assuming 3 per month)
    Object.entries(monthlyImpact).forEach(([monthKey, impact]) => {
      if (impact.count > 3) {
        errors.push(`Selection exceeds monthly limit for ${impact.monthLabel}: ${impact.count} dates selected (limit: 3)`);
      } else if (impact.count === 3) {
        warnings.push(`Selection reaches monthly limit for ${impact.monthLabel}`);
      }
    });

    res.json({
      success: true,
      validation: {
        isValid: errors.length === 0,
        errors,
        warnings,
        validDates,
        invalidDates,
        monthlyImpact,
        totalSelected: selectedDates.length,
        validCount: validDates.length,
        invalidCount: invalidDates.length
      }
    });

  } catch (error) {
    console.error('Error validating dates:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate dates'
      }
    });
  }
});

// GET /api/calendar/holidays/types - Get available holiday types
router.get('/holidays/types', (req, res) => {
  try {
    const types = [...new Set(Array.from(holidays.values()).map(h => h.type))];
    
    res.json({
      success: true,
      types: types.sort()
    });
  } catch (error) {
    console.error('Error fetching holiday types:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HOLIDAY_TYPES_ERROR',
        message: 'Failed to fetch holiday types'
      }
    });
  }
});

// POST /api/calendar/holidays - Add new holiday (admin only)
router.post('/holidays', (req, res) => {
  try {
    const { date, name, type = 'college', recurring = false } = req.body;

    if (!date || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Date and name are required'
        }
      });
    }

    const holidayDate = new Date(date);
    if (isNaN(holidayDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Invalid date format'
        }
      });
    }

    const dateKey = format(holidayDate, 'yyyy-MM-dd');
    
    // Check if holiday already exists
    if (holidays.has(dateKey)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'HOLIDAY_EXISTS',
          message: 'Holiday already exists for this date'
        }
      });
    }

    const holiday = {
      id: `custom-${Date.now()}`,
      date: holidayDate,
      name,
      type,
      recurring,
      createdAt: new Date()
    };

    holidays.set(dateKey, holiday);

    res.status(201).json({
      success: true,
      holiday: {
        id: holiday.id,
        date: format(holiday.date, 'yyyy-MM-dd'),
        name: holiday.name,
        type: holiday.type,
        recurring: holiday.recurring
      },
      message: 'Holiday added successfully'
    });

  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HOLIDAY_ADD_ERROR',
        message: 'Failed to add holiday'
      }
    });
  }
});

export default router;