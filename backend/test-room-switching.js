const mongoose = require('mongoose');
const Resident = require('./src/models/resident.model');
const Room = require('./src/models/room.model');
const ResidentService = require('./src/services/resident.service');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pg-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const residentService = new ResidentService();

async function testRoomSwitching() {
  try {
    console.log('🧪 Testing Room Switching Functionality...\n');

    // 1. Get some residents and rooms for testing
    console.log('📊 Getting test data...');
    
    const residents = await Resident.find({ status: 'active' }).limit(2);
    const rooms = await Room.find({ isActive: true }).limit(3);
    
    if (residents.length === 0) {
      console.log('❌ No active residents found for testing');
      return;
    }
    
    if (rooms.length === 0) {
      console.log('❌ No active rooms found for testing');
      return;
    }
    
    console.log(`✅ Found ${residents.length} residents and ${rooms.length} rooms for testing`);
    
    // 2. Test getting available rooms for switching
    console.log('\n🔍 Testing getAvailableRoomsForSwitch...');
    
    const testResident = residents[0];
    const availableRooms = await residentService.getAvailableRoomsForSwitch(
      testResident.pgId,
      testResident.roomId || null
    );
    
    if (availableRooms.success) {
      console.log(`✅ Found ${availableRooms.data.length} available rooms for switching`);
      console.log('📋 Available rooms:', availableRooms.data.map(r => ({
        roomNumber: r.roomNumber,
        sharingType: r.sharingType,
        availableBeds: r.availableBedCount
      })));
    } else {
      console.log('❌ Failed to get available rooms:', availableRooms.message);
    }
    
    // 3. Test room switching if we have a resident with a room and available rooms
    if (testResident.roomId && availableRooms.success && availableRooms.data.length > 0) {
      console.log('\n🔄 Testing room switching...');
      
      const targetRoom = availableRooms.data[0];
      const targetBed = targetRoom.availableBeds[0]?.bedNumber;
      
      if (targetBed) {
        console.log(`🔄 Switching resident ${testResident.firstName} ${testResident.lastName}`);
        console.log(`   From: Room ${testResident.roomNumber} - Bed ${testResident.bedNumber}`);
        console.log(`   To: Room ${targetRoom.roomNumber} - Bed ${targetBed}`);
        
        const switchResult = await residentService.switchResidentRoom(
          testResident._id,
          targetRoom._id,
          targetBed,
          { reason: 'Test room switch', trackHistory: true },
          testResident.createdBy || 'test-user'
        );
        
        if (switchResult.success) {
          console.log('✅ Room switch successful!');
          console.log('📊 Switch details:', switchResult.data.switchDetails);
          
          // Verify the switch
          const updatedResident = await Resident.findById(testResident._id);
          console.log('✅ Resident updated:', {
            roomNumber: updatedResident.roomNumber,
            bedNumber: updatedResident.bedNumber,
            sharingType: updatedResident.sharingType,
            cost: updatedResident.cost
          });
          
          // Check if switch history was recorded
          if (updatedResident.switchHistory && updatedResident.switchHistory.length > 0) {
            console.log('✅ Switch history recorded:', updatedResident.switchHistory.length, 'entries');
          }
          
        } else {
          console.log('❌ Room switch failed:', switchResult.message);
        }
      } else {
        console.log('⚠️  No available beds found for testing');
      }
    } else {
      console.log('⚠️  Skipping room switch test - resident not in room or no available rooms');
    }
    
    // 4. Test getting switch history
    console.log('\n📚 Testing getResidentSwitchHistory...');
    
    const historyResult = await residentService.getResidentSwitchHistory(testResident._id);
    
    if (historyResult.success) {
      console.log(`✅ Found ${historyResult.data.length} switch history records`);
      if (historyResult.data.length > 0) {
        console.log('📋 Latest switch:', historyResult.data[historyResult.data.length - 1]);
      }
    } else {
      console.log('❌ Failed to get switch history:', historyResult.message);
    }
    
    console.log('\n✅ Room switching tests completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the test
testRoomSwitching();
