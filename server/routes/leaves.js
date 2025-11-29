import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * POST /api/leaves/validate
 * Validate leave request against monthly limits
 * Returns: validation result with current and projected usage
 */
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userId, startDate, and endDate are required'
        }
      });
    }
    
    // Verify user can validate this data (students can only validate their own, admins can validate any)
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only validate your own leave requests'
        }
      });
    }
    
    // Validate date format
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Invalid date format. Use YYYY-MM-DD format'
        }
      });
    }
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'End date must be after or equal to start date'
        }
      });
    }
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Filter leaves for this user
    const userLeaves = await Leave.find({ userId }).lean();
    
    // Count approved leave DAYS (not submissions) in current month
    let approvedDaysThisMonth = 0;
    
    userLeaves.forEach(leave => {
      if (leave.status !== 'approved') return;
      
      const updatedDate = new Date(leave.updatedAt);
      if (updatedDate.getMonth() !== currentMonth || 
          updatedDate.getFullYear() !== currentYear) return;
      
      // For calendar requests, count each selected date as one day
      if (leave.requestType === 'calendar' && leave.selectedDates && Array.isArray(leave.selectedDates)) {
        approvedDaysThisMonth += leave.selectedDates.length;
      } else if (leave.startDate && leave.endDate) {
        // For traditional requests, calculate days between startDate and endDate
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        approvedDaysThisMonth += days;
      } else {
        // Fallback: count as 1 day if no date info available
        approvedDaysThisMonth += 1;
      }
    });
    
    // Calculate leave days for the requested period
    const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate projected usage
    const monthlyLimit = 3;
    const projectedUsage = approvedDaysThisMonth + requestedDays;
    const remainingLeaves = Math.max(0, monthlyLimit - approvedDaysThisMonth);
    const exceedsLimit = projectedUsage > monthlyLimit;
    const limitReached = approvedDaysThisMonth >= monthlyLimit;
    
    // Generate user-friendly message
    let message = '';
    if (limitReached) {
      message = 'You have already reached your monthly leave limit of 3 days.';
    } else if (exceedsLimit) {
      const exceedsBy = projectedUsage - monthlyLimit;
      message = `This request would exceed your monthly limit by ${exceedsBy} day${exceedsBy > 1 ? 's' : ''}.`;
    } else {
      message = `This request is within your monthly limit. You will have ${remainingLeaves - requestedDays} day${remainingLeaves - requestedDays !== 1 ? 's' : ''} remaining.`;
    }
    
    res.status(200).json({
      success: true,
      data: {
        isValid: !exceedsLimit,
        currentUsage: approvedDaysThisMonth,
        projectedUsage,
        remainingLeaves,
        requestedDays,
        exceedsLimit,
        limitReached,
        monthlyLimit,
        message,
        canOverride: req.user.role === 'admin' // Future feature
      }
    });
    
  } catch (error) {
    console.error('Validate leave error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATE_LEAVE_ERROR',
        message: 'Failed to validate leave request'
      }
    });
  }
});

/**
 * GET /api/leaves/monthly-limit/:userId
 * Get monthly leave limit status for a specific user
 * Returns: monthlyLimit, approvedThisMonth, remainingLeaves, currentMonth, currentYear
 */
