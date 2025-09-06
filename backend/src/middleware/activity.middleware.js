const activityService = require('../services/activity.service');

const recordActivity = (options) => {
  return async (req, res, next) => {
    res.locals._activityOptions = options;
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failed';
        const user = req.user || {};
        
        // Determine branch information
        let branchId = null;
        let branchName = null;
        
        // Try to get branch from request body, params, or user's default branch
        if (req.body?.branchId) {
          branchId = req.body.branchId;
        } else if (req.params?.branchId) {
          branchId = req.params.branchId;
        } else if (user.branchId) {
          branchId = user.branchId;
        }
        
        // Try to get branch name from request body or user
        if (req.body?.branchName) {
          branchName = req.body.branchName;
        } else if (user.branchName) {
          branchName = user.branchName;
        }

        await activityService.recordActivity({
          ...options,
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          branchId: branchId,
          branchName: branchName,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status,
          metadata: {
            ...(options.metadata || {}),
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            userRole: user.role,
            timestamp: new Date().toISOString()
          }
        });
      } catch (e) {
        // swallow errors
      }
      return originalJson(body);
    };
    next();
  };
};

// Role-specific activity recording functions
const recordAdminActivity = (options) => {
  return recordActivity({
    ...options,
    category: options.category || 'management',
    priority: options.priority || 'normal'
  });
};

const recordSuperadminActivity = (options) => {
  return recordActivity({
    ...options,
    category: options.category || 'system',
    priority: options.priority || 'high'
  });
};

const recordSupportActivity = (options) => {
  return recordActivity({
    ...options,
    category: options.category || 'support',
    priority: options.priority || 'normal'
  });
};

// Authentication activities
const loginActivity = recordActivity({
  type: 'user_login',
  title: 'User Login',
  description: 'User logged in',
  category: 'authentication',
  priority: 'normal'
});

const logoutActivity = recordActivity({
  type: 'user_logout',
  title: 'User Logout',
  description: 'User logged out',
  category: 'authentication',
  priority: 'normal'
});

// Admin-specific activities
const adminResidentActivity = recordAdminActivity({
  type: 'resident_management',
  title: 'Resident Management',
  description: 'Admin performed resident management action',
  category: 'management'
});

const adminPaymentActivity = recordAdminActivity({
  type: 'payment_management',
  title: 'Payment Management',
  description: 'Admin performed payment management action',
  category: 'financial'
});

const adminRoomActivity = recordAdminActivity({
  type: 'room_management',
  title: 'Room Management',
  description: 'Admin performed room management action',
  category: 'management'
});

// Superadmin-specific activities
const superadminUserActivity = recordSuperadminActivity({
  type: 'user_management',
  title: 'User Management',
  description: 'Superadmin performed user management action',
  category: 'system'
});

const superadminSystemActivity = recordSuperadminActivity({
  type: 'system_management',
  title: 'System Management',
  description: 'Superadmin performed system management action',
  category: 'system'
});

const superadminPGActivity = recordSuperadminActivity({
  type: 'pg_management',
  title: 'PG Management',
  description: 'Superadmin performed PG management action',
  category: 'management'
});

// Support-specific activities
const supportTicketActivity = recordSupportActivity({
  type: 'ticket_management',
  title: 'Ticket Management',
  description: 'Support staff performed ticket management action',
  category: 'support'
});

const supportUserActivity = recordSupportActivity({
  type: 'support_user_management',
  title: 'Support User Management',
  description: 'Support staff performed user support action',
  category: 'support'
});

module.exports = {
  recordActivity,
  recordAdminActivity,
  recordSuperadminActivity,
  recordSupportActivity,
  loginActivity,
  logoutActivity,
  adminResidentActivity,
  adminPaymentActivity,
  adminRoomActivity,
  superadminUserActivity,
  superadminSystemActivity,
  superadminPGActivity,
  supportTicketActivity,
  supportUserActivity
}; 