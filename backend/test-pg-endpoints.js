const axios = require('axios');
require('dotenv').config();

async function testPGEndpoints() {
  try {
    console.log('🧪 Testing PG Management Endpoints...');

    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const { accessToken } = loginResponse.data.data.tokens;
    console.log('✅ Login successful, got access token');

    // Test sharing types endpoint
    console.log('\n💰 Testing sharing types...');
    try {
      const sharingTypesResponse = await axios.get('http://localhost:5000/api/pg/sharing-types', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Sharing types:', {
        success: sharingTypesResponse.data.success,
        count: sharingTypesResponse.data.data?.length,
        types: sharingTypesResponse.data.data?.map(t => t.type)
      });
    } catch (error) {
      console.log('❌ Sharing types failed:', error.response?.data?.message || error.message);
    }

    // Test floors endpoint
    console.log('\n🏢 Testing floors...');
    try {
      const floorsResponse = await axios.get('http://localhost:5000/api/pg/floors', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Floors:', {
        success: floorsResponse.data.success,
        count: floorsResponse.data.data?.length
      });
    } catch (error) {
      console.log('❌ Floors failed:', error.response?.data?.message || error.message);
    }

    // Test rooms endpoint
    console.log('\n🛏️ Testing rooms...');
    try {
      const roomsResponse = await axios.get('http://localhost:5000/api/pg/rooms', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Rooms:', {
        success: roomsResponse.data.success,
        count: roomsResponse.data.data?.length
      });
    } catch (error) {
      console.log('❌ Rooms failed:', error.response?.data?.message || error.message);
    }

    // Test floor creation
    console.log('\n➕ Testing floor creation...');
    try {
      const createFloorResponse = await axios.post('http://localhost:5000/api/pg/floors', {
        name: 'Ground Floor',
        description: 'Main entrance floor',
        totalRooms: 5
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Create floor:', {
        success: createFloorResponse.data.success,
        message: createFloorResponse.data.message,
        floorId: createFloorResponse.data.data?._id
      });

      if (createFloorResponse.data.success) {
        const floorId = createFloorResponse.data.data._id;

        // Test room creation
        console.log('\n➕ Testing room creation...');
        try {
          const createRoomResponse = await axios.post('http://localhost:5000/api/pg/rooms', {
            floorId: floorId,
            roomNumber: '101',
            numberOfBeds: 2,
            sharingType: '2-sharing',
            cost: 6000,
            description: 'Comfortable double sharing room'
          }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ Create room:', {
            success: createRoomResponse.data.success,
            message: createRoomResponse.data.message,
            roomId: createRoomResponse.data.data?._id
          });

          // Test room update
          if (createRoomResponse.data.success) {
            const roomId = createRoomResponse.data.data._id;
            
            console.log('\n✏️ Testing room update...');
            try {
              const updateRoomResponse = await axios.put(`http://localhost:5000/api/pg/rooms/${roomId}`, {
                roomNumber: '101A',
                numberOfBeds: 3,
                sharingType: '3-sharing',
                cost: 5000,
                description: 'Updated triple sharing room'
              }, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              });

              console.log('✅ Update room:', {
                success: updateRoomResponse.data.success,
                message: updateRoomResponse.data.message
              });
            } catch (error) {
              console.log('❌ Update room failed:', error.response?.data?.message || error.message);
            }

            // Test room deletion
            console.log('\n🗑️ Testing room deletion...');
            try {
              const deleteRoomResponse = await axios.delete(`http://localhost:5000/api/pg/rooms/${roomId}`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                }
              });

              console.log('✅ Delete room:', {
                success: deleteRoomResponse.data.success,
                message: deleteRoomResponse.data.message
              });
            } catch (error) {
              console.log('❌ Delete room failed:', error.response?.data?.message || error.message);
            }
          }
        } catch (error) {
          console.log('❌ Create room failed:', error.response?.data?.message || error.message);
        }

        // Test floor deletion
        console.log('\n🗑️ Testing floor deletion...');
        try {
          const deleteFloorResponse = await axios.delete(`http://localhost:5000/api/pg/floors/${floorId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ Delete floor:', {
            success: deleteFloorResponse.data.success,
            message: deleteFloorResponse.data.message
          });
        } catch (error) {
          console.log('❌ Delete floor failed:', error.response?.data?.message || error.message);
        }
      }
    } catch (error) {
      console.log('❌ Create floor failed:', error.response?.data?.message || error.message);
    }

    // Test statistics endpoints
    console.log('\n📊 Testing statistics...');
    try {
      const floorStatsResponse = await axios.get('http://localhost:5000/api/pg/floors/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Floor stats:', {
        success: floorStatsResponse.data.success,
        count: floorStatsResponse.data.data?.length
      });
    } catch (error) {
      console.log('❌ Floor stats failed:', error.response?.data?.message || error.message);
    }

    try {
      const roomStatsResponse = await axios.get('http://localhost:5000/api/pg/rooms/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Room stats:', {
        success: roomStatsResponse.data.success,
        totalRooms: roomStatsResponse.data.data?.totalRooms,
        availableRooms: roomStatsResponse.data.data?.availableRooms
      });
    } catch (error) {
      console.log('❌ Room stats failed:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ PG Management endpoints test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPGEndpoints(); 