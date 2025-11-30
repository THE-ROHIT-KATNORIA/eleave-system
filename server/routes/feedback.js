import express from 'express';
import Feedback from '../models/Feedback.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit feedback (both students and admins)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { category, rating, subject, message } = req.body;

    // Validation
    if (!category || !rating || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: { message: 'All fields are required' }
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: { message: 'Rating must be between 1 and 5' }
      });
    }

    const feedback = new Feedback({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      category,
      rating,
      subject,
      message
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to submit feedback' }
    });
  }
});

// Get all feedback (admin only)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Admin only.' }
      });
    }

    const { status, category } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'name');

    res.json({
      success: true,
      feedbacks
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch feedback' }
    });
  }
});

// Get user's own feedback
router.get('/my-feedback', authenticateToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('respondedBy', 'name');

    res.json({
      success: true,
      feedbacks
    });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch feedback' }
    });
  }
});

// Update feedback status (admin only)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Admin only.' }
      });
    }

    const { status } = req.body;

    if (!['new', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid status' }
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: { message: 'Feedback not found' }
      });
    }

    res.json({
      success: true,
      message: 'Feedback status updated',
      feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update feedback status' }
    });
  }
});

// Add admin response (admin only)
router.patch('/:id/respond', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Admin only.' }
      });
    }

    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Response cannot be empty' }
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: response,
        respondedBy: req.user.id,
        respondedAt: new Date(),
        status: 'reviewed'
      },
      { new: true }
    ).populate('respondedBy', 'name');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: { message: 'Feedback not found' }
      });
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      feedback
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add response' }
    });
  }
});

// Get feedback statistics (admin only)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Access denied. Admin only.' }
      });
    }

    const total = await Feedback.countDocuments();
    const byStatus = await Feedback.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byCategory = await Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byCategory: byCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        averageRating: avgRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch feedback statistics' }
    });
  }
});

export default router;
