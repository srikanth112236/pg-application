const express = require('express');
const router = express.Router();
const residentService = require('../services/resident.service');
const { authenticate, adminOrSuperadmin } = require('../middleware/auth.middleware');
const { validateResident } = require('../middleware/validation.middleware');
const Resident = require('../models/resident.model'); // Added for new routes
const Room = require('../models/room.model'); // Added for new routes
const AllocationLetter = require('../models/allocationLetter.model');
const path = require('path');
const fs = require('fs');
const { uploadExcelFile, handleExcelUploadError } = require('../middleware/excelUpload.middleware');
const activityService = require('../services/activity.service');

// Get all residents for the user's PG
router.get('/', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    console.log('🔍 Residents API - User:', { userId: req.user._id, pgId: pgId, branchId: req.query.branchId });
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const { page = 1, limit = 10, status, search, gender, branchId } = req.query;
    const filters = {};
    
    // Handle status filter for moved out residents
    if (status) {
      if (status.includes(',')) {
        // Multiple statuses (e.g., 'inactive,moved_out')
        filters.status = { $in: status.split(',') };
        // For moved out residents, we need to include inactive residents
        if (status.includes('inactive') || status.includes('moved_out')) {
          filters.isActive = { $in: [true, false] }; // Include both active and inactive
        }
      } else {
        filters.status = status;
        // For single inactive status, include inactive residents
        if (status === 'inactive' || status === 'moved_out') {
          filters.isActive = { $in: [true, false] };
        }
      }
    }
    
    if (gender) filters.gender = gender;
    if (branchId) filters.branchId = branchId;

    const result = await residentService.getResidents(pgId, filters, parseInt(page), parseInt(limit));
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting residents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get residents',
      error: error.message
    });
  }
});

// Get resident by ID
router.get('/:residentId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.getResidentById(req.params.residentId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get resident',
      error: error.message
    });
  }
});

// Get comprehensive resident details including payments, room history, and allocation
router.get('/:residentId/details', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.getResidentComprehensiveDetails(req.params.residentId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting resident details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get resident details',
      error: error.message
    });
  }
});

// Create new resident
router.post('/', authenticate, adminOrSuperadmin, validateResident, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const residentData = {
      ...req.body,
      pgId
    };

    const result = await residentService.createResident(residentData, req.user._id);
    try {
      if (result?.success && result?.data) {
        await activityService.recordActivity({
          type: 'resident_create',
          title: 'Resident Created',
          description: `Resident "${result.data.firstName || ''} ${result.data.lastName || ''}" added`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'resident',
          entityId: result.data._id,
          entityName: `${result.data.firstName || ''} ${result.data.lastName || ''}`.trim(),
          category: 'management',
          priority: 'high',
          status: 'success'
        });
      }
    } catch (_) {}
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error creating resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create resident',
      error: error.message
    });
  }
});

// Update resident
router.put('/:residentId', authenticate, adminOrSuperadmin, validateResident, async (req, res) => {
  try {
    const result = await residentService.updateResident(req.params.residentId, req.body, req.user._id);
    try {
      if (result?.success && result?.data) {
        await activityService.recordActivity({
          type: 'resident_update',
          title: 'Resident Updated',
          description: `Resident updated (ID: ${req.params.residentId})`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'resident',
          entityId: req.params.residentId,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error updating resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update resident',
      error: error.message
    });
  }
});

// Delete resident
router.delete('/:residentId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.deleteResident(req.params.residentId, req.user._id);
    try {
      if (result?.success) {
        await activityService.recordActivity({
          type: 'resident_delete',
          title: 'Resident Deleted',
          description: `Resident deleted (ID: ${req.params.residentId})`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'resident',
          entityId: req.params.residentId,
          category: 'management',
          priority: 'high',
          status: 'success'
        });
      }
    } catch (_) {}
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error deleting resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete resident',
      error: error.message
    });
  }
});

// Assign resident to room during onboarding
router.post('/:residentId/assign-room', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { roomId, bedNumber, checkInDate, contractStartDate } = req.body;
    
    if (!roomId || !checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and check-in date are required'
      });
    }

    const onboardingData = {
      bedNumber: bedNumber || 1,
      checkInDate,
      contractStartDate: contractStartDate || checkInDate
    };

    const result = await residentService.assignResidentToRoom(
      req.params.residentId,
      roomId,
      onboardingData,
      req.user._id
    );
    try {
      if (result?.success) {
        await activityService.recordActivity({
          type: 'resident_move_in',
          title: 'Resident Assigned to Room',
          description: `Resident ${req.params.residentId} assigned to room ${roomId}`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'resident',
          entityId: req.params.residentId,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error assigning resident to room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign resident to room',
      error: error.message
    });
  }
});

// Get residents by room
router.get('/room/:roomId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.getResidentsByRoom(req.params.roomId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting residents by room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get residents by room',
      error: error.message
    });
  }
});

// Get room details with beds
router.get('/room/:roomId/beds', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.getRoomWithBeds(req.params.roomId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting room with beds:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get room details',
      error: error.message
    });
  }
});

