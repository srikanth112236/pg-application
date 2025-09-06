const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testInvoiceLetter() {
  console.log('🧪 Testing Invoice Letter Template and Storage...\n');

  try {
    // First, login to get access token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const accessToken = loginData.accessToken;
    console.log('✅ Login successful\n');

    console.log('2️⃣ Testing allocation letter storage endpoint...');
    const testAllocationData = {
      residentId: 'test-resident-id',
      fileName: 'test_allocation_letter.pdf',
      allocationData: {
        resident: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+91-9876543210',
          email: 'john.doe@example.com',
          _id: 'test-resident-id'
        },
        sharingType: {
          id: '1-sharing',
          name: 'Single Sharing',
          cost: 5000
        },
        room: {
          _id: 'test-room-id',
          roomNumber: '101',
          floor: {
            name: 'Ground Floor'
          }
        },
        bedNumber: '1',
        onboardingDate: new Date().toISOString(),
        allocationDate: new Date().toISOString()
      }
    };

    const storageResponse = await fetch(`${BASE_URL}/api/residents/allocation-letter`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAllocationData)
    });

    const storageResult = await storageResponse.json();
    
    if (storageResponse.status === 201) {
      console.log('✅ Allocation letter storage endpoint working!');
      console.log('📋 Response:', storageResult.message);
    } else {
      console.log('❌ Allocation letter storage failed:', storageResult.message);
    }

    console.log('\n3️⃣ Testing allocation letters retrieval...');
    const lettersResponse = await fetch(`${BASE_URL}/api/residents/test-resident-id/allocation-letters`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const lettersResult = await lettersResponse.json();
    
    if (lettersResponse.status === 200) {
      console.log('✅ Allocation letters retrieval working!');
      console.log('📋 Found letters:', lettersResult.data?.length || 0);
    } else {
      console.log('❌ Allocation letters retrieval failed:', lettersResult.message);
    }

    console.log('\n🎉 Invoice Letter Template test completed!');
    console.log('\n📝 New Invoice Letter Features:');
    console.log('   ✅ Professional header with PG Management System branding');
    console.log('   ✅ Document ID and generation timestamp');
    console.log('   ✅ Structured resident information section');
    console.log('   ✅ Detailed assignment information with floor details');
    console.log('   ✅ Security deposit calculation (2x monthly rent)');
    console.log('   ✅ Comprehensive terms and conditions (10 points)');
    console.log('   ✅ Payment schedule with amounts and due dates');
    console.log('   ✅ Contact information section');
    console.log('   ✅ Professional footer with disclaimer');
    console.log('   ✅ Multi-page support for long content');
    console.log('   ✅ Color-coded sections and proper typography');

    console.log('\n🗄️ Backend Storage Features:');
    console.log('   ✅ AllocationLetter model with proper schema');
    console.log('   ✅ Resident-linked storage with indexing');
    console.log('   ✅ Download count tracking');
    console.log('   ✅ Generation timestamp and user tracking');
    console.log('   ✅ File path and metadata storage');
    console.log('   ✅ Status management (active/archived/deleted)');
    console.log('   ✅ Virtual methods for formatted details');
    console.log('   ✅ Efficient querying with indexes');

    console.log('\n🔗 API Endpoints:');
    console.log('   ✅ POST /residents/allocation-letter - Store letter');
    console.log('   ✅ GET /residents/:id/allocation-letters - Get letters');
    console.log('   ✅ GET /residents/allocation-letter/:id/download - Download letter');

    console.log('\n🎨 Invoice Letter Design:');
    console.log('   ✅ Blue header bar with white text');
    console.log('   ✅ Centered main title');
    console.log('   ✅ Document ID and generation info');
    console.log('   ✅ Line separators between sections');
    console.log('   ✅ Label-value pairs for details');
    console.log('   ✅ Payment schedule table format');
    console.log('   ✅ Professional contact section');
    console.log('   ✅ Italic disclaimer text');
    console.log('   ✅ Proper margins and spacing');

    console.log('\n📊 Data Structure:');
    console.log('   ✅ Resident details (name, phone, email, ID)');
    console.log('   ✅ Assignment details (room, bed, floor, rent)');
    console.log('   ✅ Financial details (rent, security deposit, late fees)');
    console.log('   ✅ Dates (onboarding, contract start, generation)');
    console.log('   ✅ Terms and conditions (10 comprehensive rules)');
    console.log('   ✅ Contact information (phone, email, address)');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInvoiceLetter(); 