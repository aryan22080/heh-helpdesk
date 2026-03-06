const mongoose = require('mongoose');

// Issue Schema
const issueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  category: {
    type: String,
    enum: ['technical', 'medical', 'equipment', 'logistics', 'safety', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  ticketId: {
    type: String,
    unique: true
  },
  emailSent: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Auto-generate ticket ID before saving
issueSchema.pre('save', function(next) {
  if (!this.ticketId) {
    const prefix = 'HEH';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.ticketId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Feedback Schema
const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  serviceType: {
    type: String,
    enum: ['field-medical', 'emergency-response', 'equipment', 'training', 'coordination', 'other'],
    default: 'other'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  experience: {
    type: String,
    required: [true, 'Experience description is required'],
    trim: true,
    maxlength: [2000, 'Experience cannot exceed 2000 characters']
  },
  improvements: {
    type: String,
    trim: true,
    maxlength: [1000, 'Improvements cannot exceed 1000 characters']
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  feedbackId: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Auto-generate feedback ID before saving
feedbackSchema.pre('save', function(next) {
  if (!this.feedbackId) {
    const prefix = 'FB';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.feedbackId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

const Issue = mongoose.model('Issue', issueSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = { Issue, Feedback };
