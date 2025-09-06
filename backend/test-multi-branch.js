const axios = require('axios');
require('dotenv').config();

async function testMultiBranchSystem() {
  try {
    console.log('🧪 Testing Multi-Branch PG System...');

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

    // Test branch creation
    console.log('\n🏢 Testing branch creation...');
    const branchData = {
      name: 'Main Branch',
      address: {
        street: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        landmark: 'Near Railway Station'
      },
      maintainer: {
        name: 'John Doe',
        mobile: '9876543210',
        email: 'john@example.com'
      },
      contact: {
        phone: '9876543210',
        email: 'contact@example.com',
        alternatePhone: '9876543211'
      },
      capacity: {
        totalRooms: 20,
        totalBeds: 40,
        availableRooms: 15
      },
      amenities: ['WiFi', 'AC', 'Food', 'Laundry'],
      status: 'active'
    };

    try {
      const createBranchResponse = await axios.post('http://localhost:5000/api/branches', branchData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Create branch:', {
        success: createBranchResponse.data.success,
        message: createBranchResponse.data.message,
        branchId: createBranchResponse.data.data?._id
      });

      const branchId = createBranchResponse.data.data._id;

      // Test getting branches
      console.log('\n📋 Testing get branches...');
      try {
        const getBranchesResponse = await axios.get('http://localhost:5000/api/branches', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Get branches:', {
          success: getBranchesResponse.data.success,
          count: getBranchesResponse.data.data?.length
        });
      } catch (error) {
        console.log('❌ Get branches failed:', error.response?.data?.message || error.message);
      }

      // Test floor creation
      console.log('\n🏢 Testing floor creation...');
      const floorData = {
        name: 'Ground Floor',
        description: 'Main entrance floor with reception',
        totalRooms: 5
      };

      try {
        const createFloorResponse = await axios.post('http://localhost:5000/api/pg/floors', floorData, {
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

        const floorId = createFloorResponse.data.data._id;

        // Test room creation
        console.log('\n🛏️ Testing room creation...');
        const roomData = {
          floorId: floorId,
          roomNumber: '101',
          numberOfBeds: 2,
          sharingType: '2-sharing',
          cost: 6000,
          description: 'Comfortable double sharing room'
        };

        try {
          const createRoomResponse = await axios.post('http://localhost:5000/api/pg/rooms', roomData, {
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
        } catch (error) {
          console.log('❌ Create room failed:', error.response?.data?.message || error.message);
        }

        // Test getting floors
        console.log('\n📋 Testing get floors...');
        try {
          const getFloorsResponse = await axios.get('http://localhost:5000/api/pg/floors', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ Get floors:', {
            success: getFloorsResponse.data.success,
            count: getFloorsResponse.data.data?.length
          });
        } catch (error) {
          console.log('❌ Get floors failed:', error.response?.data?.message || error.message);
        }

        // Test getting rooms
        console.log('\n📋 Testing get rooms...');
        try {
          const getRoomsResponse = await axios.get('http://localhost:5000/api/pg/rooms', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('✅ Get rooms:', {
            success: getRoomsResponse.data.success,
            count: getRoomsResponse.data.data?.length
          });
        } catch (error) {
          console.log('❌ Get rooms failed:', error.response?.data?.message || error.message);
        }

      } catch (error) {
        console.log('❌ Create floor failed:', error.response?.data?.message || error.message);
      }

      // Test branch statistics
      console.log('\n📊 Testing branch statistics...');
      try {
        const statsResponse = await axios.get('http://localhost:5000/api/branches/stats', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Branch stats:', {
          success: statsResponse.data.success,
          count: statsResponse.data.data?.length
        });
      } catch (error) {
        console.log('❌ Branch stats failed:', error.response?.data?.message || error.message);
      }

    } catch (error) {
      console.log('❌ Create branch failed:', error.response?.data?.message || error.message);
    }

    console.log('\n✅ Multi-branch system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testMultiBranchSystem(); 