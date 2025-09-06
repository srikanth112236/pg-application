const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    console.log('=== AUTHENTICATION START ===');
    console.log('Request URL:', req.method, req.originalUrl);
    console.log('Request headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      cookie: req.headers.cookie ? 'Present' : 'Missing'
    });
    
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header');
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      console.log('Token found in cookies');
    }

    if (!token) {
      console.log('❌ No token found - returning 401');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('✅ Token found, attempting to verify...');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    console.log('✅ Token decoded successfully:', {
      userId: decoded.userId || decoded.id,
      iat: new Date(decoded.iat * 1000),
      exp: new Date(decoded.exp * 1000)
    });

    // Check if user still exists
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      console.log('❌ No user ID found in token - returning 401');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format.'
      });
    }
    
    const user = await User.findById(userId);
    console.log('User lookup result:', {
      userFound: !!user,
      userId: user?._id,
      userRole: user?.role,
      userEmail: user?.email,
      isActive: user?.isActive
    });
    
    if (!user) {
      console.log('❌ User not found - returning 401');
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User inactive - returning 401');
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    // Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      console.log('❌ Password changed after token - returning 401');
      return res.status(401).json({
        success: false,
        message: 'User recently changed password. Please log in again.'
      });
    }

    // Attach user to request
    req.user = user;
    console.log('✅ User authenticated successfully:', {
      userId: user._id,
      userRole: user.role,
      userEmail: user.email,
      isActive: user.isActive
    });
    console.log('=== AUTHENTICATION SUCCESS ===');
    next();
  } catch (error) {
    console.log('=== AUTHENTICATION ERROR ===');
    console.error('Authentication error details:', error);
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ JWT Error - Invalid token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      console.log('❌ JWT Error - Token expired');
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    console.error('❌ Unexpected authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

      // Check if user still exists
      const user = await User.findById(decoded.id);
      if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Don't fail for optional authentication
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {...string} roles - Allowed roles
 * @returns {Function} - Middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('=== AUTHORIZATION START ===');
    console.log('Authorization check:', {
      userExists: !!req.user,
      userRole: req.user?.role,
      allowedRoles: roles,
      userEmail: req.user?.email
    });

    if (!req.user) {
      console.log('❌ Authorization failed: No user in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    console.log('Checking role permission:', {
      userRole: req.user.role,
      allowedRoles: roles,
      isRoleAllowed: roles.includes(req.user.role)
    });

    if (!roles.includes(req.user.role)) {
      console.log('❌ Authorization failed:', {
        userRole: req.user.role,
        allowedRoles: roles,
        reason: 'User role not in allowed roles'
      });
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    console.log('✅ Authorization successful for user:', req.user.email);
    console.log('=== AUTHORIZATION SUCCESS ===');
    next();
  };
};

/**
 * Middleware to check if user is superadmin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const superadminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Superadmin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Superadmin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization check failed'
    });
  }
};

/**
 * Admin or Superadmin middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminOrSuperadmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Superadmin privileges required.'
    });
  }

  next();
};

/**
 * Admin only middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Check resource ownership middleware
 * @param {string} resourceUserIdField - Field name containing user ID
 * @returns {Function} - Middleware function
 */
const checkOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Superadmin can access all resources
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserIdField] || req.params[resourceUserIdField];
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource user ID not provided.'
      });
    }

    if (resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

/**
 * Check if user is email verified
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email address before proceeding.',
      requiresVerification: true
    });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  superadminOnly,
  adminOrSuperadmin,
  adminOnly,
  checkOwnership,
  requireEmailVerification
}; 