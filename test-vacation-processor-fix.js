const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testVacationProcessorFix() {
  console.log('🔧 Testing Vacation Processor Fix...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }

    const accessToken = loginData.data.accessToken;
    console.log('✅ Login successful');

    // Step 2: Check for overdue vacations
    console.log('\n2️⃣ Checking for overdue vacations...');
    const overdueResponse = await fetch(`${BASE_URL}/residents/overdue-vacations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const overdueData = await overdueResponse.json();
    
    if (overdueData.success) {
      console.log(`📊 Found ${overdueData.data.count} overdue vacations`);
      
      if (overdueData.data.overdueResidents.length > 0) {
        console.log('📋 Overdue residents:');
        overdueData.data.overdueResidents.forEach((resident, index) => {
          const daysOverdue = Math.ceil((new Date() - new Date(resident.vacationDate)) / (1000 * 60 * 60 * 24));
          console.log(`   ${index + 1}. ${resident.firstName} ${resident.lastName} - Room ${resident.roomNumber}, Bed ${resident.bedNumber} - ${daysOverdue} days overdue`);
        });
      }
    } else {
      console.log('❌ Failed to fetch overdue vacations:', overdueData.message);
    }

    // Step 3: Process overdue vacations
    console.log('\n3️⃣ Processing overdue vacations...');
    const processResponse = await fetch(`${BASE_URL}/residents/process-vacations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const processData = await processResponse.json();
    
    if (processData.success) {
      console.log('✅ Vacation processor completed successfully');
      console.log(`📊 Processed: ${processData.data.processedCount}, Errors: ${processData.data.errorCount}`);
    } else {
      console.log('❌ Vacation processor failed:', processData.message);
    }

    // Step 4: Check again for overdue vacations
    console.log('\n4️⃣ Checking for overdue vacations again...');
    const overdueResponse2 = await fetch(`${BASE_URL}/residents/overdue-vacations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const overdueData2 = await overdueResponse2.json();
    
    if (overdueData2.success) {
      console.log(`📊 Found ${overdueData2.data.count} overdue vacations after processing`);
      
      if (overdueData2.data.count === 0) {
        console.log('🎉 All overdue vacations have been processed successfully!');
      } else {
        console.log('⚠️ Some overdue vacations still remain');
      }
    }

    console.log('\n🎉 Vacation processor fix test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVacationProcessorFix(); 