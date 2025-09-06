const express = require('express');
const { authenticate, adminOrSuperadmin, superadminOnly } = require('../middleware/auth.middleware');
const { validateFloor, validateRoom, validatePG } = require('../middleware/validation.middleware');
const { uploadPGImages, uploadExcelFile, handleExcelUploadError } = require('../middleware/fileUpload.middleware');
const PGService = require('../services/pg.service');
const FloorService = require('../services/floor.service');
const RoomService = require('../services/room.service');
const Branch = require('../models/branch.model');
const Floor = require('../models/floor.model');
const Room = require('../models/room.model');
const activityService = require('../services/activity.service');

const router = express.Router();

// Create an instance of PGService
const pgService = new PGService();

// Test email endpoint
router.post('/test-email', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const emailService = require('../services/email.service');
    await emailService.sendTestEmail(req.body);
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all PGs (for superadmin)
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, city, state } = req.query;
    
    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (city) filters.city = city;
    if (state) filters.state = state;

    const result = await pgService.getAllPGs(filters, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Error getting PGs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch PGs',
      error: error.message
    });
  }
});

// Floor Routes - MUST COME BEFORE /:pgId ROUTES
// Get all floors for the user's PG (with optional branch filtering)
router.get('/floors', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    // Check if branchId is provided in query params
    const { branchId } = req.query;
    let targetBranchId = branchId;

    // If no branchId provided, use default branch
    if (!targetBranchId) {
      const defaultBranch = await Branch.findOne({ pgId, isDefault: true, isActive: true });
      if (!defaultBranch) {
        return res.status(400).json({
          success: false,
          message: 'No default branch found. Please set up a default branch first or specify a branchId.'
        });
      }
      targetBranchId = defaultBranch._id;
    } else {
      // Verify that the provided branchId belongs to the user's PG
      const branch = await Branch.findOne({ _id: branchId, pgId, isActive: true });
      if (!branch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID or branch not found for your PG.'
        });
      }
    }

    const floors = await Floor.find({ 
      pgId, 
      branchId: targetBranchId,
      isActive: true 
    })
    .populate('branchId', 'name address')
    .sort({ createdAt: -1 });

    // Add branch information to floors for frontend filtering
    const enhancedFloors = floors.map(floor => ({
      ...floor.toObject(),
      branchName: floor.branchId?.name || 'Unknown Branch'
    }));

    return res.status(200).json({
      success: true,
      data: enhancedFloors,
      message: 'Floors retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting floors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get floors',
      error: error.message
    });
  }
});