router.get('/monthly-limit/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can access this data (students can only access their own, admins can access any)
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own leave limit data'
        }
      });
    }
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    
    // Filter leaves for this user
    const userLeaves = await Leave.find({ userId }).lean();
    
    // Count approved leave DAYS (not submissions) in current month
    let approvedDaysThisMonth = 0;
    
    userLeaves.forEach(leave => {
      if (leave.status !== 'approved') return;
      
      const updatedDate = new Date(leave.updatedAt);
      if (updatedDate.getMonth() !== currentMonth || 
          updatedDate.getFullYear() !== currentYear) return;
      
      // For calendar requests, count each selected date as one day
      if (leave.requestType === 'calendar' && leave.selectedDates && Array.isArray(leave.selectedDates)) {
        approvedDaysThisMonth += leave.selectedDates.length;
      } else if (leave.startDate && leave.endDate) {
        // For traditional requests, calculate days between startDate and endDate
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        approvedDaysThisMonth += days;
      } else {
        // Fallback: count as 1 day if no date info available
        approvedDaysThisMonth += 1;
      }
    });
    
    // Calculate remaining leaves
    const monthlyLimit = 3;
    const remainingLeaves = Math.max(0, monthlyLimit - approvedDaysThisMonth);
    
    res.status(200).json({
      success: true,
      data: {
        monthlyLimit,
        approvedThisMonth: approvedDaysThisMonth,
        remainingLeaves,
        currentMonth: now.toLocaleString('default', { month: 'long' }),
        currentYear
      }
    });
    
  } catch (error) {
    console.error('Get monthly limit error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_MONTHLY_LIMIT_ERROR',
        message: 'Failed to retrieve monthly leave limit'
      }
    });
  }
});

/**
 * GET /api/leaves/admin
 * Get all leave requests (Admin only)
 * Supports filtering by stream and status
 */
router.get('/admin', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { stream, status } = req.query;
    
    let query = {};
    
    // Filter by stream if provided
    if (stream) {
      query.stream = stream;
    }
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Get leaves sorted by submission date (newest first)
    const leaves = await Leave.find(query).sort({ submittedAt: -1 }).lean();
    
    // Convert _id to id for compatibility and format dates
    const formattedLeaves = leaves.map(leave => ({
      id: leave._id.toString(),
      userId: leave.userId,
      userName: leave.userName,
      userEmail: leave.userEmail,
      rollNumber: leave.rollNumber,
      stream: leave.stream,
      leaveType: leave.leaveType,
      requestType: leave.requestType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      selectedDates: leave.selectedDates,
      selectedDatesCount: leave.selectedDatesCount,
      reason: leave.reason,
      status: leave.status,
      attachment: leave.attachment,
      submittedAt: leave.submittedAt,
      updatedAt: leave.updatedAt
    }));
    
    // Calculate statistics
    const stats = {
      total: formattedLeaves.length,
      pending: formattedLeaves.filter(leave => leave.status === 'pending').length,
      approved: formattedLeaves.filter(leave => leave.status === 'approved').length,
      rejected: formattedLeaves.filter(leave => leave.status === 'rejected').length
    };
    
    res.status(200).json({
      success: true,
      leaves: formattedLeaves,
      stats
    });
    
  } catch (error) {
    console.error('Get admin leaves error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_ADMIN_LEAVES_ERROR',
        message: 'Failed to fetch leave requests'
      }
    });
  }
});

/**
 * GET /api/leaves
 * Get leave requests for the authenticated user
 * Students see their own leaves, admins see all leaves
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    // Filter based on role
    if (req.user.role === 'student') {
      query.userId = req.user.id;
    }
    // Admins see all leaves (no filter)
    
    // Get leaves sorted by submission date (newest first)
    const leaves = await Leave.find(query).sort({ submittedAt: -1 }).lean();
    
    // Convert _id to id for compatibility
    const formattedLeaves = leaves.map(leave => ({
      id: leave._id.toString(),
      userId: leave.userId,
      userName: leave.userName,
      userEmail: leave.userEmail,
      rollNumber: leave.rollNumber,
      stream: leave.stream,
      leaveType: leave.leaveType,
      requestType: leave.requestType,
      startDate: leave.startDate,
      endDate: leave.endDate,
      selectedDates: leave.selectedDates,
      selectedDatesCount: leave.selectedDatesCount,
      reason: leave.reason,
      status: leave.status,
      attachment: leave.attachment,
      submittedAt: leave.submittedAt,
      updatedAt: leave.updatedAt
    }));
    
    res.status(200).json({
      success: true,
      leaves: formattedLeaves
    });
    
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_LEAVES_ERROR',
        message: 'Failed to fetch leave requests'
      }
    });
  }
});

/**
 * POST /api/leaves
 * Create a new leave request
 */
