const mongoose = require('mongoose');

const sharingTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const pgSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharingTypes: [sharingTypeSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
pgSchema.index({ createdBy: 1 });
pgSchema.index({ admin: 1 });
pgSchema.index({ isActive: 1 });

// Pre-save middleware to ensure required fields
pgSchema.pre('save', function(next) {
  if (!this.name || !this.admin || !this.createdBy) {
    return next(new Error('Missing required fields: name, admin, createdBy'));
  }
  next();
});

const PG = mongoose.model('PG', pgSchema);

module.exports = PG; 