// Get resident statistics
router.get('/stats/overview', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const { branchId } = req.query;
    const filters = {};
    if (branchId) filters.branchId = branchId;

    const result = await residentService.getResidentStats(pgId, filters);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting resident stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get resident statistics',
      error: error.message
    });
  }
});

// Search residents
router.get('/search/query', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const { q: searchTerm, status, gender, branchId } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const filters = {};
    if (status) filters.status = status;
    if (gender) filters.gender = gender;
    if (branchId) filters.branchId = branchId;

    const result = await residentService.searchResidents(pgId, searchTerm, filters);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error searching residents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search residents',
      error: error.message
    });
  }
});

// Export residents data
router.get('/export/data', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const { format = 'csv' } = req.query;
    const result = await residentService.exportResidents(pgId, format);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error exporting residents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to export residents',
      error: error.message
    });
  }
});

// Check room availability
router.get('/check-availability/:roomId/:bedNumber', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { roomId, bedNumber } = req.params;
    const { excludeResidentId } = req.query;

    const isAvailable = await residentService.checkRoomAvailability(roomId, parseInt(bedNumber), excludeResidentId);
    
    return res.status(200).json({
      success: true,
      data: {
        roomId,
        bedNumber: parseInt(bedNumber),
        isAvailable
      },
      message: isAvailable ? 'Room and bed are available' : 'Room or bed is not available',
      statusCode: 200
    });
  } catch (error) {
    console.error('Error checking room availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check room availability',
      error: error.message
    });
  }
});

// Get residents by status
router.get('/status/:status', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const { status } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await residentService.getResidents(pgId, { status }, parseInt(page), parseInt(limit));
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting residents by status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get residents by status',
      error: error.message
    });
  }
});

// Bulk operations
router.post('/bulk/status-update', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { residentIds, status } = req.body;
    
    if (!residentIds || !Array.isArray(residentIds) || residentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resident IDs array is required'
      });
    }

    if (!status || !['active', 'inactive', 'moved_out', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    // Update multiple residents
    const updatePromises = residentIds.map(residentId => 
      residentService.updateResident(residentId, { status }, req.user._id)
    );

    const results = await Promise.allSettled(updatePromises);
    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success).length;
    const failed = results.length - successful;

    return res.status(200).json({
      success: true,
      data: {
        total: results.length,
        successful,
        failed
      },
      message: `Updated ${successful} residents successfully${failed > 0 ? `, ${failed} failed` : ''}`,
      statusCode: 200
    });
  } catch (error) {
    console.error('Error bulk updating residents:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to bulk update residents',
      error: error.message
    });
  }
});

// Bulk upload route for residents
router.post('/bulk-upload', authenticate, adminOrSuperadmin, uploadExcelFile, handleExcelUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const uploadData = {
      file: req.file,
      branchId: req.body.branchId
    };
    
    const result = await residentService.bulkUploadResidents(uploadData, req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Error bulk uploading residents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk upload residents',
      error: error.message
    });
  }
});

// Get resident details with room assignment
router.get('/:id/details', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await Resident.findById(id).populate('roomId');
    
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    // Get room details if assigned
    let roomDetails = null;
    if (resident.roomId) {
      const room = await Room.findById(resident.roomId).populate('floorId');
      roomDetails = {
        roomNumber: room.roomNumber,
        floorName: room.floorId?.name,
        sharingType: room.sharingType,
        cost: room.cost
      };
    }

    const residentDetails = {
      ...resident.toObject(),
      roomNumber: roomDetails?.roomNumber,
      floorName: roomDetails?.floorName,
      sharingType: roomDetails?.sharingType,
      monthlyRent: roomDetails?.cost
    };

    res.json({
      success: true,
      data: residentDetails
    });
  } catch (error) {
    console.error('Error fetching resident details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resident details'
    });
  }
});

// Vacate resident
router.post('/:id/vacate', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { id } = req.params;
    const vacationData = req.body;

    const result = await residentService.vacateResident(id, vacationData);
    try {
      if (result?.success) {
        await activityService.recordActivity({
          type: 'offboarding_complete',
          title: 'Resident Vacated',
          description: `Resident ${id} vacated`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'resident',
          entityId: id,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    
    return res.status(200).json({
        success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Error vacating resident:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to vacate resident'
    });
  }
});

// Onboard resident to room
router.post('/onboard', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { 
      residentId, 
      roomId, 
      bedNumber, 
      sharingTypeId, 
      sharingTypeCost, 
      onboardingDate,
      advancePayment,
      rentPayment
    } = req.body;
    
    if (!residentId || !roomId || !bedNumber || !sharingTypeId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: residentId, roomId, bedNumber, sharingTypeId'
      });
    }

    // Get resident data to access existing check-in and contract dates
    const resident = await Resident.findById(residentId);
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    // Use existing dates from resident if available, otherwise use onboardingDate
    const checkInDate = resident.checkInDate || (onboardingDate ? new Date(onboardingDate) : new Date());
    const contractStartDate = resident.contractStartDate || (onboardingDate ? new Date(onboardingDate) : new Date());

    const result = await residentService.assignResidentToRoom(residentId, roomId, {
      bedNumber,
      sharingTypeId,
      sharingTypeCost,
      checkInDate: checkInDate,
      contractStartDate: contractStartDate,
      advancePayment,
      rentPayment
    }, req.user._id);

    // If successful, store allocation letter
    if (result.success) {
      try {
        const resident = await Resident.findById(residentId);
        
        // For now, we'll just log it
        console.log('Allocation letter generated:', allocationLetter);
      } catch (letterError) {
        console.error('Error generating allocation letter:', letterError);
        // Don't fail the onboarding if letter generation fails
      }
    }
    try {
      if (result?.success) {
        await activityService.recordActivity({
          type: 'onboarding_complete',
          title: 'Resident Onboarded',
          description: `Resident ${residentId} onboarded to room ${roomId}`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'resident',
          entityId: residentId,
          category: 'management',
          priority: 'high',
          status: 'success'
        });
      }
    } catch (_) {}

    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error onboarding resident:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to onboard resident',
      error: error.message
    });
  }
});

