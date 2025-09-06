const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'user_login', 'user_logout', 'user_register', 'user_update', 'user_delete',
      'pg_create', 'pg_update', 'pg_delete', 'pg_activate', 'pg_deactivate',
      'resident_create', 'resident_update', 'resident_delete', 'resident_move_in', 'resident_move_out',
      'payment_create', 'payment_update', 'payment_approve', 'payment_reject',
      'ticket_create', 'ticket_update', 'ticket_assign', 'ticket_resolve', 'ticket_close',
      'room_create', 'room_update', 'room_delete', 'room_switch',
      'floor_create', 'floor_update', 'floor_delete',
      'branch_create', 'branch_update', 'branch_delete', 'branch_set_default',
      'qr_generate', 'qr_deactivate',
      'report_generate', 'report_export',
      'notification_send', 'notification_read',
      'system_backup', 'system_maintenance', 'system_error',
      'support_staff_create', 'support_staff_update', 'support_staff_delete',
      'onboarding_complete', 'offboarding_complete',
      'document_upload', 'document_download', 'document_delete'
    ]
  },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 500 },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  userRole: { type: String, required: true, enum: ['superadmin', 'admin', 'support', 'user'] },

  entityType: { type: String, enum: ['user', 'pg', 'resident', 'payment', 'ticket', 'room', 'floor', 'branch', 'qr', 'report', 'notification', 'document', 'system'] },
  entityId: { type: mongoose.Schema.Types.ObjectId, refPath: 'entityType' },
  entityName: { type: String, maxlength: 100 },

  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  branchName: { type: String },

  priority: { type: String, enum: ['low', 'normal', 'high', 'critical'], default: 'normal' },
  category: { type: String, enum: ['authentication', 'management', 'financial', 'support', 'system', 'communication'], required: true },

  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

  ipAddress: { type: String },
  userAgent: { type: String },

  status: { type: String, enum: ['success', 'failed', 'pending'], default: 'success' },
  errorMessage: { type: String },

  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'activities'
});

activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });
activitySchema.index({ branchId: 1, timestamp: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ category: 1, timestamp: -1 });
activitySchema.index({ priority: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

activitySchema.virtual('formattedTimestamp').get(function() {
  return this.timestamp.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
});

activitySchema.statics.getRecentActivities = function(limit = 10, filters = {}) {
  const query = { ...filters };
  return this.find(query)
    .populate('userId', 'firstName lastName email role')
    .populate('branchId', 'name')
    .sort({ timestamp: -1 })
    .limit(limit);
};

activitySchema.statics.getUserActivities = function(userId, limit = 20) {
  return this.find({ userId })
    .populate('branchId', 'name')
    .sort({ timestamp: -1 })
    .limit(limit);
};

activitySchema.statics.getBranchActivities = function(branchId, limit = 20) {
  return this.find({ branchId })
    .populate('userId', 'firstName lastName email role')
    .sort({ timestamp: -1 })
    .limit(limit);
};

activitySchema.statics.getActivityStats = function(timeRange = '24h') {
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '1h': startDate = new Date(now.getTime() - 60 * 60 * 1000); break;
    case '24h': startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
    case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
    case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    default: startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    { $group: { _id: '$type', count: { $sum: 1 }, lastActivity: { $max: '$timestamp' } } },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema); 