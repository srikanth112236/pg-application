require('dotenv').config();

async function testBranchRoutes() {
  try {
    console.log('🧪 Testing Branch Routes...');
    
    // Test login first
    console.log('\n🔐 Testing login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    const { accessToken } = loginData.data.tokens;
    console.log('✅ Login successful');
    
    // Test GET /api/branches
    console.log('\n📋 Testing GET /api/branches...');
    try {
      const getBranchesResponse = await fetch('http://localhost:5000/api/branches', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const getBranchesData = await getBranchesResponse.json();
      console.log('✅ GET /api/branches:', getBranchesData);
    } catch (error) {
      console.log('❌ GET /api/branches failed:', error.message);
    }
    
    // Test POST /api/branches
    console.log('\n🏢 Testing POST /api/branches...');
    try {
      const branchData = {
        name: 'Test Branch',
        address: {
          street: 'Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          landmark: 'Test Landmark'
        },
        maintainer: {
          name: 'Test Maintainer',
          mobile: '1234567890',
          email: 'maintainer@test.com'
        },
        contact: {
          phone: '1234567890',
          email: 'contact@test.com',
          alternatePhone: ''
        },
        capacity: {
          totalRooms: 5,
          totalBeds: 10,
          availableRooms: 5
        },
        amenities: ['WiFi', 'AC'],
        status: 'active'
      };
      
      const createBranchResponse = await fetch('http://localhost:5000/api/branches', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchData)
      });
      const createBranchData = await createBranchResponse.json();
      console.log('✅ POST /api/branches:', createBranchData);
    } catch (error) {
      console.log('❌ POST /api/branches failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBranchRoutes(); 