// Store allocation letter
router.post('/allocation-letter', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { residentId, fileName, allocationData } = req.body;
    
    // For now, just log the allocation letter
    console.log('Allocation letter stored:', {
      residentId,
      fileName,
      allocationData
    });

    return res.json({
      success: true,
      message: 'Allocation letter stored successfully'
    });
  } catch (error) {
    console.error('Error storing allocation letter:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to store allocation letter'
    });
  }
});

// Manual trigger for vacation processor
router.post('/process-vacations', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.processScheduledVacations();
    return res.status(200).json({
      success: true,
      message: 'Vacation processing initiated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error manually triggering vacation processor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to trigger vacation processor',
      error: error.message
    });
  }
});

// Get overdue vacations
router.get('/overdue-vacations', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.getOverdueVacations();
    
    return res.status(200).json({
      success: true,
      message: 'Overdue vacations retrieved successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Error getting overdue vacations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get overdue vacations'
    });
  }
});

// Get allocation letters for a resident
router.get('/:residentId/allocation-letters', authenticate, async (req, res) => {
  try {
    const allocationLetters = await AllocationLetter.find({
      residentId: req.params.residentId,
      status: 'active'
    }).sort({ createdAt: -1 });

    const formattedLetters = allocationLetters.map(letter => letter.getFormattedDetails());

    return res.status(200).json({
      success: true,
      data: formattedLetters
    });
  } catch (error) {
    console.error('Error fetching allocation letters:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch allocation letters',
      error: error.message
    });
  }
});

// Download allocation letter
router.get('/allocation-letter/:letterId/download', authenticate, async (req, res) => {
  try {
    const allocationLetter = await AllocationLetter.findById(req.params.letterId);
    
    if (!allocationLetter) {
      return res.status(404).json({
        success: false,
        message: 'Allocation letter not found'
      });
    }

    // Increment download count
    await allocationLetter.incrementDownload();

    // For now, we'll return the allocation data to regenerate the PDF
    // In production, you might want to store the actual PDF file
    return res.status(200).json({
      success: true,
      data: allocationLetter.allocationData,
      fileName: allocationLetter.fileName
    });
  } catch (error) {
    console.error('Error downloading allocation letter:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to download allocation letter',
      error: error.message
    });
  }
});

// Update payment status for a specific resident
router.put('/:residentId/payment-status', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.calculateAndUpdatePaymentStatus(req.params.residentId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
});

// Update payment status for all residents in PG
router.put('/payment-status/update-all', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user.'
      });
    }

    const result = await residentService.updateAllResidentsPaymentStatus(pgId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error updating all residents payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update all residents payment status',
      error: error.message
    });
  }
});

// Switch resident room
router.post('/:residentId/switch-room', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { newRoomId, newBedNumber, reason, trackHistory = true } = req.body;
    
    if (!newRoomId || !newBedNumber) {
      return res.status(400).json({
        success: false,
        message: 'New room ID and bed number are required'
      });
    }

    const switchData = {
      reason: reason || 'Room switch',
      trackHistory
    };

    const result = await residentService.switchResidentRoom(
      req.params.residentId,
      newRoomId,
      newBedNumber,
      switchData,
      req.user._id
    );
    try {
      if (result?.success) {
        await activityService.recordActivity({
          type: 'room_switch',
          title: 'Resident Room Switched',
          description: `Resident ${req.params.residentId} moved to room ${newRoomId}`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'resident',
          entityId: req.params.residentId,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error switching resident room:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to switch resident room',
      error: error.message
    });
  }
});

// Get available rooms for switching
router.get('/switch/available-rooms', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { pgId, currentRoomId, sharingType } = req.query;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'PG ID is required'
      });
    }

    const result = await residentService.getAvailableRoomsForSwitch(
      pgId,
      currentRoomId || null,
      sharingType || null
    );
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting available rooms for switching:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get available rooms for switching',
      error: error.message
    });
  }
});

// Get resident switch history
router.get('/:residentId/switch-history', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await residentService.getResidentSwitchHistory(req.params.residentId);
    
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Error getting resident switch history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get resident switch history',
      error: error.message
    });
  }
});

module.exports = router; 