router.get('/floors/:floorId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await FloorService.getFloorById(req.params.floorId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Floor routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/floors', authenticate, adminOrSuperadmin, validateFloor, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const floorData = {
      ...req.body,
      pgId
    };

    const result = await FloorService.createFloor(floorData, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Floor routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/floors/:floorId', authenticate, adminOrSuperadmin, validateFloor, async (req, res) => {
  try {
    const result = await FloorService.updateFloor(req.params.floorId, req.body, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Floor routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/floors/:floorId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await FloorService.deleteFloor(req.params.floorId, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Floor routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Room Routes - MUST COME BEFORE /:pgId ROUTES
// Get all rooms for the user's PG (Enhanced for Room Availability, with optional branch filtering)
router.get('/rooms', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    // Check if branchId is provided in query params
    const { branchId } = req.query;
    let targetBranchId = branchId;

    // If no branchId provided, use default branch
    if (!targetBranchId) {
      const defaultBranch = await Branch.findOne({ pgId, isDefault: true, isActive: true });
      if (!defaultBranch) {
        return res.status(400).json({
          success: false,
          message: 'No default branch found. Please set up a default branch first or specify a branchId.'
        });
      }
      targetBranchId = defaultBranch._id;
    } else {
      // Verify that the provided branchId belongs to the user's PG
      const branch = await Branch.findOne({ _id: branchId, pgId, isActive: true });
      if (!branch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID or branch not found for your PG.'
        });
      }
    }

    const rooms = await Room.find({ 
      pgId, 
      branchId: targetBranchId,
      isActive: true 
    })
    .populate('floorId', 'name')
    .populate('branchId', 'name address')
    .populate({
      path: 'beds.occupiedBy',
      select: 'firstName lastName status noticeDays checkOutDate contractEndDate',
      model: 'Resident'
    })
    .sort({ createdAt: -1 });

    // Enhance room data with calculated bed status and room status
    const enhancedRooms = rooms.map(room => {
      const roomData = room.toObject();
      
      // Calculate bed status for each bed
      roomData.beds = roomData.beds.map(bed => {
        const bedData = { ...bed };
        
        if (bed.isOccupied && bed.occupiedBy) {
          // Add resident status and notice period info
          bedData.residentStatus = bed.occupiedBy.status;
          bedData.resident = {
            _id: bed.occupiedBy._id,
            firstName: bed.occupiedBy.firstName,
            lastName: bed.occupiedBy.lastName,
            status: bed.occupiedBy.status,
            noticeDays: bed.occupiedBy.noticeDays,
            checkOutDate: bed.occupiedBy.checkOutDate,
            contractEndDate: bed.occupiedBy.contractEndDate
          };
          
          // Remove the populated occupiedBy field to avoid duplication
          delete bedData.occupiedBy;
        } else {
          bedData.residentStatus = 'available';
          bedData.resident = null;
        }
        
        return bedData;
      });
      
      // Calculate room-level status based on bed statuses
      const occupiedBeds = roomData.beds.filter(bed => bed.isOccupied).length;
      const noticePeriodBeds = roomData.beds.filter(bed => 
        bed.isOccupied && bed.residentStatus === 'notice_period'
      ).length;
      
      if (occupiedBeds === 0) {
        roomData.roomStatus = 'fully_available';
      } else if (occupiedBeds === roomData.numberOfBeds) {
        if (noticePeriodBeds > 0) {
          roomData.roomStatus = 'notice_period';
        } else {
          roomData.roomStatus = 'fully_occupied';
        }
      } else {
        if (noticePeriodBeds > 0) {
          roomData.roomStatus = 'notice_period';
        } else {
          roomData.roomStatus = 'partially_occupied';
        }
      }
      
      // Add calculated fields
      roomData.occupiedBeds = occupiedBeds;
      roomData.availableBeds = roomData.numberOfBeds - occupiedBeds;
      roomData.noticePeriodBeds = noticePeriodBeds;
      
      return roomData;
    });

    return res.status(200).json({
      success: true,
      data: enhancedRooms,
      message: 'Rooms retrieved successfully',
      metadata: {
        totalRooms: enhancedRooms.length,
        totalBeds: enhancedRooms.reduce((sum, room) => sum + room.numberOfBeds, 0),
        availableBeds: enhancedRooms.reduce((sum, room) => sum + room.availableBeds, 0),
        occupiedBeds: enhancedRooms.reduce((sum, room) => sum + room.occupiedBeds, 0),
        noticePeriodBeds: enhancedRooms.reduce((sum, room) => sum + room.noticePeriodBeds, 0),
        occupancyRate: enhancedRooms.reduce((sum, room) => sum + room.occupiedBeds, 0) / 
                      enhancedRooms.reduce((sum, room) => sum + room.numberOfBeds, 0) * 100
      }
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get rooms',
      error: error.message
    });
  }
});

// Get rooms by floor
router.get('/rooms/floor/:floorId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await RoomService.getRoomsByFloor(req.params.floorId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Room routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get available rooms - MUST COME BEFORE /rooms/:roomId
router.get('/rooms/available', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { sharingType } = req.query;
    const result = await RoomService.getAvailableRooms(req.user.pgId, sharingType);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Available rooms error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Auto-assign notice period beds after expiry
router.post('/rooms/auto-assign-notice-period', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { roomId, bedNumber, residentId } = req.body;
    
    if (!roomId || !bedNumber || !residentId) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, bed number, and resident ID are required'
      });
    }
    
    const result = await RoomService.autoAssignNoticePeriodBed(roomId, bedNumber, residentId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Auto-assign notice period bed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reserve notice period bed for future assignment
router.post('/rooms/reserve-notice-period-bed', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { roomId, bedNumber, residentId, expectedAvailabilityDate } = req.body;
    
    if (!roomId || !bedNumber || !residentId || !expectedAvailabilityDate) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, bed number, resident ID, and expected availability date are required'
      });
    }
    
    const result = await RoomService.reserveNoticePeriodBed(roomId, bedNumber, residentId, expectedAvailabilityDate);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Reserve notice period bed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Process expired notice period beds (admin trigger)
