const mongoose = require('mongoose');
const Resident = require('./src/models/resident.model');
const Room = require('./src/models/room.model');
const Floor = require('./src/models/floor.model');
const PG = require('./src/models/pg.model');
const User = require('./src/models/user.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pg-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testResidentOnboarding() {
  try {
    console.log('🧪 Testing Resident Onboarding Functionality...\n');

    // 1. Check if we have any PGs
    const pgs = await PG.find({});
    console.log('📊 Found PGs:', pgs.length);
    
    if (pgs.length === 0) {
      console.log('❌ No PGs found. Please create a PG first.');
      return;
    }

    const pg = pgs[0];
    console.log('✅ Using PG:', pg.name);

    // 2. Check if we have any floors
    const floors = await Floor.find({ pgId: pg._id });
    console.log('📊 Found floors:', floors.length);
    
    if (floors.length === 0) {
      console.log('❌ No floors found. Please create floors first.');
      return;
    }

    const floor = floors[0];
    console.log('✅ Using floor:', floor.name);

    // 3. Check if we have any rooms
    const rooms = await Room.find({ pgId: pg._id, floorId: floor._id });
    console.log('📊 Found rooms:', rooms.length);
    
    if (rooms.length === 0) {
      console.log('❌ No rooms found. Please create rooms first.');
      return;
    }

    const room = rooms[0];
    console.log('✅ Using room:', room.roomNumber, 'Type:', room.sharingType);

    // 4. Check if we have any residents
    const residents = await Resident.find({ pgId: pg._id });
    console.log('📊 Found residents:', residents.length);
    
    if (residents.length === 0) {
      console.log('❌ No residents found. Please create residents first.');
      return;
    }

    const resident = residents[0];
    console.log('✅ Using resident:', resident.firstName, resident.lastName);

    // 5. Test the onboarding assignment
    console.log('\n🔄 Testing room assignment...');
    
    // Check if resident is already assigned
    if (resident.roomId) {
      console.log('⚠️  Resident is already assigned to room:', resident.roomNumber);
      console.log('🔄 Unassigning resident first...');
      
      // Unassign resident
      await Resident.findByIdAndUpdate(resident._id, {
        $unset: { roomId: 1, roomNumber: 1, bedNumber: 1 },
        status: 'pending'
      });
      
      // Mark room as available
      await Room.findByIdAndUpdate(room._id, { isOccupied: false });
      
      console.log('✅ Resident unassigned successfully');
    }

    // 6. Test the assignment
    console.log('\n🔄 Assigning resident to room...');
    
    const assignmentData = {
      bedNumber: 1,
      checkInDate: new Date(),
      contractStartDate: new Date()
    };

    // Update resident with room assignment
    const updatedResident = await Resident.findByIdAndUpdate(
      resident._id,
      {
        roomId: room._id,
        roomNumber: room.roomNumber,
        bedNumber: assignmentData.bedNumber,
        checkInDate: assignmentData.checkInDate,
        contractStartDate: assignmentData.contractStartDate,
        status: 'active'
      },
      { new: true }
    ).populate('roomId');

    // Update room as occupied
    await Room.findByIdAndUpdate(room._id, { isOccupied: true });

    console.log('✅ Resident assigned successfully!');
    console.log('📊 Assignment details:');
    console.log('   - Resident:', updatedResident.firstName, updatedResident.lastName);
    console.log('   - Room:', updatedResident.roomNumber);
    console.log('   - Bed:', updatedResident.bedNumber);
    console.log('   - Check-in:', updatedResident.checkInDate);
    console.log('   - Status:', updatedResident.status);

    // 7. Test available rooms API
    console.log('\n🔄 Testing available rooms API...');
    
    const availableRooms = await Room.find({ 
      pgId: pg._id, 
      isActive: true, 
      isOccupied: false 
    }).populate('floorId');

    console.log('📊 Available rooms:', availableRooms.length);
    availableRooms.forEach(room => {
      console.log(`   - Room ${room.roomNumber} (${room.sharingType}) on Floor ${room.floorId?.name}`);
    });

    // 8. Test sharing types
    console.log('\n🔄 Testing sharing types...');
    const sharingTypes = [
      { id: '1-sharing', name: 'Single Occupancy', description: 'One person per room', cost: 8000 },
      { id: '2-sharing', name: 'Double Sharing', description: 'Two people per room', cost: 6000 },
      { id: '3-sharing', name: 'Triple Sharing', description: 'Three people per room', cost: 5000 },
      { id: '4-sharing', name: 'Quad Sharing', description: 'Four people per room', cost: 4000 }
    ];
    
    console.log('📊 Sharing types available:', sharingTypes.length);
    sharingTypes.forEach(type => {
      console.log(`   - ${type.name}: ₹${type.cost}/month`);
    });

    console.log('\n✅ Resident onboarding test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - PG:', pg.name);
    console.log('   - Floors:', floors.length);
    console.log('   - Total Rooms:', rooms.length);
    console.log('   - Residents:', residents.length);
    console.log('   - Available Rooms:', availableRooms.length);
    console.log('   - Sharing Types:', sharingTypes.length);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testResidentOnboarding(); 