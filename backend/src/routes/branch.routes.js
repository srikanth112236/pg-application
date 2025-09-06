const express = require('express');
const router = express.Router();
const { authenticate, adminOnly } = require('../middleware/auth.middleware');
const { validateBranch } = require('../middleware/validation.middleware');
const BranchService = require('../services/branch.service');
const activityService = require('../services/activity.service');

/**
 * @route   GET /api/branches
 * @desc    Get all active branches for user's PG
 * @access  Private
 */
router.get('/', authenticate, adminOnly, async (req, res) => {
  try {
    console.log(`🔍 Branch route: User data:`, {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      pgId: req.user.pgId
    });
    
    const pgId = req.user.pgId;
    
    if (!pgId) {
      console.log(`❌ Branch route: No pgId found for user ${req.user.email}`);
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    console.log(`📋 Fetching branches for PG: ${pgId}`);
    const result = await BranchService.getBranchesByPG(pgId);
    console.log(`📋 Branches service result:`, {
      success: result.success,
      dataLength: result.data?.length,
      statusCode: result.statusCode,
      message: result.message
    });
    
    if (result.data) {
      console.log(`📋 Branches fetched:`, result.data.map(b => ({ 
        id: b._id,
        name: b.name, 
        isDefault: b.isDefault,
        isActive: b.isActive 
      })));
    }
    
    // Add cache control headers
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('❌ Branch routes error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/branches/all
 * @desc    Get all branches (including inactive) for user's PG
 * @access  Private
 */
router.get('/all', authenticate, adminOnly, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const result = await BranchService.getAllBranchesByPG(pgId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/branches/default
 * @desc    Get default branch for user's PG
 * @access  Private
 */
router.get('/default', authenticate, adminOnly, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const result = await BranchService.getDefaultBranch(pgId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/branches/:branchId
 * @desc    Get branch by ID
 * @access  Private
 */
router.get('/:branchId', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await BranchService.getBranchById(req.params.branchId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/branches
 * @desc    Create new branch
 * @access  Private
 */
router.post('/', authenticate, adminOnly, validateBranch, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const branchData = {
      ...req.body,
      pgId
    };

    const result = await BranchService.createBranch(branchData, req.user._id);
    try {
      if (result?.success && result?.data) {
        await activityService.recordActivity({
          type: 'branch_create',
          title: 'Branch Created',
          description: `Branch "${result.data.name || ''}" created`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'branch',
          entityId: result.data._id,
          entityName: result.data.name,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   PUT /api/branches/:branchId
 * @desc    Update branch
 * @access  Private
 */
router.put('/:branchId', authenticate, adminOnly, validateBranch, async (req, res) => {
  try {
    const result = await BranchService.updateBranch(req.params.branchId, req.body, req.user._id);
    try {
      if (result?.success && result?.data) {
        await activityService.recordActivity({
          type: 'branch_update',
          title: 'Branch Updated',
          description: `Branch "${result.data.name || ''}" updated`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'branch',
          entityId: result.data._id,
          entityName: result.data.name,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/branches/:branchId
 * @desc    Delete branch
 * @access  Private
 */
router.delete('/:branchId', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await BranchService.deleteBranch(req.params.branchId, req.user._id);
    try {
      if (result?.success) {
        await activityService.recordActivity({
          type: 'branch_delete',
          title: 'Branch Deleted',
          description: `Branch deleted (ID: ${req.params.branchId})`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'branch',
          entityId: req.params.branchId,
          category: 'management',
          priority: 'high',
          status: 'success'
        });
      }
    } catch (_) {}
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/branches/:branchId/set-default
 * @desc    Set branch as default
 * @access  Private
 */
router.post('/:branchId/set-default', authenticate, adminOnly, async (req, res) => {
  try {
    console.log(`🔄 Setting default branch: ${req.params.branchId} for user: ${req.user._id}`);
    const result = await BranchService.setDefaultBranch(req.params.branchId, req.user._id);
    console.log(`✅ Set default branch result:`, result);
    try {
      if (result?.success && result?.data) {
        await activityService.recordActivity({
          type: 'branch_set_default',
          title: 'Default Branch Updated',
          description: `Default branch set to "${result.data.name || ''}"`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'branch',
          entityId: result.data._id,
          entityName: result.data.name,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/branches/:branchId/activate
 * @desc    Activate branch
 * @access  Private
 */
router.post('/:branchId/activate', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await BranchService.activateBranch(req.params.branchId, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/branches/:branchId/deactivate
 * @desc    Deactivate branch
 * @access  Private
 */
router.post('/:branchId/deactivate', authenticate, adminOnly, async (req, res) => {
  try {
    const result = await BranchService.deactivateBranch(req.params.branchId, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/branches/stats
 * @desc    Get branch statistics
 * @access  Private
 */
router.get('/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const result = await BranchService.getBranchStats(pgId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/branches/fix-index
 * @desc    Fix branch index issues
 * @access  Private (Admin only)
 */
router.post('/fix-index', authenticate, adminOnly, async (req, res) => {
  try {
    console.log('🔧 Admin requested index fix...');
    const result = await BranchService.fixBranchIndexIssues();
    
    if (result.success) {
      console.log('✅ Index fix completed successfully');
    } else {
      console.log('❌ Index fix failed:', result.message);
    }
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch fix index error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/branches/cleanup-duplicates
 * @desc    Clean up duplicate branches
 * @access  Private (Admin only)
 */
router.post('/cleanup-duplicates', authenticate, adminOnly, async (req, res) => {
  try {
    console.log('🧹 Admin requested duplicate cleanup...');
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user'
      });
    }

    const result = await BranchService.cleanupDuplicateBranches(pgId);
    
    if (result.success) {
      console.log('✅ Duplicate cleanup completed successfully');
    } else {
      console.log('❌ Duplicate cleanup failed:', result.message);
    }
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Branch cleanup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 