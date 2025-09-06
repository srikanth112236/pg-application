const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testTicketsData() {
  console.log('🎫 Testing Tickets Data and Reports...\n');

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

    // Step 3: Add sample tickets
    console.log('\n3️⃣ Adding sample tickets...');
    
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

    let successCount = 0;
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
          successCount++;
        } else {
          console.log(`❌ Failed to add ticket: ${ticket.subject} - ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding ticket: ${ticket.subject} - ${error.message}`);
      }
    }

    console.log(`\n📊 Added ${successCount} tickets successfully`);

    // Step 4: Test tickets report
    console.log('\n4️⃣ Testing tickets report...');
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const reportsResponse = await fetch(`${BASE_URL}/reports/tickets?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const reportsData = await reportsResponse.json();
    
    if (reportsData.success) {
      console.log('✅ Tickets report working');
      console.log('📊 Tickets report data:');
      console.log(`   - Total tickets: ${reportsData.data.statistics.total}`);
      console.log(`   - Open tickets: ${reportsData.data.statistics.open}`);
      console.log(`   - In Progress: ${reportsData.data.statistics.inProgress}`);
      console.log(`   - Resolved: ${reportsData.data.statistics.resolved}`);
      console.log(`   - Closed: ${reportsData.data.statistics.closed}`);
      console.log(`   - Monthly trend points: ${reportsData.data.monthlyTrend.length}`);
      
      if (reportsData.data.comparisonData) {
        console.log(`   - Comparison data available: ${reportsData.data.comparisonData.currentPeriod.count} current vs ${reportsData.data.comparisonData.previousPeriod.count} previous`);
      }
      
      if (reportsData.data.resolutionTimeData) {
        console.log(`   - Resolution time data available: ${reportsData.data.resolutionTimeData.totalResolved} resolved tickets`);
      }
    } else {
      console.log('❌ Tickets report failed:', reportsData.message);
    }

    // Step 5: Test export functionality
    console.log('\n5️⃣ Testing export functionality...');
    
    try {
      const exportResponse = await fetch(`${BASE_URL}/reports/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          reportType: 'tickets',
          filters: { startDate, endDate },
          format: 'csv'
        })
      });

      if (exportResponse.ok) {
        console.log('✅ Export functionality working');
        const contentType = exportResponse.headers.get('content-type');
        console.log(`   - Content-Type: ${contentType}`);
        console.log(`   - Content-Disposition: ${exportResponse.headers.get('content-disposition')}`);
      } else {
        console.log('❌ Export failed:', exportResponse.status, exportResponse.statusText);
      }
    } catch (error) {
      console.log('❌ Export error:', error.message);
    }

    console.log('\n🎉 Tickets testing completed!');
    console.log('💡 You can now test the tickets report in the frontend.');

  } catch (error) {
    console.error('❌ Error in testing:', error);
  }
}

// Run the script
testTicketsData(); 