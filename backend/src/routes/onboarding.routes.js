const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const OnboardingService = require('../services/onboarding.service');
const { validateOnboardingStep, validatePGConfiguration } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * @route   GET /api/onboarding/status
 * @desc    Get onboarding status for current user
 * @access  Private
 */
router.get('/status', authenticate, async (req, res) => {
  try {
    console.log('🔄 Onboarding Route: GET /status called for user:', req.user._id);
    const result = await OnboardingService.getOnboardingStatus(req.user._id);
    console.log('📤 Onboarding Route: Returning result:', {
      success: result.success,
      statusCode: result.statusCode,
      isCompleted: result.data?.isCompleted,
      currentStep: result.data?.currentStep
    });
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('❌ Onboarding Route: Get onboarding status route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get onboarding status',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/complete-step
 * @desc    Complete a specific onboarding step
 * @access  Private
 */
router.post('/complete-step', authenticate, validateOnboardingStep, async (req, res) => {
  try {
    const { stepId, data } = req.body;
    const result = await OnboardingService.completeStep(req.user._id, stepId, data);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Complete step route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete step',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/skip-step
 * @desc    Skip a specific onboarding step
 * @access  Private
 */
router.post('/skip-step', authenticate, async (req, res) => {
  try {
    const { stepId } = req.body;
    const result = await OnboardingService.skipStep(req.user._id, stepId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Skip step route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to skip step',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/update-profile
 * @desc    Update user profile during onboarding
 * @access  Private
 */
router.post('/update-profile', authenticate, async (req, res) => {
  try {
    const result = await OnboardingService.updateProfile(req.user._id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Update profile route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/configure-pg
 * @desc    Configure PG settings during onboarding
 * @access  Private
 */
router.post('/configure-pg', authenticate, validatePGConfiguration, async (req, res) => {
  try {
    const result = await OnboardingService.configurePG(req.user._id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Configure PG route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to configure PG',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/setup-branch
 * @desc    Setup branch during onboarding
 * @access  Private
 */
router.post('/setup-branch', authenticate, async (req, res) => {
  try {
    const result = await OnboardingService.setupBranch(req.user._id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Setup branch route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to setup branch',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/setup-payment-settings
 * @desc    Setup payment settings during onboarding
 * @access  Private
 */
router.post('/setup-payment-settings', authenticate, async (req, res) => {
  try {
    const result = await OnboardingService.setupPaymentSettings(req.user._id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Setup payment settings route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to setup payment settings',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/security-setup
 * @desc    Complete security setup (password change)
 * @access  Private
 */
router.post('/security-setup', authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
        statusCode: 400
      });
    }
    
    const result = await OnboardingService.completeSecuritySetup(req.user._id, newPassword);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Security setup route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete security setup',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/feature-tour
 * @desc    Complete feature tour
 * @access  Private
 */
router.post('/feature-tour', authenticate, async (req, res) => {
  try {
    const result = await OnboardingService.completeFeatureTour(req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Feature tour route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete feature tour',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/first-resident
 * @desc    Complete first resident setup
 * @access  Private
 */
router.post('/first-resident', authenticate, async (req, res) => {
  try {
    const result = await OnboardingService.completeFirstResident(req.user._id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('First resident route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete first resident setup',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/onboarding/payment-setup
 * @desc    Complete payment setup
 * @access  Private
 */
router.post('/payment-setup', authenticate, async (req, res) => {
  try {
    const result = await OnboardingService.completePaymentSetup(req.user._id, req.body);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Payment setup route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete payment setup',
      error: error.message
    });
  }
});

module.exports = router; 