router.post('/', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { userId, userName, userEmail, stream, leaveType, startDate, endDate, reason, rollNumber } = req.body;
    const attachment = req.file;
    
    // Validate required fields
    if (!userId || !userName || !stream || !leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All required fields must be provided'
        }
      });
    }
    
    // Verify user can only create leaves for themselves (unless admin)
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only create leave requests for yourself'
        }
      });
    }
    
    // Validate stream
    const validStreams = ['BCA', 'BA', 'PGDCA', 'BSC', 'BCOM'];
    if (!validStreams.includes(stream)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STREAM',
          message: `Stream must be one of: ${validStreams.join(', ')}`
        }
      });
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE',
          message: 'Invalid date format'
        }
      });
    }
    
    if (end < start) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATE_RANGE',
          message: 'End date must be after or equal to start date'
        }
      });
    }
    
    // Validate roll number for students
    if (req.user.role === 'student') {
      if (!rollNumber) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ROLLNUMBER_REQUIRED',
            message: 'Roll number is required for student leave requests'
          }
        });
      }
      
      // Validate that rollNumber matches the authenticated user's profile
      if (rollNumber !== req.user.rollNumber) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ROLLNUMBER_MISMATCH',
            message: 'Roll number does not match your profile'
          }
        });
      }
    }
    
    // Validate against monthly leave limit
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Count approved leave DAYS (not submissions) for this user in current month
    const userLeaves = await Leave.find({ userId }).lean();
    
    let approvedDaysThisMonth = 0;
    userLeaves.forEach(leave => {
      if (leave.status !== 'approved') return;
      
      const updatedDate = new Date(leave.updatedAt);
      if (updatedDate.getMonth() !== currentMonth || 
          updatedDate.getFullYear() !== currentYear) return;
      
      // For calendar requests, count each selected date as one day
      if (leave.requestType === 'calendar' && leave.selectedDates && Array.isArray(leave.selectedDates)) {
        approvedDaysThisMonth += leave.selectedDates.length;
      } else if (leave.startDate && leave.endDate) {
        // For traditional requests, calculate days between startDate and endDate
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        approvedDaysThisMonth += days;
      } else {
        // Fallback: count as 1 day if no date info available
        approvedDaysThisMonth += 1;
      }
    });
    
    // Calculate requested days
    const requestedDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const monthlyLimit = 3;
    const projectedUsage = approvedDaysThisMonth + requestedDays;
    
    // Check if submission would exceed limit (warning only, still allow submission)
    const exceedsLimit = projectedUsage > monthlyLimit;
    const limitReached = approvedDaysThisMonth >= monthlyLimit;
    
    if (exceedsLimit) {
      console.log(`Warning: User ${userId} submitting leave that would exceed monthly limit. Current: ${approvedDaysThisMonth}, Requested: ${requestedDays}, Projected: ${projectedUsage}`);
    }
    
    // Create new leave request
    const newLeave = new Leave({
      userId,
      userName,
      userEmail: userEmail || `${userName.toLowerCase().replace(' ', '')}@student.edu`,
      rollNumber: rollNumber || null,
      stream,
      leaveType,
      startDate,
      endDate,
      reason: reason.trim(),
      status: 'pending',
      attachment: attachment ? {
        filename: attachment.filename,
        originalName: attachment.originalname,
        mimetype: attachment.mimetype,
        size: attachment.size,
        path: attachment.path
      } : null,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Save leave to database
    await newLeave.save();
    
    // Prepare response with limit information
    const response = {
      success: true,
      message: 'Leave request submitted successfully',
      leaveId: newLeave._id.toString(),
      leave: {
        id: newLeave._id.toString(),
        userId: newLeave.userId,
        userName: newLeave.userName,
        userEmail: newLeave.userEmail,
        rollNumber: newLeave.rollNumber,
        stream: newLeave.stream,
        leaveType: newLeave.leaveType,
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        reason: newLeave.reason,
        status: newLeave.status,
        attachment: newLeave.attachment,
        submittedAt: newLeave.submittedAt,
        updatedAt: newLeave.updatedAt
      }
    };

    // Add limit warning information if applicable
    if (exceedsLimit) {
      response.warning = {
        code: 'LEAVE_LIMIT_EXCEEDED',
        message: `This request exceeds your monthly leave limit. Current usage: ${approvedDaysThisMonth}, Requested: ${requestedDays}, Total would be: ${projectedUsage}/${monthlyLimit}`,
        limitInfo: {
          currentUsage: approvedDaysThisMonth,
          requestedDays,
          projectedUsage,
          monthlyLimit,
          exceedsBy: projectedUsage - monthlyLimit
        }
      };
    }

    res.status(201).json(response);
    
  } catch (error) {
    console.error('Create leave error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_LEAVE_ERROR',
        message: 'Failed to create leave request'
      }
    });
  }
});

