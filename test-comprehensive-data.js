const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function populateComprehensiveData() {
  console.log('🎯 Populating Comprehensive Data for Reports Testing...\n');

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

    // Step 2: Get PG ID
    console.log('\n2️⃣ Getting PG information...');
    const pgResponse = await fetch(`${BASE_URL}/users/pg-info`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const pgData = await pgResponse.json();
    let pgId = null;

    if (pgData.success && pgData.data.pg) {
      pgId = pgData.data.pg._id;
      console.log('✅ PG ID found:', pgId);
    } else {
      console.log('⚠️ No PG found, will use default');
    }

    // Step 3: Add comprehensive sample data
    console.log('\n3️⃣ Adding comprehensive sample data...');
    
    // Sample Residents Data
    const sampleResidents = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+91-9876543210',
        gender: 'male',
        status: 'active',
        checkInDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        rentAmount: 8000,
        pgId: pgId
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+91-9876543211',
        gender: 'female',
        status: 'active',
        checkInDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        rentAmount: 8500,
        pgId: pgId
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+91-9876543212',
        gender: 'male',
        status: 'notice_period',
        checkInDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        rentAmount: 7500,
        pgId: pgId
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@example.com',
        phone: '+91-9876543213',
        gender: 'female',
        status: 'moved_out',
        checkInDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        checkOutDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        rentAmount: 8000,
        pgId: pgId
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@example.com',
        phone: '+91-9876543214',
        gender: 'male',
        status: 'pending',
        rentAmount: 9000,
        pgId: pgId
      }
    ];

    // Sample Payments Data
    const samplePayments = [
      {
        residentId: null, // Will be set after resident creation
        amount: 8000,
        paymentMethod: 'upi',
        status: 'paid',
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        pgId: pgId
      },
      {
        residentId: null,
        amount: 8500,
        paymentMethod: 'cash',
        status: 'paid',
        paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        pgId: pgId
      },
      {
        residentId: null,
        amount: 7500,
        paymentMethod: 'online_transfer',
        status: 'pending',
        paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        pgId: pgId
      },
      {
        residentId: null,
        amount: 8000,
        paymentMethod: 'card',
        status: 'overdue',
        paymentDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        pgId: pgId
      }
    ];

    // Sample Tickets Data
    const sampleTickets = [
      {
        subject: 'Water Issue in Room 101',
        description: 'No water supply in room 101 since morning',
        priority: 'high',
        status: 'open',
        pgId: pgId,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        subject: 'Electrical Problem - Room 205',
        description: 'Power socket not working properly',
        priority: 'medium',
        status: 'in_progress',
        pgId: pgId,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        subject: 'Cleaning Request - Common Area',
        description: 'Common area needs cleaning',
        priority: 'low',
        status: 'resolved',
        pgId: pgId,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        subject: 'WiFi Connection Issue',
        description: 'Slow internet speed in room 103',
        priority: 'medium',
        status: 'closed',
        pgId: pgId,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        subject: 'Emergency - Fire Alarm',
        description: 'Fire alarm going off without reason',
        priority: 'urgent',
        status: 'resolved',
        pgId: pgId,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Add residents first
    console.log('\n📝 Adding residents...');
    const residentIds = [];
    for (const resident of sampleResidents) {
      try {
        const response = await fetch(`${BASE_URL}/residents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(resident)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Added resident: ${resident.firstName} ${resident.lastName}`);
          residentIds.push(result.data._id);
        } else {
          console.log(`❌ Failed to add resident: ${resident.firstName} ${resident.lastName} - ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding resident: ${resident.firstName} ${resident.lastName} - ${error.message}`);
      }
    }

    // Add payments with resident IDs
    console.log('\n💰 Adding payments...');
    for (let i = 0; i < Math.min(samplePayments.length, residentIds.length); i++) {
      const payment = { ...samplePayments[i], residentId: residentIds[i] };
      try {
        const response = await fetch(`${BASE_URL}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(payment)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Added payment: ₹${payment.amount} for resident ${i + 1}`);
        } else {
          console.log(`❌ Failed to add payment: ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding payment: ${error.message}`);
      }
    }

    // Add tickets
    console.log('\n🎫 Adding tickets...');
    for (const ticket of sampleTickets) {
      try {
        const response = await fetch(`${BASE_URL}/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(ticket)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log(`✅ Added ticket: ${ticket.subject}`);
        } else {
          console.log(`❌ Failed to add ticket: ${ticket.subject} - ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding ticket: ${ticket.subject} - ${error.message}`);
      }
    }

    // Step 4: Test all report endpoints
    console.log('\n4️⃣ Testing all report endpoints...');
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const reportTypes = ['residents', 'payments', 'tickets', 'onboarding', 'offboarding'];
    
    for (const reportType of reportTypes) {
      try {
        const reportsResponse = await fetch(`${BASE_URL}/reports/${reportType}?startDate=${startDate}&endDate=${endDate}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const reportsData = await reportsResponse.json();
        
        if (reportsData.success) {
          console.log(`✅ ${reportType} report working`);
          console.log(`   - Total items: ${reportsData.data.statistics.total}`);
          console.log(`   - Monthly trend points: ${reportsData.data.monthlyTrend.length}`);
        } else {
          console.log(`❌ ${reportType} report failed:`, reportsData.message);
        }
      } catch (error) {
        console.log(`❌ Error testing ${reportType} report:`, error.message);
      }
    }

    console.log('\n🎉 Comprehensive data setup completed!');
    console.log('💡 You can now test all report types with real data.');
    console.log('📊 Expected data:');
    console.log('   - Residents: 5 (active, notice_period, moved_out, pending)');
    console.log('   - Payments: 4 (paid, pending, overdue)');
    console.log('   - Tickets: 5 (open, in_progress, resolved, closed)');

  } catch (error) {
    console.error('❌ Error in setup:', error);
  }
}

// Run the script
populateComprehensiveData(); 