router.post('/rooms/process-expired-notice-periods', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const NoticePeriodService = require('../services/noticePeriod.service');
    const result = await NoticePeriodService.processExpiredNoticePeriodBeds();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          processedCount: result.processedCount
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to process expired notice periods',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Process expired notice periods error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get pending notice period bed reservations
router.get('/rooms/pending-reservations', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const NoticePeriodService = require('../services/noticePeriod.service');
    const result = await NoticePeriodService.getPendingReservations();
    
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        count: result.count
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to get pending reservations',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Get pending reservations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/rooms/:roomId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await RoomService.getRoomById(req.params.roomId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Room routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/rooms', authenticate, adminOrSuperadmin, validateRoom, async (req, res) => {
  try {
    const pgId = req.user.pgId;
    
    if (!pgId) {
      return res.status(400).json({
        success: false,
        message: 'No PG associated with this user. Please contact superadmin to assign a PG or complete your PG setup.'
      });
    }

    const roomData = {
      ...req.body,
      pgId
    };

    const result = await RoomService.createRoom(roomData, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Room routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.put('/rooms/:roomId', authenticate, adminOrSuperadmin, validateRoom, async (req, res) => {
  try {
    const result = await RoomService.updateRoom(req.params.roomId, req.body, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Room routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/rooms/:roomId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await RoomService.deleteRoom(req.params.roomId, req.user._id);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Room routes error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Stats routes
router.get('/floors/stats', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await FloorService.getFloorStats(req.user.pgId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Floor stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/rooms/stats', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await RoomService.getRoomStats(req.user.pgId);
    return res.status(result.statusCode).json(result);
  } catch (error) {
    console.error('Room stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});



// Get sharing types
router.get('/sharing-types', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const sharingTypes = [
      { id: '1-sharing', name: 'Single Occupancy', description: 'One person per room', cost: 8000 },
      { id: '2-sharing', name: 'Double Sharing', description: 'Two people per room', cost: 6000 },
      { id: '3-sharing', name: 'Triple Sharing', description: 'Three people per room', cost: 5000 },
      { id: '4-sharing', name: 'Quad Sharing', description: 'Four people per room', cost: 4000 }
    ];
    
    return res.status(200).json({
      success: true,
      data: sharingTypes,
      message: 'Sharing types retrieved successfully'
    });
  } catch (error) {
    console.error('Sharing types error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get PG by ID - MUST COME AFTER SPECIFIC ROUTES
router.get('/:pgId', authenticate, async (req, res) => {
  try {
    const result = await pgService.getPGById(req.params.pgId);
    res.json(result);
  } catch (error) {
    console.error('Error getting PG:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PG',
      error: error.message
    });
  }
});

// Create new PG (superadmin only)
router.post('/', authenticate, validatePG, async (req, res) => {
  try {
    // Check if user is superadmin
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only superadmin can create PGs.'
      });
    }

    const result = await pgService.createPG(req.body, req.user._id);
    try {
      if (result?.success && result?.data) {
        await activityService.recordActivity({
          type: 'pg_create',
          title: 'PG Created',
          description: `PG "${result.data.name || req.body.name || ''}" created`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'pg',
          entityId: result.data._id,
          entityName: result.data.name,
          category: 'management',
          priority: 'high',
          status: 'success'
        });
      }
    } catch (_) {}
    res.status(result.statusCode || 201).json(result);
  } catch (error) {
    console.error('Error creating PG:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create PG',
      error: error.message
    });
  }
});

// Update PG
router.put('/:pgId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await pgService.updatePG(req.params.pgId, req.body, req.user._id);
    try {
      if (result?.success && result?.data) {
        await activityService.recordActivity({
          type: 'pg_update',
          title: 'PG Updated',
          description: `PG "${result.data.name || ''}" updated`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'pg',
          entityId: result.data._id,
          entityName: result.data.name,
          category: 'management',
          priority: 'normal',
          status: 'success'
        });
      }
    } catch (_) {}
    res.json(result);
  } catch (error) {
    console.error('Error updating PG:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update PG',
      error: error.message
    });
  }
});

// Delete PG
router.delete('/:pgId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await pgService.deletePG(req.params.pgId, req.user._id);
    try {
      if (result?.success) {
        await activityService.recordActivity({
          type: 'pg_delete',
          title: 'PG Deleted',
          description: `PG deleted (ID: ${req.params.pgId})`,
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: req.user.role,
          entityType: 'pg',
          entityId: req.params.pgId,
          category: 'management',
          priority: 'high',
          status: 'success'
        });
      }
    } catch (_) {}
    res.json(result);
  } catch (error) {
    console.error('Error deleting PG:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete PG',
      error: error.message
    });
  }
});

// Get PG analytics
router.get('/:pgId/analytics', authenticate, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const result = await pgService.getPGAnalytics(req.params.pgId, period);
    res.json(result);
  } catch (error) {
    console.error('Error getting PG analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PG analytics',
      error: error.message
    });
  }
});