/**
 * PATCH /api/leaves/:id/status
 * Update leave request status (approve/reject)
 * Admin only
 */
router.patch('/:id/status', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Status must be either "approved" or "rejected"'
        }
      });
    }
    
    // Find leave request (support both MongoDB ObjectId and old string IDs)
    let leave;
    try {
      leave = await Leave.findById(id);
    } catch (err) {
      // If id is not a valid ObjectId, it will throw an error
      // In that case, the leave doesn't exist
      leave = null;
    }
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAVE_NOT_FOUND',
          message: 'Leave request not found'
        }
      });
    }
    
    // Update leave status
    leave.status = status;
    leave.updatedAt = new Date().toISOString();
    
    await leave.save();
    
    res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      leave: {
        id: leave._id.toString(),
        userId: leave.userId,
        userName: leave.userName,
        status: leave.status,
        updatedAt: leave.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_STATUS_ERROR',
        message: 'Failed to update leave status'
      }
    });
  }
});

/**
 * DELETE /api/leaves/:id
 * Delete a leave request
 * Students can delete their own pending requests, admins can delete any
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find leave request (support both MongoDB ObjectId and old string IDs)
    let leave;
    try {
      leave = await Leave.findById(id);
    } catch (err) {
      // If id is not a valid ObjectId, it will throw an error
      leave = null;
    }
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LEAVE_NOT_FOUND',
          message: 'Leave request not found'
        }
      });
    }
    
    // Authorization check
    if (req.user.role === 'student') {
      // Students can only delete their own pending requests
      if (leave.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only delete your own leave requests'
          }
        });
      }
      
      if (leave.status !== 'pending') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE',
            message: 'You can only delete pending leave requests'
          }
        });
      }
    }
    // Admins can delete any leave request
    
    // Delete leave
    await Leave.deleteOne({ _id: leave._id });
    
    res.status(200).json({
      success: true,
      message: 'Leave request deleted successfully',
      deletedLeave: {
        id: leave._id.toString(),
        userName: leave.userName,
        status: leave.status
      }
    });
    
  } catch (error) {
    console.error('Delete leave error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_LEAVE_ERROR',
        message: 'Failed to delete leave request'
      }
    });
  }
});

/**
 * GET /api/leaves/calendar/:userId/balance
 * Get calendar-specific leave balance for a user
 */
