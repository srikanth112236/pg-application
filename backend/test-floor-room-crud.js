const mongoose = require('mongoose');
const FloorService = require('./src/services/floor.service');
const RoomService = require('./src/services/room.service');
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');
const Branch = require('./src/models/branch.model');
const Floor = require('./src/models/floor.model');
const Room = require('./src/models/room.model');

// Test floor and room CRUD operations
async function testFloorRoomCRUD() {
  try {
    console.log('🧪 Testing Floor and Room CRUD Operations...');
    
    // Create a test user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'testadmin@example.com',
      password: 'Test@123',
      phone: '1234567890',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    
    await testUser.save();
    console.log('✅ Test user created:', testUser._id);
    
    // Create a test PG
    const testPG = new PG({
      name: 'Test PG',
      description: 'A test PG for CRUD operations',
      address: '123 Test Street, Test City, Test State - 123456',
      phone: '9876543210',
      email: 'testpg@example.com',
      admin: testUser._id,
      createdBy: testUser._id
    });
    
    await testPG.save();
    console.log('✅ Test PG created:', testPG._id);
    
    // Create a test branch
    const testBranch = new Branch({
      pgId: testPG._id,
      name: 'Main Branch',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        landmark: 'Near Test Landmark'
      },
      maintainer: {
        name: 'Test Maintainer',
        mobile: '9876543210',
        email: 'maintainer@test.com'
      },
      contact: {
        phone: '9876543210',
        email: 'contact@test.com'
      },
      isDefault: true,
      createdBy: testUser._id
    });
    
    await testBranch.save();
    console.log('✅ Test branch created:', testBranch._id);
    
    // Test floor creation
    console.log('\n🏢 Testing Floor Creation...');
    const floorData = {
      pgId: testPG._id,
      branchId: testBranch._id,
      name: 'Ground Floor',
      description: 'Ground floor with common facilities',
      totalRooms: 10
    };
    
    const floorResult = await FloorService.createFloor(floorData, testUser._id);
    console.log('📤 Floor creation result:', {
      success: floorResult.success,
      statusCode: floorResult.statusCode,
      message: floorResult.message,
      error: floorResult.error
    });
    
    if (floorResult.success) {
      console.log('✅ Floor created successfully!');
      const floor = floorResult.data;
      console.log('🏢 Floor details:', {
        id: floor._id,
        name: floor.name,
        branchId: floor.branchId,
        pgId: floor.pgId,
        totalRooms: floor.totalRooms
      });
      
      // Test room creation
      console.log('\n🚪 Testing Room Creation...');
      const roomData = {
        pgId: testPG._id,
        branchId: testBranch._id,
        floorId: floor._id,
        roomNumber: 'G-101',
        numberOfBeds: 2,
        sharingType: '2-sharing',
        cost: 6000,
        description: 'Comfortable double sharing room'
      };
      
      const roomResult = await RoomService.createRoom(roomData, testUser._id);
      console.log('📤 Room creation result:', {
        success: roomResult.success,
        statusCode: roomResult.statusCode,
        message: roomResult.message,
        error: roomResult.error
      });
      
      if (roomResult.success) {
        console.log('✅ Room created successfully!');
        const room = roomResult.data;
        console.log('🚪 Room details:', {
          id: room._id,
          roomNumber: room.roomNumber,
          floorId: room.floorId,
          branchId: room.branchId,
          pgId: room.pgId,
          sharingType: room.sharingType,
          cost: room.cost
        });
        
        // Test floor update
        console.log('\n🔄 Testing Floor Update...');
        const updateFloorResult = await FloorService.updateFloor(floor._id, {
          name: 'Updated Ground Floor',
          totalRooms: 12
        }, testUser._id);
        
        console.log('📤 Floor update result:', {
          success: updateFloorResult.success,
          statusCode: updateFloorResult.statusCode,
          message: updateFloorResult.message
        });
        
        // Test room update
        console.log('\n🔄 Testing Room Update...');
        const updateRoomResult = await RoomService.updateRoom(room._id, {
          roomNumber: 'G-102',
          cost: 7000
        }, testUser._id);
        
        console.log('📤 Room update result:', {
          success: updateRoomResult.success,
          statusCode: updateRoomResult.statusCode,
          message: updateRoomResult.message
        });
        
        // Test getting floors and rooms
        console.log('\n📋 Testing Get Operations...');
        const floorsResult = await FloorService.getFloorsByPG(testPG._id);
        console.log('📤 Get floors result:', {
          success: floorsResult.success,
          count: floorsResult.data?.length || 0
        });
        
        const roomsResult = await RoomService.getRoomsByPG(testPG._id);
        console.log('📤 Get rooms result:', {
          success: roomsResult.success,
          count: roomsResult.data?.length || 0
        });
        
        // Clean up
        console.log('\n🧹 Cleaning up test data...');
        await Room.findByIdAndDelete(room._id);
        await Floor.findByIdAndDelete(floor._id);
        await Branch.findByIdAndDelete(testBranch._id);
        await PG.findByIdAndDelete(testPG._id);
        await User.findByIdAndDelete(testUser._id);
        console.log('✅ Test data cleaned up');
        
      } else {
        console.log('❌ Room creation failed:', roomResult.error);
      }
    } else {
      console.log('❌ Floor creation failed:', floorResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFloorRoomCRUD(); 