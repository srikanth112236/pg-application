const Onboarding = require('../models/onboarding.model');
const User = require('../models/user.model');
const PG = require('../models/pg.model');
const Branch = require('../models/branch.model');
const PaymentInfo = require('../models/paymentInfo.model');
const activityService = require('./activity.service');

class OnboardingService {
  /**
   * Get onboarding status for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Onboarding status
   */
  async getOnboardingStatus(userId) {
    try {
      console.log('🔄 OnboardingService: Getting onboarding status for user:', userId);
      
      let onboarding = await Onboarding.findOne({ userId }).populate('userId');
      console.log('📊 OnboardingService: Found onboarding record:', !!onboarding);
      
      if (!onboarding) {
        console.log('🆕 OnboardingService: Creating new onboarding record for user:', userId);
        // Create onboarding record for existing users
        onboarding = await Onboarding.createForUser(userId);
        console.log('✅ OnboardingService: Created onboarding record:', onboarding._id);
      }

      const result = {
        success: true,
        data: {
          isCompleted: onboarding.isCompleted,
          currentStep: onboarding.currentStep,
          steps: onboarding.steps,
          startedAt: onboarding.startedAt,
          completedAt: onboarding.completedAt,
          skippedSteps: onboarding.skippedSteps
        },
        statusCode: 200
      };

      console.log('📤 OnboardingService: Returning onboarding status:', {
        isCompleted: result.data.isCompleted,
        currentStep: result.data.currentStep,
        stepsCount: result.data.steps.length
      });

      return result;
    } catch (error) {
      console.error('❌ OnboardingService: Get onboarding status error:', error);
      return {
        success: false,
        message: 'Failed to get onboarding status',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Complete a specific onboarding step
   * @param {string} userId - User ID
   * @param {string} stepId - Step ID to complete
   * @param {Object} data - Step completion data
   * @returns {Promise<Object>} - Completion result
   */
  async completeStep(userId, stepId, data = {}) {
    try {
      let onboarding = await Onboarding.findOne({ userId });
      
      if (!onboarding) {
        onboarding = await Onboarding.createForUser(userId);
      }

      await onboarding.completeStep(stepId, data);

      return {
        success: true,
        data: {
          isCompleted: onboarding.isCompleted,
          currentStep: onboarding.currentStep,
          completedStep: stepId
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Complete step error:', error);
      return {
        success: false,
        message: 'Failed to complete step',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Skip a specific onboarding step
   * @param {string} userId - User ID
   * @param {string} stepId - Step ID to skip
   * @returns {Promise<Object>} - Skip result
   */
  async skipStep(userId, stepId) {
    try {
      let onboarding = await Onboarding.findOne({ userId });
      
      if (!onboarding) {
        onboarding = await Onboarding.createForUser(userId);
      }

      await onboarding.skipStep(stepId);

      return {
        success: true,
        data: {
          isCompleted: onboarding.isCompleted,
          currentStep: onboarding.currentStep,
          skippedStep: stepId
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Skip step error:', error);
      return {
        success: false,
        message: 'Failed to skip step',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Update user profile during onboarding
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Update result
   */
  async updateProfile(userId, profileData) {
    try {
      // Update user profile
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address
        },
        { new: true }
      );

      if (!updatedUser) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Complete profile step
      await this.completeStep(userId, 'profile_completion', profileData);

      return {
        success: true,
        data: {
          user: updatedUser,
          message: 'Profile updated successfully'
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
   * Configure PG settings
   * @param {string} userId - User ID
   * @param {Object} pgData - PG configuration data
   * @returns {Promise<Object>} - Configuration result
   */
  async configurePG(userId, pgData) {
    try {
      console.log('🏠 OnboardingService: Configuring PG for user:', userId);
      console.log('📊 PG Data:', pgData);

      // Get user data for PG creation
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Validate required fields
      if (!pgData.name) {
        return {
          success: false,
          message: 'PG name is required',
          statusCode: 400
        };
      }

      if (!pgData.sharingTypes || !Array.isArray(pgData.sharingTypes) || pgData.sharingTypes.length === 0) {
        return {
          success: false,
          message: 'At least one sharing type is required',
          statusCode: 400
        };
      }

      // Find or create PG for this admin
      let pg = await PG.findOne({ createdBy: userId });
      
      if (!pg) {
        console.log('🆕 OnboardingService: Creating new PG for admin');
        // Create new PG with user data
        pg = new PG({
          name: pgData.name,
          address: user.address || '',
          phone: user.phone || '',
          email: user.email || '',
          sharingTypes: pgData.sharingTypes,
          admin: userId, // Set the current user as admin
          createdBy: userId
        });
        
        console.log('📝 OnboardingService: PG data to save:', {
          name: pg.name,
          address: pg.address,
          phone: pg.phone,
          email: pg.email,
          admin: pg.admin,
          createdBy: pg.createdBy
        });
        
        await pg.save();
        console.log('✅ OnboardingService: Created new PG:', pg._id);
      } else {
        console.log('📝 OnboardingService: Updating existing PG:', pg._id);
        // Update existing PG
        pg.name = pgData.name;
        pg.sharingTypes = pgData.sharingTypes;
        // Ensure admin is set
        if (!pg.admin) {
          pg.admin = userId;
        }
        await pg.save();
      }

      // Update user's pgId field
      if (user) {
        user.pgId = pg._id;
        await user.save();
        console.log('✅ OnboardingService: Associated PG with user');
      }

      // Complete PG configuration step
      await this.completeStep(userId, 'pg_configuration', {
        name: pgData.name,
        sharingTypes: pgData.sharingTypes,
        pgId: pg._id
      });

      // Record activity
      try {
        await activityService.recordActivity({
          type: 'pg_create',
          title: 'PG Created',
          description: `PG "${pgData.name}" created during onboarding`,
          userId: userId,
          userEmail: user.email,
          userRole: user.role,
          entityType: 'pg',
          entityId: pg._id,
          entityName: pgData.name,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      } catch (error) {
        console.error('Error recording PG creation activity:', error);
      }

      return {
        success: true,
        data: {
          pg: pg,
          message: 'PG configured successfully'
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('❌ Configure PG error:', error);
      return {
        success: false,
        message: 'Failed to configure PG',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Setup branch during onboarding
   * @param {string} userId - User ID
   * @param {Object} branchData - Branch configuration data
   * @returns {Promise<Object>} - Branch setup result
   */
  async setupBranch(userId, branchData) {
    try {
      console.log('🏢 OnboardingService: Setting up branch for user:', userId);
      console.log('📊 Branch Data:', branchData);

      // Get user data
      const user = await User.findById(userId);
      if (!user || !user.pgId) {
        return {
          success: false,
          message: 'User or PG not found. Please complete PG configuration first.',
          statusCode: 400
        };
      }

      // Validate required fields
      if (!branchData.name) {
        return {
          success: false,
          message: 'Branch name is required',
          statusCode: 400
        };
      }

      // Check if any branch already exists for this PG (not just default)
      let branch = await Branch.findOne({ 
        pgId: user.pgId, 
        isActive: true 
      });

      if (branch) {
        console.log('📝 OnboardingService: Updating existing branch:', branch._id);
        // Update existing branch and make it default if it isn't already
        branch.name = branchData.name;
        branch.address = branchData.address || branch.address;
        branch.maintainer = branchData.maintainer || branch.maintainer;
        branch.contact = branchData.contact || branch.contact;
        branch.capacity = branchData.capacity || branch.capacity;
        branch.amenities = branchData.amenities || branch.amenities;
        branch.isDefault = true; // Ensure it's marked as default
        branch.updatedBy = userId;
        
        await branch.save();
        console.log('✅ OnboardingService: Updated existing branch');
      } else {
        console.log('🆕 OnboardingService: Creating new default branch');
        // Create new branch
        branch = new Branch({
          name: branchData.name,
          address: branchData.address || {},
          maintainer: branchData.maintainer || {},
          contact: branchData.contact || {},
          capacity: branchData.capacity || { totalRooms: 0, totalBeds: 0, availableRooms: 0 },
          amenities: branchData.amenities || [],
          status: 'active',
          isDefault: true, // First branch is always default
          isActive: true,
          pgId: user.pgId,
          createdBy: userId
        });

        await branch.save();
        console.log('✅ OnboardingService: Created new default branch:', branch._id);
      }

      // Complete branch setup step
      await this.completeStep(userId, 'branch_setup', {
        name: branchData.name,
        branchId: branch._id,
        isDefault: true
      });

      // Record activity
      try {
        await activityService.recordActivity({
          type: 'branch_create',
          title: 'Branch Setup',
          description: `Branch "${branchData.name}" setup during onboarding`,
          userId: userId,
          userEmail: user.email,
          userRole: user.role,
          entityType: 'branch',
          entityId: branch._id,
          entityName: branchData.name,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      } catch (error) {
        console.error('Error recording branch creation activity:', error);
      }

      return {
        success: true,
        data: {
          branch: branch,
          message: 'Branch setup completed successfully'
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('❌ Setup branch error:', error);
      return {
        success: false,
        message: 'Failed to setup branch',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Setup payment settings during onboarding
   * @param {string} userId - User ID
   * @param {Object} paymentData - Payment configuration data
   * @returns {Promise<Object>} - Payment setup result
   */
  async setupPaymentSettings(userId, paymentData) {
    try {
      console.log('💳 OnboardingService: Setting up payment settings for user:', userId);
      console.log('📊 Payment Data:', paymentData);

      // Get user data
      const user = await User.findById(userId);
      if (!user || !user.pgId) {
        return {
          success: false,
          message: 'User or PG not found. Please complete previous steps first.',
          statusCode: 400
        };
      }

      // Get the default branch
      const branch = await Branch.findOne({ pgId: user.pgId, isDefault: true });
      if (!branch) {
        return {
          success: false,
          message: 'No default branch found. Please complete branch setup first.',
          statusCode: 400
        };
      }

      // Validate required fields
      if (!paymentData.upiId) {
        return {
          success: false,
          message: 'UPI ID is required',
          statusCode: 400
        };
      }

      // Check if payment info already exists for this branch
      let paymentInfo = await PaymentInfo.findOne({ 
        branchId: branch._id, 
        isActive: true 
      });

      if (paymentInfo) {
        console.log('📝 OnboardingService: Updating existing payment info:', paymentInfo._id);
        // Update existing payment info
        paymentInfo.upiId = paymentData.upiId;
        paymentInfo.upiName = paymentData.upiName || user.firstName + ' ' + user.lastName;
        paymentInfo.accountHolderName = paymentData.accountHolderName || user.firstName + ' ' + user.lastName;
        paymentInfo.bankName = paymentData.bankName || '';
        paymentInfo.accountNumber = paymentData.accountNumber || '';
        paymentInfo.ifscCode = paymentData.ifscCode || '';
        paymentInfo.gpayNumber = paymentData.gpayNumber || '';
        paymentInfo.paytmNumber = paymentData.paytmNumber || '';
        paymentInfo.phonepeNumber = paymentData.phonepeNumber || '';
        paymentInfo.paymentInstructions = paymentData.paymentInstructions || 'Please make payment and upload screenshot for verification.';
        paymentInfo.perDayCost = paymentData.perDayCost || 0;
        paymentInfo.advanceAmount = paymentData.advanceAmount || 0;
        paymentInfo.pgRules = paymentData.pgRules || [];
        paymentInfo.updatedBy = userId;
        
        await paymentInfo.save();
        console.log('✅ OnboardingService: Updated existing payment info');
      } else {
        console.log('🆕 OnboardingService: Creating new payment info');
        // Create new payment info
        paymentInfo = new PaymentInfo({
          pgId: user.pgId,
          branchId: branch._id,
          upiId: paymentData.upiId,
          upiName: paymentData.upiName || user.firstName + ' ' + user.lastName,
          accountHolderName: paymentData.accountHolderName || user.firstName + ' ' + user.lastName,
          bankName: paymentData.bankName || '',
          accountNumber: paymentData.accountNumber || '',
          ifscCode: paymentData.ifscCode || '',
          gpayNumber: paymentData.gpayNumber || '',
          paytmNumber: paymentData.paytmNumber || '',
          phonepeNumber: paymentData.phonepeNumber || '',
          paymentInstructions: paymentData.paymentInstructions || 'Please make payment and upload screenshot for verification.',
          perDayCost: paymentData.perDayCost || 0,
          advanceAmount: paymentData.advanceAmount || 0,
          pgRules: paymentData.pgRules || [],
          isActive: true,
          createdBy: userId
        });

        await paymentInfo.save();
        console.log('✅ OnboardingService: Created new payment info:', paymentInfo._id);
      }

      // Complete payment settings step
      await this.completeStep(userId, 'payment_settings', {
        upiId: paymentData.upiId,
        paymentInfoId: paymentInfo._id,
        branchId: branch._id
      });

      // Record activity
      try {
        await activityService.recordActivity({
          type: 'payment_setup',
          title: 'Payment Settings Updated',
          description: `Payment settings configured for branch "${branch.name}" during onboarding`,
          userId: userId,
          userEmail: user.email,
          userRole: user.role,
          entityType: 'payment_info',
          entityId: paymentInfo._id,
          entityName: `Payment for ${branch.name}`,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      } catch (error) {
        console.error('Error recording payment setup activity:', error);
      }

      return {
        success: true,
        data: {
          paymentInfo: paymentInfo,
          message: 'Payment settings configured successfully'
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('❌ Setup payment settings error:', error);
      return {
        success: false,
        message: 'Failed to setup payment settings',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Complete security setup and mark onboarding as complete
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Security setup result
   */
  async completeSecuritySetup(userId, newPassword) {
    try {
      // Handle both string and object formats
      const password = typeof newPassword === 'string' ? newPassword : newPassword?.newPassword;
      
      if (!password) {
        return {
          success: false,
          message: 'New password is required',
          statusCode: 400
        };
      }

      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      // Update password
      user.password = password;
      await user.save();

      // Complete security step and mark entire onboarding as complete
      let onboarding = await Onboarding.findOne({ userId });
      
      if (!onboarding) {
        onboarding = await Onboarding.createForUser(userId);
      }

      // Complete the security step
      await onboarding.completeStep('security_setup', { passwordChanged: true });
      
      // Mark entire onboarding as complete (since this is the last step)
      onboarding.isCompleted = true;
      onboarding.completedAt = new Date();
      onboarding.currentStep = 'completed';
      await onboarding.save();

      // Get updated onboarding status
      const updatedOnboarding = await Onboarding.findOne({ userId }).populate('userId');

      return {
        success: true,
        data: {
          isCompleted: updatedOnboarding.isCompleted,
          currentStep: updatedOnboarding.currentStep,
          steps: updatedOnboarding.steps,
          startedAt: updatedOnboarding.startedAt,
          completedAt: updatedOnboarding.completedAt,
          skippedSteps: updatedOnboarding.skippedSteps,
          message: 'Security setup completed successfully. Please log in again with your new password.'
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Security setup error:', error);
      return {
        success: false,
        message: 'Failed to complete security setup',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Complete feature tour
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Tour completion result
   */
  async completeFeatureTour(userId) {
    try {
      await this.completeStep(userId, 'feature_tour', { tourCompleted: true });

      return {
        success: true,
        data: {
          message: 'Feature tour completed'
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Feature tour error:', error);
      return {
        success: false,
        message: 'Failed to complete feature tour',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Complete first resident setup
   * @param {string} userId - User ID
   * @param {Object} residentData - First resident data
   * @returns {Promise<Object>} - Resident setup result
   */
  async completeFirstResident(userId, residentData) {
    try {
      // This would integrate with resident creation
      // For now, just mark step as complete
      await this.completeStep(userId, 'first_resident', residentData);

      return {
        success: true,
        data: {
          message: 'First resident setup completed'
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('First resident error:', error);
      return {
        success: false,
        message: 'Failed to complete first resident setup',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Complete payment setup
   * @param {string} userId - User ID
   * @param {Object} paymentData - Payment configuration data
   * @returns {Promise<Object>} - Payment setup result
   */
  async completePaymentSetup(userId, paymentData) {
    try {
      // This would integrate with payment configuration
      // For now, just mark step as complete
      await this.completeStep(userId, 'payment_setup', paymentData);

      return {
        success: true,
        data: {
          message: 'Payment setup completed'
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Payment setup error:', error);
      return {
        success: false,
        message: 'Failed to complete payment setup',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Check if user needs onboarding
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} - True if onboarding needed
   */
  async needsOnboarding(userId) {
    try {
      const onboarding = await Onboarding.findOne({ userId });
      
      if (!onboarding) {
        return true; // New user needs onboarding
      }

      return !onboarding.isCompleted;
    } catch (error) {
      console.error('Check onboarding needs error:', error);
      return true; // Default to needing onboarding on error
    }
  }
}

module.exports = new OnboardingService(); 