import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    trim: true
  },
  rollNumber: {
    type: String,
    trim: true
  },
  stream: {
    type: String,
    trim: true
  },
  leaveType: {
    type: String,
    trim: true
  },
  requestType: {
    type: String,
    enum: ['traditional', 'calendar'],
    default: 'traditional'
  },
  
  // Traditional leave fields
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  
  // Calendar leave fields
  selectedDates: [{
    type: Date
  }],
  selectedDatesCount: {
    type: Number
  },
  
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  
  submittedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
leaveSchema.index({ userId: 1, status: 1 });
leaveSchema.index({ userId: 1, updatedAt: -1 });
leaveSchema.index({ status: 1, updatedAt: -1 });
leaveSchema.index({ userId: 1, status: 1, updatedAt: -1 });

// Update updatedAt on save
leaveSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Leave', leaveSchema);
