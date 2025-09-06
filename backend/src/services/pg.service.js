const PG = require('../models/pg.model');
const User = require('../models/user.model');
const Payment = require('../models/payment.model');
const Ticket = require('../models/ticket.model');
const Floor = require('../models/floor.model');
const Room = require('../models/room.model');
const XLSX = require('xlsx');
const { createResponse } = require('../utils/response');

class PGService {
  /**
   * Get PG information
   */
  async getPGInfo(pgId) {
    try {
      const pg = await PG.findById(pgId);
      if (!pg) {
        return {
          success: false,
          message: 'PG not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        message: 'PG information retrieved successfully',
        statusCode: 200,
        data: {
          pg: {
            id: pg._id,
            name: pg.name,
            description: pg.description,
            address: pg.address,
            phone: pg.phone,
            email: pg.email,
            isActive: pg.isActive,
            createdAt: pg.createdAt
          }
        }
      };
    } catch (error) {
      console.error('Get PG info error:', error);
      return {
        success: false,
        message: 'Failed to get PG information',
        statusCode: 500,
        error: error.message
      };
    }
  }

  /**
   * Update PG information
   */
  async updatePGInfo(pgId, updateData) {
    try {
      console.log('🔍 PGService.updatePGInfo called:', { pgId, updateData });
      
      const pg = await PG.findById(pgId);
      console.log('🔍 Found PG:', pg ? 'Yes' : 'No');
      
      if (!pg) {
        console.log('❌ PG not found for ID:', pgId);
        return {
          success: false,
          message: 'PG not found',
          statusCode: 404
        };
      }

      // Update PG fields
      const allowedFields = ['name', 'description', 'address', 'phone', 'email'];
      const updateFields = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = updateData[field];
        }
      });

      console.log('🔍 Update fields:', updateFields);

      const updatedPG = await PG.findByIdAndUpdate(
        pgId,
        updateFields,
        { new: true, runValidators: true }
      );

      console.log('✅ PG updated successfully:', updatedPG);