// Get PG stats
router.get('/:pgId/stats', authenticate, async (req, res) => {
  try {
    const result = await pgService.getPGStats(req.params.pgId);
    res.json(result);
  } catch (error) {
    console.error('Error getting PG stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PG stats',
      error: error.message
    });
  }
});

// Get PG dashboard
router.get('/:pgId/dashboard', authenticate, async (req, res) => {
  try {
    const result = await pgService.getPGDashboard(req.params.pgId);
    res.json(result);
  } catch (error) {
    console.error('Error getting PG dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get PG dashboard',
      error: error.message
    });
  }
});

// Export PG data
router.get('/:pgId/export', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const { format = 'pdf' } = req.query;
    const result = await pgService.exportPGData(req.params.pgId, format);
    res.json(result);
  } catch (error) {
    console.error('Error exporting PG data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export PG data',
      error: error.message
    });
  }
});

// Upload PG images
router.post('/:pgId/images', authenticate, adminOrSuperadmin, uploadPGImages, async (req, res) => {
  try {
    const result = await pgService.uploadPGImages(req.params.pgId, req.files, req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Error uploading PG images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PG images',
      error: error.message
    });
  }
});

// Delete PG image
router.delete('/:pgId/images/:imageId', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    const result = await pgService.deletePGImage(req.params.pgId, req.params.imageId, req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting PG image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete PG image',
      error: error.message
    });
  }
});

// Bulk upload route for images
router.post('/bulk-upload-images', authenticate, adminOrSuperadmin, uploadPGImages, async (req, res) => {
  try {
    const result = await pgService.bulkUploadPGImages(req.params.pgId, req.files, req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Error bulk uploading PG images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk upload PG images',
      error: error.message
    });
  }
});

// Bulk upload route for floors and rooms
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
      uploadType: req.body.uploadType,
      branchId: req.body.branchId
    };

    const result = await pgService.bulkUploadFloorsAndRooms(uploadData, req.user._id);
    res.json(result);
  } catch (error) {
    console.error('Error bulk uploading floors and rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk upload floors and rooms',
      error: error.message
    });
  }
});

// Sample data endpoints
router.post('/sample/add', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    // This would be implemented in PGService
    res.json({
      success: true,
      message: 'Sample data endpoint - implement with PGService.addSamplePGs()',
      statusCode: 200
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add sample data',
      error: error.message
    });
  }
});

router.delete('/sample/clear', authenticate, adminOrSuperadmin, async (req, res) => {
  try {
    // This would be implemented in PGService
    res.json({
      success: true,
      message: 'Clear sample data endpoint - implement with PGService.clearSamplePGs()',
      statusCode: 200
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear sample data',
      error: error.message
    });
  }
});

module.exports = router; 