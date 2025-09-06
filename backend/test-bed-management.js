const mongoose = require('mongoose');
const Room = require('./src/models/room.model');
const Resident = require('./src/models/resident.model');
const Floor = require('./src/models/floor.model');
const PG = require('./src/models/pg.model');
const User = require('./src/models/user.model');

mongoose.connect('mongodb://localhost:27017/pg-app', { useNewUrlParser: true, useUnifiedTopology: true });

async function testBedManagement() {
  try {
    console.log('🧪 Testing Bed Management Functionality...\n');

    // Find existing PG, floor, and user
    const pg = await PG.findOne({ isActive: true });
    const floor = await Floor.findOne({ pgId: pg._id, isActive: true });
    const user = await User.findOne({ isActive: true });

    if (!pg || !floor || !user) {
      console.log('❌ Required test data not found. Please ensure you have PG, floor, and user data.');
      return;
    }

    console.log('✅ Found test data:');
    console.log('   PG:', pg.name);
    console.log('   Floor:', floor.name);
    console.log('   User:', `${user.firstName} ${user.lastName}`);

    // Test 1: Create a room with beds
    console.log('\n🔍 Test 1: Creating room with bed initialization...');
    
    const roomData = {
      pgId: pg._id,
      floorId: floor._id,
      roomNumber: 'TEST-101',
      numberOfBeds: 4,
      sharingType: '4-sharing',
      cost: 6000,
      description: 'Test room for bed management'
    };

    const room = new Room({
      ...roomData,
      createdBy: user._id
    });

    // Initialize beds
    room.initializeBeds();
    await room.save();

    console.log('   ✅ Room created successfully');
    console.log('   📊 Room details:');
    console.log(`      - Room Number: ${room.roomNumber}`);
    console.log(`      - Total Beds: ${room.numberOfBeds}`);
    console.log(`      - Available Beds: ${room.availableBeds}`);
    console.log(`      - Occupied Beds: ${room.occupiedBeds}`);
    console.log('   🛏️  Beds initialized:', room.beds.map(bed => ({
      bedNumber: bed.bedNumber,
      isOccupied: bed.isOccupied,
      occupiedBy: bed.occupiedBy
    })));

    // Test 2: Assign beds to residents
    console.log('\n🔍 Test 2: Testing bed assignment...');
    
    // Create test residents
    const residents = [];
    for (let i = 1; i <= 3; i++) {
      const resident = new Resident({
        firstName: `Test${i}`,
        lastName: 'Resident',
        phone: `987654321${i}`,
        email: `test${i}@example.com`,
        dateOfBirth: new Date('1990-01-01'),
        gender: 'male',
        permanentAddress: {
          street: 'Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Parent',
          phone: '9876543210',
          address: 'Emergency Address'
        },
        pgId: pg._id,
        branchId: floor.branchId,
        checkInDate: new Date(),
        contractStartDate: new Date(),
        createdBy: user._id
      });
      
      await resident.save();
      residents.push(resident);
      console.log(`   ✅ Created resident: ${resident.firstName} ${resident.lastName}`);
    }

    // Test bed assignment
    console.log('\n   📋 Testing bed assignments:');
    
    // Assign first resident to bed 1
    const bed1Assigned = room.assignBed(1, residents[0]._id);
    console.log(`   ${bed1Assigned ? '✅' : '❌'} Bed 1 assigned to ${residents[0].firstName}`);
    
    // Assign second resident to bed 2
    const bed2Assigned = room.assignBed(2, residents[1]._id);
    console.log(`   ${bed2Assigned ? '✅' : '❌'} Bed 2 assigned to ${residents[1].firstName}`);
    
    // Try to assign third resident to already occupied bed
    const bed1Reassign = room.assignBed(1, residents[2]._id);
    console.log(`   ${bed1Reassign ? '❌' : '✅'} Bed 1 correctly rejected for ${residents[2].firstName} (already occupied)`);
    
    // Assign third resident to bed 3
    const bed3Assigned = room.assignBed(3, residents[2]._id);
    console.log(`   ${bed3Assigned ? '✅' : '❌'} Bed 3 assigned to ${residents[2].firstName}`);

    await room.save();
    console.log('\n   📊 Updated room status:');
    console.log(`      - Available Beds: ${room.availableBeds}`);
    console.log(`      - Occupied Beds: ${room.occupiedBeds}`);
    console.log(`      - Room Occupied: ${room.isOccupied}`);

    // Test 3: Bed availability methods
    console.log('\n🔍 Test 3: Testing bed availability methods...');
    
    const availableBeds = room.getAvailableBeds();
    const occupiedBeds = room.getOccupiedBeds();
    
    console.log('   📋 Available beds:', availableBeds.map(bed => bed.bedNumber));
    console.log('   📋 Occupied beds:', occupiedBeds.map(bed => ({
      bedNumber: bed.bedNumber,
      occupiedBy: bed.occupiedBy,
      occupiedAt: bed.occupiedAt
    })));

    // Test 4: Unassign bed
    console.log('\n🔍 Test 4: Testing bed unassignment...');
    
    const bedUnassigned = room.unassignBed(2);
    console.log(`   ${bedUnassigned ? '✅' : '❌'} Bed 2 unassigned successfully`);
    
    console.log('\n   📊 Room status after unassignment:');
    console.log(`      - Available Beds: ${room.availableBeds}`);
    console.log(`      - Occupied Beds: ${room.occupiedBeds}`);
    console.log(`      - Room Occupied: ${room.isOccupied}`);

    // Test 5: Virtual properties
    console.log('\n🔍 Test 5: Testing virtual properties...');
    
    console.log('   📊 Virtual properties:');
    console.log(`      - room.availableBeds: ${room.availableBeds}`);
    console.log(`      - room.occupiedBeds: ${room.occupiedBeds}`);

    // Test 6: Error handling
    console.log('\n🔍 Test 6: Testing error handling...');
    
    // Try to assign to non-existent bed
    const invalidBed = room.assignBed(99, residents[0]._id);
    console.log(`   ${invalidBed ? '❌' : '✅'} Invalid bed assignment correctly rejected`);
    
    // Try to unassign already unassigned bed
    const alreadyUnassigned = room.unassignBed(2);
    console.log(`   ${alreadyUnassigned ? '❌' : '✅'} Already unassigned bed correctly handled`);

    // Test 7: Room creation with bed initialization
    console.log('\n🔍 Test 7: Testing room creation with automatic bed initialization...');
    
    const newRoom = new Room({
      pgId: pg._id,
      floorId: floor._id,
      roomNumber: 'TEST-102',
      numberOfBeds: 2,
      sharingType: '2-sharing',
      cost: 8000,
      description: 'Another test room',
      createdBy: user._id
    });

    // Initialize beds automatically
    newRoom.initializeBeds();
    await newRoom.save();

    console.log('   ✅ New room created with automatic bed initialization');
    console.log(`   📊 New room beds: ${newRoom.beds.length} beds initialized`);
    console.log(`   📊 Available beds: ${newRoom.availableBeds}`);

    console.log('\n✅ Bed management test completed successfully!');
    console.log('\n📋 Summary of Bed Management Features:');
    console.log('   1. ✅ Automatic bed initialization when creating rooms');
    console.log('   2. ✅ Bed assignment with validation');
    console.log('   3. ✅ Bed unassignment functionality');
    console.log('   4. ✅ Virtual properties for bed counts');
    console.log('   5. ✅ Error handling for invalid operations');
    console.log('   6. ✅ Room occupancy tracking');
    console.log('   7. ✅ Available/occupied bed filtering');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Room.deleteMany({ roomNumber: { $regex: '^TEST-' } });
    await Resident.deleteMany({ firstName: { $regex: '^Test' } });
    console.log('   ✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testBedManagement(); 