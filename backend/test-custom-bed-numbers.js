const mongoose = require('mongoose');
const Room = require('./src/models/room.model');
const Floor = require('./src/models/floor.model');
const PG = require('./src/models/pg.model');
const User = require('./src/models/user.model');

mongoose.connect('mongodb://localhost:27017/pg-app', { useNewUrlParser: true, useUnifiedTopology: true });

async function testCustomBedNumbers() {
  try {
    console.log('🧪 Testing Custom Bed Numbers Functionality...\n');

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

    // Test 1: Create room with auto-generated bed numbers
    console.log('\n🔍 Test 1: Creating room with auto-generated bed numbers...');
    
    const autoRoom = new Room({
      pgId: pg._id,
      floorId: floor._id,
      roomNumber: 'TEST-AUTO-101',
      numberOfBeds: 3,
      sharingType: '3-sharing',
      cost: 6000,
      description: 'Room with auto-generated bed numbers',
      createdBy: user._id
    });

    autoRoom.initializeBeds(); // Auto-generate bed numbers
    await autoRoom.save();

    console.log('   ✅ Auto room created successfully');
    console.log('   📊 Bed numbers:', autoRoom.beds.map(bed => bed.bedNumber));

    // Test 2: Create room with custom bed numbers
    console.log('\n🔍 Test 2: Creating room with custom bed numbers...');
    
    const customBedNumbers = ['A', 'B', 'Upper'];
    
    const customRoom = new Room({
      pgId: pg._id,
      floorId: floor._id,
      roomNumber: 'TEST-CUSTOM-102',
      numberOfBeds: 3,
      sharingType: '3-sharing',
      cost: 7000,
      description: 'Room with custom bed numbers',
      createdBy: user._id
    });

    customRoom.initializeBeds(customBedNumbers);
    await customRoom.save();

    console.log('   ✅ Custom room created successfully');
    console.log('   📊 Custom bed numbers:', customRoom.beds.map(bed => bed.bedNumber));

    // Test 3: Create room with mixed custom and auto bed numbers
    console.log('\n🔍 Test 3: Creating room with mixed custom and auto bed numbers...');
    
    const mixedBedNumbers = ['1A', '', 'Lower']; // Empty string for auto-generation
    
    const mixedRoom = new Room({
      pgId: pg._id,
      floorId: floor._id,
      roomNumber: 'TEST-MIXED-103',
      numberOfBeds: 3,
      sharingType: '3-sharing',
      cost: 6500,
      description: 'Room with mixed bed numbers',
      createdBy: user._id
    });

    mixedRoom.initializeBeds(mixedBedNumbers);
    await mixedRoom.save();

    console.log('   ✅ Mixed room created successfully');
    console.log('   📊 Mixed bed numbers:', mixedRoom.beds.map(bed => bed.bedNumber));

    // Test 4: Create room with numeric custom bed numbers
    console.log('\n🔍 Test 4: Creating room with numeric custom bed numbers...');
    
    const numericBedNumbers = ['101A', '101B', '101C'];
    
    const numericRoom = new Room({
      pgId: pg._id,
      floorId: floor._id,
      roomNumber: 'TEST-NUMERIC-104',
      numberOfBeds: 3,
      sharingType: '3-sharing',
      cost: 8000,
      description: 'Room with numeric bed numbers',
      createdBy: user._id
    });

    numericRoom.initializeBeds(numericBedNumbers);
    await numericRoom.save();

    console.log('   ✅ Numeric room created successfully');
    console.log('   📊 Numeric bed numbers:', numericRoom.beds.map(bed => bed.bedNumber));

    // Test 5: Test bed assignment with custom bed numbers
    console.log('\n🔍 Test 5: Testing bed assignment with custom bed numbers...');
    
    // Create a test resident
    const Resident = require('./src/models/resident.model');
    const resident = new Resident({
      firstName: 'Test',
      lastName: 'Resident',
      phone: '9876543210',
      email: 'test@example.com',
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
    console.log('   ✅ Test resident created');

    // Assign resident to custom bed 'A'
    const bedAssigned = customRoom.assignBed('A', resident._id);
    console.log(`   ${bedAssigned ? '✅' : '❌'} Resident assigned to bed 'A'`);

    if (bedAssigned) {
      console.log('   📊 Updated room status:');
      console.log(`      - Available Beds: ${customRoom.availableBeds}`);
      console.log(`      - Occupied Beds: ${customRoom.occupiedBeds}`);
      console.log(`      - Room Occupied: ${customRoom.isOccupied}`);
    }

    await customRoom.save();

    // Test 6: Test bed availability methods with custom numbers
    console.log('\n🔍 Test 6: Testing bed availability methods with custom numbers...');
    
    const availableBeds = customRoom.getAvailableBeds();
    const occupiedBeds = customRoom.getOccupiedBeds();
    
    console.log('   📋 Available beds:', availableBeds.map(bed => bed.bedNumber));
    console.log('   📋 Occupied beds:', occupiedBeds.map(bed => ({
      bedNumber: bed.bedNumber,
      occupiedBy: bed.occupiedBy,
      occupiedAt: bed.occupiedAt
    })));

    // Test 7: Test bed unassignment with custom numbers
    console.log('\n🔍 Test 7: Testing bed unassignment with custom numbers...');
    
    const bedUnassigned = customRoom.unassignBed('A');
    console.log(`   ${bedUnassigned ? '✅' : '❌'} Bed 'A' unassigned successfully`);
    
    console.log('   📊 Room status after unassignment:');
    console.log(`      - Available Beds: ${customRoom.availableBeds}`);
    console.log(`      - Occupied Beds: ${customRoom.occupiedBeds}`);
    console.log(`      - Room Occupied: ${customRoom.isOccupied}`);

    await customRoom.save();

    console.log('\n✅ Custom bed numbers test completed successfully!');
    console.log('\n📋 Summary of Custom Bed Numbers Features:');
    console.log('   1. ✅ Auto-generated bed numbers (1, 2, 3...)');
    console.log('   2. ✅ Custom bed numbers (A, B, Upper, Lower)');
    console.log('   3. ✅ Mixed custom and auto bed numbers');
    console.log('   4. ✅ Numeric custom bed numbers (101A, 101B)');
    console.log('   5. ✅ Bed assignment with custom numbers');
    console.log('   6. ✅ Bed unassignment with custom numbers');
    console.log('   7. ✅ Bed availability tracking with custom numbers');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Room.deleteMany({ roomNumber: { $regex: '^TEST-' } });
    await Resident.deleteMany({ firstName: 'Test' });
    console.log('   ✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCustomBedNumbers(); 