      return {
        success: true,
        message: 'PG information updated successfully',
        statusCode: 200,
        data: {
          pg: updatedPG
        }
      };
    } catch (error) {
      console.error('❌ Update PG info error:', error);
      return {
        success: false,
        message: 'Failed to update PG information',
        statusCode: 500,
        error: error.message
      };
    }
  }

  // Create a new PG
  async createPG(pgData, adminId) {
    try {
      console.log('PG Service createPG called with:', {
        adminId: adminId,
        adminIdType: typeof adminId,
        pgDataName: pgData.name
      });

      // Validate admin exists and has admin role
      const superadmin = await User.findById(adminId);
      console.log('Superadmin lookup result:', {
        adminFound: !!superadmin,
        adminId: superadmin?._id,
        adminRole: superadmin?.role,
        adminEmail: superadmin?.email
      });

      if (!superadmin || !['admin', 'superadmin'].includes(superadmin.role)) {
        console.log('Authorization failed in PG service:', {
          adminExists: !!superadmin,
          adminRole: superadmin?.role,
          allowedRoles: ['admin', 'superadmin']
        });
        throw new Error('Unauthorized: Only admins can create PGs');
      }

      console.log('User permissions validated successfully');

      // Create admin user for this PG
      const adminEmail = pgData.contact.email;
      const adminPassword = 'Admin@123';
      
      console.log('Creating admin user for PG:', {
        email: adminEmail,
        name: pgData.name
      });

      // Check if admin user already exists
      let adminUser = await User.findOne({ email: adminEmail });
      
      if (!adminUser) {
        // Create new admin user
        adminUser = new User({
          firstName: pgData.name.split(' ')[0] || 'Admin',
          lastName: pgData.name.split(' ').slice(1).join(' ') || 'User',
          email: adminEmail,
          password: adminPassword,
          phone: pgData.contact.phone,
          role: 'admin',
          isEmailVerified: true,
          isActive: true
        });

        // Store plain password temporarily for email
        adminUser.plainPassword = adminPassword;
        
        await adminUser.save();
        console.log('Admin user created successfully:', adminUser._id);
      } else {
        console.log('Admin user already exists:', adminUser._id);
        // Update existing user to admin role if needed
        if (adminUser.role !== 'admin') {
          adminUser.role = 'admin';
          adminUser.isActive = true;
          adminUser.isEmailVerified = true;
          await adminUser.save();
          console.log('Existing user updated to admin role');
        }
      }

      // Format the data for the PG model
      const formattedPGData = {
        name: pgData.name,
        description: pgData.description || '',
        // Convert address object to string
        address: pgData.address ? 
          `${pgData.address.street}, ${pgData.address.city}, ${pgData.address.state} - ${pgData.address.pincode}${pgData.address.landmark ? ` (${pgData.address.landmark})` : ''}` : 
          '',
        phone: pgData.contact?.phone || '',
        email: pgData.contact?.email || '',
        admin: adminUser._id,
        createdBy: adminId, // Add the createdBy field
        isActive: true
      };

      console.log('Formatted PG data:', formattedPGData);

      // Set admin and validate data
      const pg = new PG(formattedPGData);

      console.log('PG object created, attempting to save...');
      const savedPG = await pg.save();
      console.log('PG saved successfully:', savedPG._id);

      // Send welcome email to admin
      try {
        const emailService = require('./email.service');
        await emailService.sendPGAdminWelcomeEmail({
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          pgName: pgData.name,
          password: adminPassword,
          loginUrl: `${process.env.FRONTEND_URL}/admin/login`
        });
        console.log('Welcome email sent to admin:', adminUser.email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the PG creation if email fails
      }

      return {
        success: true,
        data: savedPG,
        message: 'PG created successfully and admin credentials sent via email'
      };
    } catch (error) {
      console.error('PG Service createPG error:', error);
      throw new Error(`Failed to create PG: ${error.message}`);
    }
  }

  // Get all PGs with filters
  async getAllPGs(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      // Apply filters
      if (filters.status) query.status = filters.status;
      if (filters.city) query['address.city'] = new RegExp(filters.city, 'i');
      if (filters.state) query['address.state'] = new RegExp(filters.state, 'i');
      if (filters.propertyType) query['property.type'] = filters.propertyType;
      if (filters.admin) query.admin = filters.admin;
      if (filters.minPrice || filters.maxPrice) {
        query['pricing.basePrice'] = {};
        if (filters.minPrice) query['pricing.basePrice'].$gte = filters.minPrice;
        if (filters.maxPrice) query['pricing.basePrice'].$lte = filters.maxPrice;
      }

      const skip = (page - 1) * limit;
      
      const [pgs, total] = await Promise.all([
        PG.find(query)
          .populate('admin', 'firstName lastName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        PG.countDocuments(query)
      ]);

      // Format the PGs data for frontend consumption
      const formattedPGs = pgs.map(pg => {
        const pgObj = pg.toObject();
        
        // Parse address string back to object for frontend
        if (pgObj.address && typeof pgObj.address === 'string') {
          // Try to parse the address string back to object format
          const addressParts = pgObj.address.split(', ');
          if (addressParts.length >= 3) {
            const landmarkMatch = pgObj.address.match(/\(([^)]+)\)/);
            const landmark = landmarkMatch ? landmarkMatch[1] : '';
            
            pgObj.address = {
              street: addressParts[0] || '',
              city: addressParts[1] || '',
              state: addressParts[2]?.split(' - ')[0] || '',
              pincode: addressParts[2]?.split(' - ')[1]?.split(' ')[0] || '',
              landmark: landmark
            };
          } else {
            // Fallback if parsing fails
            pgObj.address = {
              street: pgObj.address,
              city: '',
              state: '',
              pincode: '',
              landmark: ''
            };
          }
        }

        // Add contact object for frontend
        pgObj.contact = {
          phone: pgObj.phone || '',
          email: pgObj.email || '',
          alternatePhone: ''
        };

        // Add property object for frontend
        pgObj.property = {
          type: 'Gents PG', // Default value
          totalRooms: 0,
          availableRooms: 0
        };

        return pgObj;
      });

      return {
        success: true,
        data: formattedPGs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch PGs: ${error.message}`);
    }
  }

  // Get PG by ID
  async getPGById(pgId) {
    try {
      const pg = await PG.findById(pgId)
        .populate('admin', 'firstName lastName email phone');

      if (!pg) {
        throw new Error('PG not found');
      }

      // Format the PG data for frontend consumption
      const pgObj = pg.toObject();
      
      // Parse address string back to object for frontend
      if (pgObj.address && typeof pgObj.address === 'string') {
        // Try to parse the address string back to object format
        const addressParts = pgObj.address.split(', ');
        if (addressParts.length >= 3) {
          const landmarkMatch = pgObj.address.match(/\(([^)]+)\)/);
          const landmark = landmarkMatch ? landmarkMatch[1] : '';
          
          pgObj.address = {
            street: addressParts[0] || '',
            city: addressParts[1] || '',
            state: addressParts[2]?.split(' - ')[0] || '',
            pincode: addressParts[2]?.split(' - ')[1]?.split(' ')[0] || '',
            landmark: landmark
          };
        } else {
          // Fallback if parsing fails
          pgObj.address = {
            street: pgObj.address,
            city: '',
            state: '',
            pincode: '',
            landmark: ''
          };
        }
      }

      // Add contact object for frontend
      pgObj.contact = {
        phone: pgObj.phone || '',
        email: pgObj.email || '',
        alternatePhone: ''
      };

      // Add property object for frontend
      pgObj.property = {
        type: 'Gents PG', // Default value
        totalRooms: 0,
        availableRooms: 0
      };

      return {
        success: true,
        data: pgObj
      };
    } catch (error) {
      throw new Error(`Failed to fetch PG: ${error.message}`);
    }
  }

  // Update PG
  async updatePG(pgId, updateData, adminId) {
    try {
      // Validate admin exists and has admin role
      const admin = await User.findById(adminId);
      if (!admin || !['admin', 'superadmin'].includes(admin.role)) {
        throw new Error('Unauthorized: Only admins can update PGs');
      }

      // Check if PG exists and admin has permission
      const existingPG = await PG.findById(pgId);
      if (!existingPG) {
        throw new Error('PG not found');
      }

      // Format the update data for the PG model
      const formattedUpdateData = {
        name: updateData.name,
        description: updateData.description || '',
        // Convert address object to string if it's an object
        address: updateData.address ? 
          (typeof updateData.address === 'string' ? updateData.address :
           `${updateData.address.street}, ${updateData.address.city}, ${updateData.address.state} - ${updateData.address.pincode}${updateData.address.landmark ? ` (${updateData.address.landmark})` : ''}`) : 
          existingPG.address,
        phone: updateData.contact?.phone || updateData.phone || '',
        email: updateData.contact?.email || updateData.email || '',
        isActive: updateData.isActive !== undefined ? updateData.isActive : existingPG.isActive
      };

      console.log('Formatted update data:', formattedUpdateData);

      // Update PG
      const updatedPG = await PG.findByIdAndUpdate(
        pgId,
        { ...formattedUpdateData, updatedAt: Date.now() },
        { new: true, runValidators: true }
      ).populate('admin', 'firstName lastName email');

      return {
        success: true,
        data: updatedPG,
        message: 'PG updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update PG: ${error.message}`);
    }
  }

  // Delete PG
  async deletePG(pgId, adminId) {
    try {
      const pg = await PG.findById(pgId);
      if (!pg) {
        throw new Error('PG not found');
      }

      // Check if user is authorized to delete this PG
      const admin = await User.findById(adminId);
      if (!admin || (admin.role !== 'superadmin' && pg.admin.toString() !== adminId)) {
        throw new Error('Unauthorized to delete this PG');
      }

      // Check if PG has active payments or tickets
      const [activePayments, activeTickets] = await Promise.all([
        Payment.countDocuments({ pg: pgId, status: { $in: ['pending', 'processing'] } }),
        Ticket.countDocuments({ pg: pgId, status: { $in: ['open', 'in_progress'] } })
      ]);

      if (activePayments > 0 || activeTickets > 0) {
        throw new Error('Cannot delete PG with active payments or tickets');
      }

      await PG.findByIdAndDelete(pgId);

      return {
        success: true,
        message: 'PG deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete PG: ${error.message}`);
    }
  }

  // Get PG statistics
  async getPGStats(pgId = null) {
    try {
      const match = pgId ? { pg: pgId } : {};

      const [totalPGs, activePGs, totalRevenue, totalPayments, pendingTickets] = await Promise.all([
        PG.countDocuments(),
        PG.countDocuments({ status: 'active' }),
        Payment.aggregate([
          { $match: { ...match, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Payment.countDocuments({ ...match, status: 'completed' }),
        Ticket.countDocuments({ ...match, status: { $in: ['open', 'in_progress'] } })
      ]);

      const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

      return {
        success: true,
        data: {
          totalPGs,
          activePGs,
          totalRevenue: revenue,
          totalPayments,
          pendingTickets,
          occupancyRate: totalPGs > 0 ? Math.round((activePGs / totalPGs) * 100) : 0
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch PG stats: ${error.message}`);
    }
  }

  // Search PGs
  async searchPGs(searchTerm, filters = {}) {
    try {
      const query = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { 'address.city': { $regex: searchTerm, $options: 'i' } },
          { 'address.state': { $regex: searchTerm, $options: 'i' } }
        ]
      };

      // Apply additional filters
      if (filters.status) query.status = filters.status;
      if (filters.propertyType) query['property.type'] = filters.propertyType;
      if (filters.minPrice || filters.maxPrice) {
        query['pricing.basePrice'] = {};
        if (filters.minPrice) query['pricing.basePrice'].$gte = filters.minPrice;
        if (filters.maxPrice) query['pricing.basePrice'].$lte = filters.maxPrice;
      }

      const pgs = await PG.find(query)
        .populate('admin', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(20);

      // Format the PGs data for frontend consumption
      const formattedPGs = pgs.map(pg => {
        const pgObj = pg.toObject();
        
        // Parse address string back to object for frontend
        if (pgObj.address && typeof pgObj.address === 'string') {
          // Try to parse the address string back to object format
          const addressParts = pgObj.address.split(', ');
          if (addressParts.length >= 3) {
            const landmarkMatch = pgObj.address.match(/\(([^)]+)\)/);
            const landmark = landmarkMatch ? landmarkMatch[1] : '';
            
            pgObj.address = {
              street: addressParts[0] || '',
              city: addressParts[1] || '',
              state: addressParts[2]?.split(' - ')[0] || '',
              pincode: addressParts[2]?.split(' - ')[1]?.split(' ')[0] || '',
              landmark: landmark
            };
          } else {
            // Fallback if parsing fails
            pgObj.address = {
              street: pgObj.address,
              city: '',
              state: '',
              pincode: '',
              landmark: ''
            };
          }
        }

        // Add contact object for frontend
        pgObj.contact = {
          phone: pgObj.phone || '',
          email: pgObj.email || '',
          alternatePhone: ''
        };

        // Add property object for frontend
        pgObj.property = {
          type: 'Gents PG', // Default value
          totalRooms: 0,
          availableRooms: 0
        };

        return pgObj;
      });

      return {
        success: true,
        data: formattedPGs
      };
    } catch (error) {
      throw new Error(`Failed to search PGs: ${error.message}`);
    }
  }

  // Get PGs by location
  async getPGsByLocation(city, state) {
    try {
      const pgs = await PG.find({
        'address.city': new RegExp(city, 'i'),
        'address.state': new RegExp(state, 'i'),
        status: 'active'
      }).populate('admin', 'firstName lastName email');

      // Format the PGs data for frontend consumption
      const formattedPGs = pgs.map(pg => {
        const pgObj = pg.toObject();
        
        // Parse address string back to object for frontend
        if (pgObj.address && typeof pgObj.address === 'string') {
          // Try to parse the address string back to object format
          const addressParts = pgObj.address.split(', ');
          if (addressParts.length >= 3) {
            const landmarkMatch = pgObj.address.match(/\(([^)]+)\)/);
            const landmark = landmarkMatch ? landmarkMatch[1] : '';
            
            pgObj.address = {
              street: addressParts[0] || '',
              city: addressParts[1] || '',
              state: addressParts[2]?.split(' - ')[0] || '',
              pincode: addressParts[2]?.split(' - ')[1]?.split(' ')[0] || '',
              landmark: landmark
            };
          } else {
            // Fallback if parsing fails
            pgObj.address = {
              street: pgObj.address,
              city: '',
              state: '',
              pincode: '',
              landmark: ''
            };
          }
        }

        // Add contact object for frontend
        pgObj.contact = {
          phone: pgObj.phone || '',
          email: pgObj.email || '',
          alternatePhone: ''
        };

        // Add property object for frontend
        pgObj.property = {
          type: 'Gents PG', // Default value
          totalRooms: 0,
          availableRooms: 0
        };

        return pgObj;
      });

      return {
        success: true,
        data: formattedPGs,
        message: `Found ${formattedPGs.length} PGs in ${city}, ${state}`
      };
    } catch (error) {
      throw new Error(`Failed to fetch PGs by location: ${error.message}`);
    }
  }

  // Get PG analytics
  async getPGAnalytics(pgId, period = 'month') {
    try {
      const pg = await PG.findById(pgId);
      if (!pg) {
        return {
          success: false,
          message: 'PG not found',
          statusCode: 404
        };
      }

      // Get analytics data based on period
      const analytics = await this.calculatePGAnalytics(pgId, period);

      return {
        success: true,
        data: analytics,
        message: 'PG analytics retrieved successfully',
        statusCode: 200
      };
    } catch (error) {
      console.error('Error getting PG analytics:', error);
      return {
        success: false,
        message: 'Failed to get PG analytics',
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Bulk upload floors and rooms from Excel data
   * @param {Object} uploadData - Upload data containing file and upload type
   * @param {string} userId - User ID performing the upload
   * @returns {Promise<Object>} - Upload result
   */
  async bulkUploadFloorsAndRooms(uploadData, userId) {
    try {
      console.log('🏠 PGService: Starting bulk upload for user:', userId);
      console.log('📊 Upload data:', uploadData);

      const { file, uploadType, branchId } = uploadData;

      if (!file || !uploadType || !branchId) {
        return {
          success: false,
          message: 'Missing required fields: file, uploadType, branchId',
          statusCode: 400
        };
      }

      // Get user and their PG
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          statusCode: 404
        };
      }

      const pgId = user.pgId;
      if (!pgId) {
        return {
          success: false,
          message: 'No PG associated with this user',
          statusCode: 400
        };
      }

      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        return {
          success: false,
          message: 'Excel file must have at least a header row and one data row',
          statusCode: 400
        };
      }

      // Convert to objects using first row as headers
      const headers = jsonData[0];
      const rows = jsonData.slice(1);
      const data = rows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      console.log(`📊 Processing ${data.length} rows for ${uploadType}`);

      let uploadedCount = 0;
      let skippedCount = 0;
      let errors = [];
      let duplicates = [];

      if (uploadType === 'floors') {
        // Process floors
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNumber = i + 2; // +2 because Excel is 1-indexed and we skip header
          
          try {
            if (!row.floorName) {
              errors.push(`Row ${rowNumber}: Floor name is required`);
              continue;
            }

            // Check if floor already exists
            const existingFloor = await Floor.findOne({
              pgId,
              branchId,
              name: row.floorName,
              isActive: true
            });

            if (existingFloor) {
              duplicates.push({
                row: rowNumber,
                name: row.floorName,
                type: 'floor',
                reason: 'Floor already exists'
              });
              skippedCount++;
              continue;
            }

            // Create floor
            const floorData = {
              name: row.floorName,
              totalRooms: parseInt(row.totalRooms) || 1,
              pgId,
              branchId,
              createdBy: userId
            };

            const floor = new Floor(floorData);
            await floor.save();
            uploadedCount++;

            console.log(`✅ Created floor: ${row.floorName}`);
          } catch (error) {
            console.error(`❌ Error creating floor from row ${rowNumber}:`, error);
            errors.push(`Row ${rowNumber}: ${error.message}`);
          }
        }
      } else if (uploadType === 'rooms') {
        // Process rooms
        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNumber = i + 2; // +2 because Excel is 1-indexed and we skip header
          
          try {
            if (!row.floorName || !row.roomNumber || !row.sharingType) {
              errors.push(`Row ${rowNumber}: Floor name, room number, and sharing type are required`);
              continue;
            }

            // Find the floor
            const floor = await Floor.findOne({
              pgId,
              branchId,
              name: row.floorName,
              isActive: true
            });

            if (!floor) {
              errors.push(`Row ${rowNumber}: Floor "${row.floorName}" not found`);
              continue;
            }

            // Check if room already exists
            const existingRoom = await Room.findOne({
              pgId,
              branchId,
              roomNumber: row.roomNumber,
              isActive: true
            });

            if (existingRoom) {
              duplicates.push({
                row: rowNumber,
                name: `Room ${row.roomNumber}`,
                type: 'room',
                reason: 'Room number already exists'
              });
              skippedCount++;
              continue;
            }

            // Determine number of beds and cost based on sharing type
            let numberOfBeds = 1;
            let cost = 0;
            
            switch (row.sharingType) {
              case '1-sharing':
                numberOfBeds = 1;
                cost = row.cost || 8000; // Default cost for single sharing
                break;
              case '2-sharing':
                numberOfBeds = 2;
                cost = row.cost || 6000; // Default cost for double sharing
                break;
              case '3-sharing':
                numberOfBeds = 3;
                cost = row.cost || 5000; // Default cost for triple sharing
                break;
              case '4-sharing':
                numberOfBeds = 4;
                cost = row.cost || 4000; // Default cost for quad sharing
                break;
              default:
                errors.push(`Row ${rowNumber}: Invalid sharing type "${row.sharingType}"`);
                continue;
            }

            // Generate bed numbers automatically
            const bedNumbers = [];
            const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
            for (let i = 0; i < numberOfBeds; i++) {
              bedNumbers.push(`${row.roomNumber}-${letters[i]}`);
            }

            // Create bed objects for the room
            const beds = bedNumbers.map(bedNumber => ({
              bedNumber,
              isOccupied: false,
              occupiedBy: null,
              occupiedAt: null
            }));

            // Create room
            const roomData = {
              floorId: floor._id,
              roomNumber: row.roomNumber,
              numberOfBeds,
              sharingType: row.sharingType,
              cost: parseInt(cost),
              beds,
              pgId,
              branchId,
              createdBy: userId
            };

            const room = new Room(roomData);
            await room.save();
            uploadedCount++;

            console.log(`✅ Created room: ${row.roomNumber} on ${row.floorName} with ${numberOfBeds} beds (${row.sharingType})`);
          } catch (error) {
            console.error(`❌ Error creating room from row ${rowNumber}:`, error);
            errors.push(`Row ${rowNumber}: ${error.message}`);
          }
        }
      } else {
        return {
          success: false,
          message: 'Invalid upload type. Must be "floors" or "rooms"',
          statusCode: 400
        };
      }

      console.log(`✅ Bulk upload completed: ${uploadedCount} ${uploadType} uploaded`);

      // Calculate statistics for rooms
      let roomStats = null;
      if (uploadType === 'rooms' && uploadedCount > 0) {
        const createdRooms = await Room.find({
          pgId,
          branchId,
          createdBy: userId,
          isActive: true
        }).sort({ createdAt: -1 }).limit(uploadedCount);

        const sharingTypeStats = {};
        const totalBeds = createdRooms.reduce((total, room) => {
          const sharingType = room.sharingType;
          sharingTypeStats[sharingType] = (sharingTypeStats[sharingType] || 0) + 1;
          return total + room.numberOfBeds;
        }, 0);

        roomStats = {
          totalRooms: uploadedCount,
          totalBeds,
          sharingTypeBreakdown: sharingTypeStats,
          averageCost: createdRooms.reduce((sum, room) => sum + room.cost, 0) / uploadedCount
        };
      }

      return {
        success: true,
        data: {
          uploadedCount,
          totalRows: data.length,
          errors: errors.length > 0 ? errors : null,
          roomStats,
          skippedCount,
          duplicates: duplicates.length > 0 ? duplicates : null
        },
        message: `Successfully uploaded ${uploadedCount} ${uploadType}`,
        statusCode: 200
      };
    } catch (error) {
      console.error('❌ Bulk upload error:', error);
      return {
        success: false,
        message: 'Failed to process bulk upload',
        error: error.message,
        statusCode: 500
      };
    }
  }
}

module.exports = PGService; 