router.get('/calendar/:userId/balance', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    // Verify user can access this data
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only access your own balance data'
        }
      });
    }

    // Default to current month/year if not provided
    const targetDate = month && year 
      ? new Date(parseInt(year), parseInt(month) - 1, 1)
      : new Date();

    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);

    // Get user's leaves for the target month
    const userLeaves = await Leave.find({ userId }).lean();
    
    const leavesInMonth = userLeaves.filter(leave => {
      if (leave.status !== 'approved') return false;

      // For calendar requests, check if any selected dates fall in target month
      if (leave.requestType === 'calendar' && leave.selectedDates) {
        return leave.selectedDates.some(dateString => {
          const date = new Date(dateString);
          return isWithinInterval(date, { start: monthStart, end: monthEnd });
        });
      }

      // For traditional requests, check if approval date falls in target month
      const updatedDate = new Date(leave.updatedAt);
      return isWithinInterval(updatedDate, { start: monthStart, end: monthEnd });
    });

    // Count approved leave days in target month
    let approvedDaysInMonth = 0;
    
    leavesInMonth.forEach(leave => {
      if (leave.requestType === 'calendar' && leave.selectedDates) {
        // Count individual dates in target month
        leave.selectedDates.forEach(dateString => {
          const date = new Date(dateString);
          if (isWithinInterval(date, { start: monthStart, end: monthEnd })) {
            approvedDaysInMonth++;
          }
        });
      } else {
        // Traditional leave - count as 1 (or calculate days if needed)
        approvedDaysInMonth += 1;
      }
    });

    const monthlyLimit = 3;
    const remainingLeaves = Math.max(0, monthlyLimit - approvedDaysInMonth);

    res.json({
      success: true,
      balance: {
        userId,
        month: format(targetDate, 'yyyy-MM'),
        monthLabel: format(targetDate, 'MMMM yyyy'),
        used: approvedDaysInMonth,
        remaining: remainingLeaves,
        limit: monthlyLimit,
        approvedLeaves: leavesInMonth.map(leave => ({
          id: leave._id.toString(),
          requestType: leave.requestType,
          selectedDates: leave.selectedDates || [],
          approvedAt: leave.updatedAt
        })),
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Calendar balance error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CALENDAR_BALANCE_ERROR',
        message: 'Failed to fetch calendar balance'
      }
    });
  }
});

/**
 * POST /api/leaves/calendar
 * Create a calendar-based leave request
 */
router.post('/calendar', authenticateToken, async (req, res) => {
  try {
    const { userId, userName, userEmail, rollNumber, stream, selectedDates, selectedDatesCount, reason } = req.body;
    
    // Validate required fields
    if (!userId || !userName || !stream || !selectedDates || !reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All required fields must be provided'
        }
      });
    }
    
    // Verify user can only create leaves for themselves (unless admin)
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only create leave requests for yourself'
        }
      });
    }
    
    // Validate selectedDates is an array
    if (!Array.isArray(selectedDates) || selectedDates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_DATES',
          message: 'selectedDates must be a non-empty array'
        }
      });
    }
    
    // Create new calendar leave request
    const newLeave = new Leave({
      userId,
      userName,
      userEmail: userEmail || `${userName.toLowerCase().replace(' ', '')}@student.edu`,
      rollNumber: rollNumber || null,
      stream,
      requestType: 'calendar',
      selectedDates: selectedDates.map(d => new Date(d)),
      selectedDatesCount: selectedDates.length,
      reason: reason.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Save leave to database
    await newLeave.save();
    
    res.status(201).json({
      success: true,
      message: 'Calendar leave request submitted successfully',
      leaveId: newLeave._id.toString(),
      leave: {
        id: newLeave._id.toString(),
        userId: newLeave.userId,
        userName: newLeave.userName,
        requestType: newLeave.requestType,
        selectedDates: newLeave.selectedDates,
        selectedDatesCount: newLeave.selectedDatesCount,
        reason: newLeave.reason,
        status: newLeave.status,
        submittedAt: newLeave.submittedAt
      }
    });
    
  } catch (error) {
    console.error('Create calendar leave error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_CALENDAR_LEAVE_ERROR',
        message: 'Failed to create calendar leave request'
      }
    });
  }
});

export default router;

/**
 * GET /api/leaves/stats
 * Get leave statistics (total, pending, approved, rejected)
 * Supports filtering by stream
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { stream } = req.query;
    
    let query = {};
    
    // Filter by stream if provided
    if (stream) {
      query.stream = stream;
    }
    
    // Get all leaves matching the query
    const leaves = await Leave.find(query).lean();
    
    // Calculate statistics
    const stats = {
      total: leaves.length,
      pending: leaves.filter(leave => leave.status === 'pending').length,
      approved: leaves.filter(leave => leave.status === 'approved').length,
      rejected: leaves.filter(leave => leave.status === 'rejected').length
    };
    
    res.status(200).json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_STATS_ERROR',
        message: 'Failed to fetch leave statistics'
      }
    });
  }
});
