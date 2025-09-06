const User = require('../models/user.model');
const EmailService = require('./email.service');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const OnboardingService = require('./onboarding.service');

class AuthService {
  /**
   * Register new superadmin
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration result
   */
  async registerSuperadmin(userData) {
    try {
      console.log('Registering superadmin with data:', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'superadmin'
      });

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          statusCode: 400
        };
      }

      // Create new user
      const user = new User({
        ...userData,
        role: 'superadmin',
        isEmailVerified: true, // Superadmin accounts are verified by default
        isActive: true
      });

      console.log('User object before save:', {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      });

      // Store plain password temporarily for email
      user.plainPassword = userData.password;

      // Save user
      const savedUser = await user.save();
      
      console.log('User saved successfully:', {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive,
        isEmailVerified: savedUser.isEmailVerified
      });

      // Send welcome email with credentials
      await EmailService.sendWelcomeEmail(user);

      return {
        success: true,
        message: 'Registration successful. Please check your email for login credentials.',
        statusCode: 201
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Register new support staff
   * @param {Object} userData - Support staff registration data
   * @returns {Promise<Object>} - Registration result
   */
  async registerSupportStaff(userData) {
    try {
      console.log('Registering support staff with data:', {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'support'
      });

      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return {
          success: false,
          message: 'Support staff with this email already exists',
          statusCode: 400
        };
      }

      // Create new support staff user
      const user = new User({
        ...userData,
        role: 'support',
        isEmailVerified: true, // Support staff accounts are verified by default
        isActive: true
      });

      console.log('Support staff user object before save:', {
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      });

      // Store plain password temporarily for email
      user.plainPassword = userData.password;

      // Save user
      const savedUser = await user.save();
      
      console.log('Support staff user saved successfully:', {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        isActive: savedUser.isActive,
        isEmailVerified: savedUser.isEmailVerified
      });

      // Send welcome email with credentials
      await EmailService.sendSupportWelcomeEmail(user);

      return {
        success: true,
        message: 'Support staff registration successful. Please check your email for login credentials.',
        statusCode: 201
      };
    } catch (error) {
      console.error('Support staff registration error:', error);
      return {
        success: false,
        message: 'Support staff registration failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {Object} loginInfo - Login information (IP, user agent, etc.)
   * @returns {Promise<Object>} - Login result with onboarding status
   */
  async login(credentials, loginInfo = {}) {
    try {
      console.log('🔍 AuthService: Starting login...');
      console.log('📧 Email:', credentials.email);
      console.log('🌐 Login info:', loginInfo);

      // Find user by email and include password field for comparison
      const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
      
      if (!user) {
        console.log('❌ AuthService: User not found');
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        console.log('🔒 AuthService: Account is locked');
        return {
          success: false,
          message: 'Account is locked due to multiple failed login attempts. Please contact the administrator.',
          statusCode: 423
        };
      }

      // Check if account is deactivated
      if (!user.isActive) {
        console.log('❌ AuthService: Account is deactivated');
        return {
          success: false,
          message: 'User account is deactivated',
          statusCode: 403
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(credentials.password);
      
      if (!isPasswordValid) {
        console.log('❌ AuthService: Invalid password');
        
        // Increment login attempts
        user.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
          await user.save();
          
          return {
            success: false,
            message: 'Account is locked due to multiple failed login attempts. Please try again in 30 minutes.',
            statusCode: 423
          };
        }
        
        await user.save();
        
        return {
          success: false,
          message: 'Invalid credentials',
          statusCode: 401
        };
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = null;
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user._id, tokenVersion: user.tokenVersion },
        process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key-change-this-in-production',
        { expiresIn: '7d' }
      );

      // Get onboarding status for admin users
      let onboardingStatus = null;
      if (user.role === 'admin') {
        try {
          const onboardingResult = await OnboardingService.getOnboardingStatus(user._id.toString());
          if (onboardingResult.success) {
            onboardingStatus = onboardingResult.data;
          }
        } catch (error) {
          console.error('❌ AuthService: Error getting onboarding status:', error);
          // Don't fail login if onboarding status fails
        }
      }

      // Get PG information for admin users
      let pgInfo = null;
      if (user.role === 'admin' && user.pgId) {
        try {
          const PG = require('../models/pg.model');
          const pg = await PG.findById(user.pgId).select('name address');
          if (pg) {
            pgInfo = {
              pgId: pg._id,
              pgName: pg.name,
              pgAddress: pg.address
            };
          }
        } catch (error) {
          console.error('❌ AuthService: Error getting PG info:', error);
          // Don't fail login if PG info fails
        }
      }

      console.log('✅ AuthService: Login successful');
      console.log('👤 User role:', user.role);
      console.log('🏢 PG Info:', pgInfo);
      console.log('🔄 Onboarding status:', onboardingStatus ? {
        isCompleted: onboardingStatus.isCompleted,
        currentStep: onboardingStatus.currentStep
      } : 'Not applicable');

      // Log login attempt
      await this.logLoginAttempt(user._id, true, loginInfo);

      return {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            pgId: user.pgId,
            ...pgInfo, // Include PG info if available
            onboarding: onboardingStatus // Include onboarding status in response
          },
          tokens: {
            accessToken,
            refreshToken
          }
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      return {
        success: false,
        message: 'Login failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Login support staff
   * @param {Object} credentials - Login credentials
   * @param {Object} loginInfo - Login information (IP, user agent, etc.)
   * @returns {Promise<Object>} - Login result
   */
  async supportLogin(credentials, loginInfo = {}) {
    try {
      console.log('🔍 AuthService: Starting support login...');
      console.log('📧 Email:', credentials.email);
      console.log('🌐 Login info:', loginInfo);

      // Find user by email and include password field for comparison
      const user = await User.findOne({ 
        email: credentials.email.toLowerCase(),
        role: 'support'
      }).select('+password');
      
      if (!user) {
        console.log('❌ AuthService: Support user not found');
        return {
          success: false,
          message: 'Support user not found',
          statusCode: 404
        };
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > Date.now()) {
        console.log('🔒 AuthService: Support account is locked');
        return {
          success: false,
          message: 'Account is locked due to multiple failed login attempts. Please contact the administrator.',
          statusCode: 423
        };
      }

      // Check if account is deactivated
      if (!user.isActive) {
        console.log('❌ AuthService: Support account is deactivated');
        return {
          success: false,
          message: 'Support account is deactivated',
          statusCode: 403
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(credentials.password);
      
      if (!isPasswordValid) {
        console.log('❌ AuthService: Invalid password for support user');
        
        // Increment login attempts
        user.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
          await user.save();
          
          return {
            success: false,
            message: 'Account is locked due to multiple failed login attempts. Please try again in 30 minutes.',
            statusCode: 423
          };
        }
        
        await user.save();
        
        return {
          success: false,
          message: 'Invalid credentials',
          statusCode: 401
        };
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = null;
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { id: user._id, tokenVersion: user.tokenVersion },
        process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key-change-this-in-production',
        { expiresIn: '7d' }
      );

      console.log('✅ AuthService: Support login successful');
      console.log('👤 Support user role:', user.role);

      // Log login attempt
      await this.logLoginAttempt(user._id, true, loginInfo);

      return {
        success: true,
        message: 'Support login successful',
        data: {
          user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive
          },
          tokens: {
            accessToken,
            refreshToken
          }
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('❌ AuthService: Support login error:', error);
      return {
        success: false,
        message: 'Support login failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - Token refresh result
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key-change-this-in-production');
      
      if (decoded.type !== 'refresh') {
        return {
          success: false,
          message: 'Invalid refresh token',
          statusCode: 401
        };
      }

      // Find user
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return {
          success: false,
          message: 'User not found or inactive',
          statusCode: 401
        };
      }

      // Generate new access token
      const newAccessToken = user.generateAuthToken();

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        message: 'Token refresh failed',
        error: error.message,
        statusCode: 401
      };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<Object>} - Password reset result
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.',
          statusCode: 200
        };
      }

      // Generate password reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send password reset email
      await EmailService.sendPasswordResetEmail(user, resetToken);

      return {
        success: true,
        message: 'Password reset link sent to your email',
        statusCode: 200
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: 'Failed to send password reset email',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Password reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Password reset result
   */
  async resetPassword(token, newPassword) {
    try {
      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid or expired reset token',
          statusCode: 400
        };
      }

      // Update password
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      user.passwordChangedAt = Date.now() - 1000;
      await user.save();

      return {
        success: true,
        message: 'Password reset successfully',
        statusCode: 200
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Password reset failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} - Email verification result
   */
  async verifyEmail(token) {
    try {
      // Hash the token to compare with stored hash
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with valid verification token
      const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid or expired verification token',
          statusCode: 400
        };
      }

      // Mark email as verified
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully',
        statusCode: 200
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Verify email with credentials
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} firstName - User first name
   * @param {string} lastName - User last name
   * @returns {Promise<Object>} - Email verification result
   */
  async verifyEmailWithCredentials(email, password, firstName, lastName) {
    try {
      // Find user with matching credentials
      const user = await User.findOne({ 
        email: email,
        firstName: firstName,
        lastName: lastName,
        role: 'superadmin'
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found with provided credentials',
          statusCode: 404
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid credentials provided',
          statusCode: 400
        };
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return {
          success: false,
          message: 'Email is already verified',
          statusCode: 400
        };
      }

      // Mark email as verified
      user.isEmailVerified = true;
      await user.save();

      return {
        success: true,
        message: 'Email verified successfully. You can now log in to your account.',
        statusCode: 200
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: 'Email verification failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Resend email verification
   * @param {string} email - User email
   * @returns {Promise<Object>} - Resend verification result
   */
  async resendEmailVerification(email) {
    try {
      const user = await User.findOne({ email });
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      if (user.isEmailVerified) {
        return {
          success: false,
          message: 'Email is already verified',
          statusCode: 400
        };
      }

      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await EmailService.sendEmailVerificationEmail(user, verificationToken);

      return {
        success: true,
        message: 'Email verification link sent',
        statusCode: 200
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} - Logout result
   */
  async logout() {
    try {
      // In a production environment, you might want to blacklist the token
      // For now, we'll just return success as the client should remove the token
      return {
        success: true,
        message: 'Logged out successfully',
        statusCode: 200
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'Logout failed',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Log login attempt
   * @param {string} userId - User ID
   * @param {boolean} success - Whether login was successful
   * @param {Object} loginInfo - Login information
   * @returns {Promise<void>}
   */
  async logLoginAttempt(userId, success, loginInfo = {}) {
    try {
      // Update user's last login if successful
      if (success) {
        await User.findByIdAndUpdate(userId, {
          lastLogin: new Date()
        });
      }
      
      // In a production environment, you might want to log this to a separate collection
      console.log(`Login attempt for user ${userId}: ${success ? 'SUCCESS' : 'FAILED'}`, {
        timestamp: new Date(),
        ipAddress: loginInfo.ipAddress,
        userAgent: loginInfo.userAgent
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  /**
   * Get current user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            avatar: user.avatar,
            language: user.language,
            theme: user.theme,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: 'Failed to get profile',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} - Update result
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Update allowed fields
      const allowedFields = ['firstName', 'lastName', 'phone', 'language', 'theme', 'pgId'];
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          user[field] = updateData[field];
        }
      });

      await user.save();

      return {
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            pgId: user.pgId,
            isEmailVerified: user.isEmailVerified,
            avatar: user.avatar,
            language: user.language,
            theme: user.theme
          }
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: 'Failed to update profile',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Unlock user account (superadmin only)
   * @param {string} userId - User ID to unlock
   * @returns {Promise<Object>} - Unlock result
   */
  async unlockUserAccount(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Reset login attempts and unlock account
      await User.findByIdAndUpdate(userId, {
        loginAttempts: 0,
        lockUntil: null
      });

      return {
        success: true,
        message: 'User account unlocked successfully',
        statusCode: 200
      };
    } catch (error) {
      console.error('Unlock user account error:', error);
      return {
        success: false,
        message: 'Failed to unlock user account',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get all users with lock status (superadmin only)
   * @returns {Promise<Object>} - Users list with lock status
   */
  async getUsersWithLockStatus() {
    try {
      const users = await User.find({}).select('firstName lastName email role isActive loginAttempts lockUntil createdAt');
      
      const usersWithLockStatus = users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        loginAttempts: user.loginAttempts,
        isLocked: user.lockUntil && user.lockUntil > Date.now(),
        lockUntil: user.lockUntil,
        createdAt: user.createdAt
      }));

      return {
        success: true,
        data: {
          users: usersWithLockStatus
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Get users with lock status error:', error);
      return {
        success: false,
        message: 'Failed to get users',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get current user with onboarding status
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User data with onboarding status
   */
  async getCurrentUser(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Get onboarding status
      const onboardingStatus = await OnboardingService.getOnboardingStatus(userId);
      
      return {
        success: true,
        data: {
          user,
          onboarding: onboardingStatus.success ? onboardingStatus.data : null
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        message: 'Failed to get current user',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Get all support staff members
   * @returns {Promise<Object>} - Support staff list
   */
  async getSupportStaff() {
    try {
      const supportStaff = await User.find({ role: 'support' })
        .select('firstName lastName email phone isActive lastLogin createdAt')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: supportStaff,
        statusCode: 200
      };
    } catch (error) {
      console.error('Get support staff error:', error);
      return {
        success: false,
        message: 'Failed to get support staff',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Delete a user (superadmin only)
   * @param {string} userId - User ID to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Prevent deletion of superadmin accounts
      if (user.role === 'superadmin') {
        return {
          success: false,
          message: 'Cannot delete superadmin accounts',
          statusCode: 403
        };
      }

      await User.findByIdAndDelete(userId);

      return {
        success: true,
        message: 'User deleted successfully',
        statusCode: 200
      };
    } catch (error) {
      console.error('Delete user error:', error);
      return {
        success: false,
        message: 'Failed to delete user',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Update user status (activate/deactivate)
   * @param {string} userId - User ID to update
   * @param {boolean} isActive - New status
   * @returns {Promise<Object>} - Update result
   */
  async updateUserStatus(userId, isActive) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Prevent deactivation of superadmin accounts
      if (user.role === 'superadmin' && !isActive) {
        return {
          success: false,
          message: 'Cannot deactivate superadmin accounts',
          statusCode: 403
        };
      }

      user.isActive = isActive;
      await user.save();

      return {
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        statusCode: 200
      };
    } catch (error) {
      console.error('Update user status error:', error);
      return {
        success: false,
        message: 'Failed to update user status',
        error: error.message,
        statusCode: 500
      };
    }
  }
}

module.exports = new AuthService(); 