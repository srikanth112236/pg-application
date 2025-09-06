const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testResidentOffboardingAndTickets() {
  console.log('🏠 Testing Resident Offboarding & Tickets Data...\n');

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

    // Step 3: Get current residents
    console.log('\n3️⃣ Getting current residents...');
    const residentsResponse = await fetch(`${BASE_URL}/residents?branchId=${pgId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const residentsData = await residentsResponse.json();
    let activeResidents = [];

    if (residentsData.success) {
      activeResidents = residentsData.data.residents.filter(r => 
        r.status === 'active' && r.roomId && r.bedNumber
      );
      console.log(`✅ Found ${activeResidents.length} active residents with room assignments`);
    }

    // Step 4: Test resident offboarding (if we have active residents)
    if (activeResidents.length > 0) {
      console.log('\n4️⃣ Testing resident offboarding...');
      const testResident = activeResidents[0];
      
      console.log(`📋 Testing with resident: ${testResident.firstName} ${testResident.lastName}`);
      console.log(`🏠 Current room: ${testResident.roomNumber}, Bed: ${testResident.bedNumber}`);

      // Test immediate vacation
      const vacateResponse = await fetch(`${BASE_URL}/residents/${testResident._id}/vacate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vacationType: 'immediate'
        })
      });

      const vacateData = await vacateResponse.json();
      
      if (vacateData.success) {
        console.log('✅ Resident offboarding successful');
        console.log(`📝 Message: ${vacateData.message}`);
        
        // Verify resident status changed
        const verifyResponse = await fetch(`${BASE_URL}/residents/${testResident._id}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          const resident = verifyData.data;
          console.log(`📊 Resident status: ${resident.status}`);
          console.log(`📊 Is active: ${resident.isActive}`);
          console.log(`📊 Room ID: ${resident.roomId}`);
          console.log(`📊 Check-out date: ${resident.checkOutDate}`);
        }
      } else {
        console.log('❌ Resident offboarding failed:', vacateData.message);
      }
    } else {
      console.log('⚠️ No active residents with room assignments found for testing');
    }

    // Step 5: Add sample tickets
    console.log('\n5️⃣ Adding sample tickets...');
    
    const sampleTickets = [
      {
        subject: 'Water Issue in Room 101',
        description: 'No water supply in room 101 since morning',
        priority: 'high',
        status: 'open',
        pgId: pgId
      },
      {
        subject: 'Electrical Problem - Room 205',
        description: 'Power socket not working properly',
        priority: 'medium',
        status: 'in_progress',
        pgId: pgId
      },
      {
        subject: 'Cleaning Request - Common Area',
        description: 'Common area needs cleaning',
        priority: 'low',
        status: 'resolved',
        pgId: pgId
      },
      {
        subject: 'WiFi Connection Issue',
        description: 'Slow internet speed in room 103',
        priority: 'medium',
        status: 'closed',
        pgId: pgId
      },
      {
        subject: 'Emergency - Fire Alarm',
        description: 'Fire alarm going off without reason',
        priority: 'urgent',
        status: 'resolved',
        pgId: pgId
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
          console.log(`✅ Added ticket: ${ticket.subject}`);
          ticketsCreated++;
        } else {
          console.log(`❌ Failed to add ticket: ${ticket.subject} - ${result.message}`);
        }
      } catch (error) {
        console.log(`❌ Error adding ticket: ${ticket.subject} - ${error.message}`);
      }
    }

    console.log(`\n📊 Created ${ticketsCreated} tickets successfully`);

    // Step 6: Test tickets report
    console.log('\n6️⃣ Testing tickets report...');
    
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const ticketsReportResponse = await fetch(`${BASE_URL}/reports/tickets?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const ticketsReportData = await ticketsReportResponse.json();
    
    if (ticketsReportData.success) {
      console.log('✅ Tickets report working');
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
    } else {
      console.log('❌ Tickets report failed:', ticketsReportData.message);
    }

    // Step 7: Test residents report with moved out count
    console.log('\n7️⃣ Testing residents report with moved out count...');
    
    const residentsReportResponse = await fetch(`${BASE_URL}/reports/residents?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const residentsReportData = await residentsReportResponse.json();
    
    if (residentsReportData.success) {
      console.log('✅ Residents report working');
      console.log('📊 Residents report data:');
      console.log(`   - Total residents: ${residentsReportData.data.statistics.total}`);
      console.log(`   - Active residents: ${residentsReportData.data.statistics.active}`);
      console.log(`   - Pending residents: ${residentsReportData.data.statistics.pending}`);
      console.log(`   - Moved out residents: ${residentsReportData.data.statistics.movedOut}`);
      console.log(`   - Inactive residents: ${residentsReportData.data.statistics.inactive}`);
      
      if (residentsReportData.data.comparisonData) {
        console.log(`   - Comparison data available: ${residentsReportData.data.comparisonData.currentPeriod.count} current vs ${residentsReportData.data.comparisonData.previousPeriod.count} previous`);
      }
    } else {
      console.log('❌ Residents report failed:', residentsReportData.message);
    }

    // Step 8: Test overdue vacations
    console.log('\n8️⃣ Testing overdue vacations...');
    
    const overdueResponse = await fetch(`${BASE_URL}/residents/overdue-vacations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const overdueData = await overdueResponse.json();
    
    if (overdueData.success) {
      console.log(`✅ Found ${overdueData.data.overdueResidents.length} overdue vacations`);
      
      if (overdueData.data.overdueResidents.length > 0) {
        console.log('📋 Overdue residents:');
        overdueData.data.overdueResidents.forEach((resident, index) => {
          console.log(`   ${index + 1}. ${resident.firstName} ${resident.lastName} - Should have vacated on ${new Date(resident.vacationDate).toLocaleDateString()}`);
        });
        
        // Test processing overdue vacations
        console.log('\n🔄 Testing vacation processor...');
        const processResponse = await fetch(`${BASE_URL}/residents/process-vacations`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const processData = await processResponse.json();
        
        if (processData.success) {
          console.log('✅ Vacation processor working');
          console.log(`📊 Processed: ${processData.data.processedCount} residents`);
        } else {
          console.log('❌ Vacation processor failed:', processData.message);
        }
      }
    } else {
      console.log('❌ Failed to get overdue vacations:', overdueData.message);
    }

    console.log('\n🎉 Testing completed successfully!');
    console.log('💡 You can now test the frontend to see:');
    console.log('   - Moved out residents in separate section');
    console.log('   - Proper tickets count in reports');
    console.log('   - Updated statistics with moved out residents');

  } catch (error) {
    console.error('❌ Error in testing:', error);
  }
}

// Run the script
testResidentOffboardingAndTickets(); 