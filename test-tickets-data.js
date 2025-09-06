const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function addSampleTicketsData() {
  console.log('🎫 Adding Sample Tickets Data for Reports Testing...\n');

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

    // Step 3: Add sample tickets with different dates and statuses
    console.log('\n3️⃣ Adding sample tickets...');
    
    const sampleTickets = [
      // Current month tickets
      {
        subject: 'Water Issue in Room 101',
        description: 'No water supply in room 101 since morning',
        priority: 'high',
        status: 'open',
        pgId: pgId,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        subject: 'Electrical Problem - Room 205',
        description: 'Power socket not working properly',
        priority: 'medium',
        status: 'in_progress',
        pgId: pgId,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        subject: 'Cleaning Request - Common Area',
        description: 'Common area needs cleaning',
        priority: 'low',
        status: 'resolved',
        pgId: pgId,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // Resolved 2 days ago
      },
      {
        subject: 'WiFi Connection Issue',
        description: 'Slow internet speed in room 103',
        priority: 'medium',
        status: 'closed',
        pgId: pgId,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // Resolved 5 days ago
      },
      {
        subject: 'Emergency - Fire Alarm',
        description: 'Fire alarm going off without reason',
        priority: 'urgent',
        status: 'resolved',
        pgId: pgId,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        resolvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // Resolved 12 days ago
      },
      // Previous month tickets
      {
        subject: 'Previous Month - Maintenance Issue',
        description: 'Old maintenance ticket from last month',
        priority: 'low',
        status: 'closed',
        pgId: pgId,
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
        resolvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Resolved 30 days ago
      },
      {
        subject: 'Previous Month - Room Complaint',
        description: 'Room temperature issue from last month',
        priority: 'medium',
        status: 'closed',
        pgId: pgId,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40 days ago
        resolvedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() // Resolved 35 days ago
      },
      // More current tickets for better data
      {
        subject: 'Food Quality Complaint',
        description: 'Food quality in mess needs improvement',
        priority: 'high',
        status: 'open',
        pgId: pgId,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        subject: 'Security Concern',
        description: 'Suspicious activity near entrance',
        priority: 'urgent',
        status: 'in_progress',
        pgId: pgId,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        subject: 'Room Temperature Issue',
        description: 'AC not working properly in room 108',
        priority: 'medium',
        status: 'resolved',
        pgId: pgId,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // Resolved 4 days ago
      }
    ];

    let successCount = 0;
    let errorCount = 0;

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
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Error adding ticket: ${ticket.subject} - ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully added: ${successCount} tickets`);
    console.log(`❌ Failed to add: ${errorCount} tickets`);

    // Step 4: Test the reports endpoint
    console.log('\n4️⃣ Testing reports endpoint...');
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const reportsResponse = await fetch(`${BASE_URL}/reports/tickets?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const reportsData = await reportsResponse.json();
    
    if (reportsData.success) {
      console.log('✅ Reports endpoint working');
      console.log('📊 Tickets report data:');
      console.log(`   - Total tickets: ${reportsData.data.statistics.total}`);
      console.log(`   - Open tickets: ${reportsData.data.statistics.open}`);
      console.log(`   - In Progress: ${reportsData.data.statistics.inProgress}`);
      console.log(`   - Resolved: ${reportsData.data.statistics.resolved}`);
      console.log(`   - Closed: ${reportsData.data.statistics.closed}`);
      console.log(`   - Monthly trend points: ${reportsData.data.monthlyTrend.length}`);
    } else {
      console.log('❌ Reports endpoint failed:', reportsData.message);
    }

    console.log('\n🎉 Sample tickets data setup completed!');
    console.log('💡 You can now test the reports page with real data.');

  } catch (error) {
    console.error('❌ Error in setup:', error);
  }
}

// Run the script
addSampleTicketsData(); 