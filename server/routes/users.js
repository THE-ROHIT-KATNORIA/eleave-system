import express from 'express';
import User from '../models/User.js';
import Leave from '../models/Leave.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/users
 * Get all users (Admin only)
 */
router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    // Get all users without passwords
    const users = await User.find({}).select('-password').lean();
    
    // Convert _id to id for compatibility
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      stream: user.stream,
      rollNumber: user.rollNumber,
      createdAt: user.createdAt
    }));
    
    res.status(200).json({
      success: true,
      users: formattedUsers
    });
    
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USERS_ERROR',
        message: 'Failed to fetch users'
      }
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete a user account (Admin only)
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'You cannot delete your own account'
        }
      });
    }
    
    // Find and delete user
    const deletedUser = await User.findOneAndDelete({ 
      $or: [{ _id: id }, { _id: { $exists: false } }] 
    }).select('-password');
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    // Also delete all leave requests associated with this user
    await Leave.deleteMany({ userId: id });
    
    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
      deletedUser: {
        id: deletedUser._id ? deletedUser._id.toString() : id,
        name: deletedUser.name,
        email: deletedUser.email,
        role: deletedUser.role
      }
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_USER_ERROR',
        message: 'Failed to delete user'
      }
    });
  }
});

/**
 * GET /api/users/:id
 * Fetch user profile by ID
 * Requires authentication - users can only access their own profile or admins can access any profile
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user; // From authentication middleware
    
    // Authorization check: users can only access their own profile unless they're admin
    if (requestingUser.id !== id && requestingUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to access this profile'
        }
      });
    }
    
    // Find user by ID (support both MongoDB _id and old string id)
    const user = await User.findOne({
      $or: [{ _id: id }, { _id: { $exists: false } }]
    }).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }
    
    // Return user data without password
    res.status(200).json({
      success: true,
      user: {
        id: user._id ? user._id.toString() : id,
        name: user.name,
        email: user.email,
        role: user.role,
        stream: user.stream,
        rollNumber: user.rollNumber
      }
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: 'Failed to fetch user profile'
      }
    });
  }
});

export default router;
