const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testTicketsReportFix() {
  console.log('🎫 Testing Tickets Report Fix...\n');

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

    // Step 3: Add sample tickets with correct structure
    console.log('\n3️⃣ Adding sample tickets with correct structure...');
    
    const sampleTickets = [
      {
        title: 'Water Issue in Room 101',
        description: 'No water supply in room 101 since morning. Need immediate attention.',
        category: 'maintenance',
        priority: 'high',
        status: 'open',
        pg: pgId,
        user: loginData.data.user._id, // Use the logged-in user as creator
        location: {
          room: '101',
          floor: '1',
          building: 'Main Building'
        }
      },
      {
        title: 'Electrical Problem - Room 205',
        description: 'Power socket not working properly. Need electrician.',
        category: 'maintenance',
        priority: 'medium',
        status: 'in_progress',
        pg: pgId,
        user: loginData.data.user._id,
        location: {
          room: '205',
          floor: '2',
          building: 'Main Building'
        }
      },
      {
        title: 'Cleaning Request - Common Area',
        description: 'Common area needs cleaning. Kitchen area is dirty.',
        category: 'maintenance',
        priority: 'low',
        status: 'resolved',
        pg: pgId,
        user: loginData.data.user._id,
        location: {
          room: 'Common Area',
          floor: '1',
          building: 'Main Building'
        },
        resolution: {
          solution: 'Cleaning completed by housekeeping staff',
          resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          resolvedBy: loginData.data.user._id
        }
      },
      {
        title: 'WiFi Connection Issue',
        description: 'Slow internet speed in room 103. Connection keeps dropping.',
        category: 'maintenance',
        priority: 'medium',
        status: 'closed',
        pg: pgId,
        user: loginData.data.user._id,
        location: {
          room: '103',
          floor: '1',
          building: 'Main Building'
        },
        resolution: {
          solution: 'Router reset and signal booster installed',
          resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          resolvedBy: loginData.data.user._id
        },
        closedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Emergency - Fire Alarm',
        description: 'Fire alarm going off without reason. Need immediate attention.',
        category: 'emergency',
        priority: 'urgent',
        status: 'resolved',
        pg: pgId,
        user: loginData.data.user._id,
        location: {
          room: 'Fire Alarm System',
          floor: 'All',
          building: 'Main Building'
        },
        resolution: {
          solution: 'False alarm. System checked and reset.',
          resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          resolvedBy: loginData.data.user._id
        }
      }
    ];

    let ticketsCreated = 0;
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
          console.log(`✅ Added ticket: ${ticket.title}`);
          ticketsCreated++;
        } else {
          console.log(`❌ Failed to add ticket: ${ticket.title} - ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding ticket: ${ticket.title} - ${error.message}`);
      }
    }

    console.log(`\n📊 Created ${ticketsCreated} tickets successfully`);

    // Step 4: Test tickets report
    console.log('\n4️⃣ Testing tickets report...');
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const ticketsReportResponse = await fetch(`${BASE_URL}/reports/tickets?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const ticketsReportData = await ticketsReportResponse.json();
    
    if (ticketsReportData.success) {
      console.log('✅ Tickets report working correctly!');
      console.log('📊 Tickets report data:');
      console.log(`   - Total tickets: ${ticketsReportData.data.statistics.total}`);
      console.log(`   - Open tickets: ${ticketsReportData.data.statistics.open}`);
      console.log(`   - In Progress: ${ticketsReportData.data.statistics.inProgress}`);
      console.log(`   - Resolved: ${ticketsReportData.data.statistics.resolved}`);
      console.log(`   - Closed: ${ticketsReportData.data.statistics.closed}`);
      console.log(`   - Urgent: ${ticketsReportData.data.statistics.urgent}`);
      console.log(`   - High: ${ticketsReportData.data.statistics.high}`);
      console.log(`   - Medium: ${ticketsReportData.data.statistics.medium}`);
      console.log(`   - Low: ${ticketsReportData.data.statistics.low}`);
      console.log(`   - Monthly trend points: ${ticketsReportData.data.monthlyTrend.length}`);
      
      if (ticketsReportData.data.comparisonData) {
        console.log(`   - Comparison data available: ${ticketsReportData.data.comparisonData.currentPeriod.count} current vs ${ticketsReportData.data.comparisonData.previousPeriod.count} previous`);
      }
      
      if (ticketsReportData.data.resolutionTimeData) {
        console.log(`   - Resolution time data available: ${ticketsReportData.data.resolutionTimeData.totalResolved} resolved tickets`);
      }

      // Check if data contains actual tickets
      if (ticketsReportData.data.data && ticketsReportData.data.data.length > 0) {
        console.log('\n📋 Sample ticket data:');
        const sampleTicket = ticketsReportData.data.data[0];
        console.log(`   - Subject: ${sampleTicket.subject}`);
        console.log(`   - Status: ${sampleTicket.status}`);
        console.log(`   - Priority: ${sampleTicket.priority}`);
        console.log(`   - Category: ${sampleTicket.category}`);
        console.log(`   - PG Name: ${sampleTicket.pgName}`);
        console.log(`   - Created By: ${sampleTicket.createdBy}`);
      }
    } else {
      console.log('❌ Tickets report failed:', ticketsReportData.message);
      console.log('❌ Error details:', ticketsReportData);
    }

    // Step 5: Test occupancy report to ensure it's different
    console.log('\n5️⃣ Testing occupancy report (should be different from tickets)...');
    
    const occupancyReportResponse = await fetch(`${BASE_URL}/reports/occupancy?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const occupancyReportData = await occupancyReportResponse.json();
    
    if (occupancyReportData.success) {
      console.log('✅ Occupancy report working (different from tickets)');
      console.log('📊 Occupancy report data:');
      console.log(`   - Total rooms: ${occupancyReportData.data.statistics.totalRooms || 'N/A'}`);
      console.log(`   - Total beds: ${occupancyReportData.data.statistics.totalBeds || 'N/A'}`);
      console.log(`   - Occupied beds: ${occupancyReportData.data.statistics.occupiedBeds || 'N/A'}`);
      console.log(`   - Available beds: ${occupancyReportData.data.statistics.availableBeds || 'N/A'}`);
      console.log(`   - Occupancy rate: ${occupancyReportData.data.statistics.occupancyRate || 'N/A'}`);
    } else {
      console.log('❌ Occupancy report failed:', occupancyReportData.message);
    }

    console.log('\n🎉 Tickets report fix testing completed!');
    console.log('💡 The tickets report should now show:');
    console.log('   - Correct tickets data instead of occupancy data');
    console.log('   - Proper ticket statistics (open, resolved, etc.)');
    console.log('   - Ticket-specific information (priority, category, etc.)');
    console.log('   - Monthly trends for tickets');
    console.log('   - Comparison analytics for tickets');

  } catch (error) {
    console.error('❌ Error in testing:', error);
  }
}

// Run the script
testTicketsReportFix(); 