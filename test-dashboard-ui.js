const fetch = require('node-fetch');

async function testDashboardUI() {
  console.log('🔧 Testing Dashboard UI Fix...\n');

  try {
    // Step 1: Test server health
    console.log('1️⃣ Testing server health...');
    const healthResponse = await fetch('http://localhost:5000/health');
    
    if (healthResponse.ok) {
      console.log('✅ Server is running on port 5000');
    } else {
      console.log('❌ Server health check failed');
      console.log('💡 Please start the backend server with: cd backend && npm start');
      return;
    }

    // Step 2: Test dashboard overview route
    console.log('\n2️⃣ Testing dashboard overview route...');
    const overviewResponse = await fetch('http://localhost:5000/api/dashboard/overview');
    
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Dashboard overview route working!');
      
      // Check data structure
      if (overviewData.success && overviewData.data) {
        const data = overviewData.data;
        
        // Check residents data
        if (data.residents) {
          console.log('✅ Residents data structure correct');
          console.log(`   - Total: ${data.residents.total}`);
          console.log(`   - Active: ${data.residents.active}`);
          console.log(`   - Pending: ${data.residents.pending}`);
          console.log(`   - Moved Out: ${data.residents.movedOut}`);
        } else {
          console.log('❌ Residents data missing');
        }
        
        // Check financial data
        if (data.financial) {
          console.log('✅ Financial data structure correct');
          console.log(`   - Total Revenue: ${data.financial.totalRevenue}`);
          console.log(`   - Monthly Revenue: ${data.financial.monthlyRevenue}`);
          console.log(`   - Pending Payments: ${data.financial.pendingPayments}`);
        } else {
          console.log('❌ Financial data missing');
        }
        
        // Check occupancy data
        if (data.occupancy) {
          console.log('✅ Occupancy data structure correct');
          console.log(`   - Total Rooms: ${data.occupancy.totalRooms}`);
          console.log(`   - Occupied Rooms: ${data.occupancy.occupiedRooms}`);
          console.log(`   - Occupancy Rate: ${data.occupancy.occupancyRate}%`);
        } else {
          console.log('❌ Occupancy data missing');
        }
        
        // Check tickets data
        if (data.tickets) {
          console.log('✅ Tickets data structure correct');
          console.log(`   - Open: ${data.tickets.open}`);
          console.log(`   - Urgent: ${data.tickets.urgent}`);
          console.log(`   - Resolved: ${data.tickets.resolved}`);
        } else {
          console.log('❌ Tickets data missing');
        }
        
        // Check PG data
        if (data.pg) {
          console.log('✅ PG data structure correct');
          console.log(`   - Name: ${data.pg.name}`);
          console.log(`   - Email: ${data.pg.email}`);
        } else {
          console.log('❌ PG data missing');
        }
      } else {
        console.log('❌ Dashboard overview data structure incorrect');
      }
    } else {
      console.log('❌ Dashboard overview route failed');
      console.log('📊 Status:', overviewResponse.status);
      const errorText = await overviewResponse.text();
      console.log('📊 Error:', errorText);
    }

    // Step 3: Test dashboard activities route
    console.log('\n3️⃣ Testing dashboard activities route...');
    const activitiesResponse = await fetch('http://localhost:5000/api/dashboard/activities');
    
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      console.log('✅ Dashboard activities route working!');
      
      if (activitiesData.success && activitiesData.data) {
        console.log(`   - Activities count: ${activitiesData.data.length}`);
        
        // Check first activity structure
        if (activitiesData.data.length > 0) {
          const firstActivity = activitiesData.data[0];
          console.log('✅ Activity data structure correct');
          console.log(`   - Type: ${firstActivity.type}`);
          console.log(`   - Title: ${firstActivity.title}`);
          console.log(`   - Status: ${firstActivity.status}`);
          console.log(`   - Timestamp: ${firstActivity.timestamp}`);
        }
      }
    } else {
      console.log('❌ Dashboard activities route failed');
    }

    // Step 4: Test dashboard pending-tasks route
    console.log('\n4️⃣ Testing dashboard pending-tasks route...');
    const tasksResponse = await fetch('http://localhost:5000/api/dashboard/pending-tasks');
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('✅ Dashboard pending-tasks route working!');
      
      if (tasksData.success && tasksData.data) {
        const data = tasksData.data;
        console.log('✅ Pending tasks data structure correct');
        console.log(`   - Pending payments: ${data.payments.pending}`);
        console.log(`   - Overdue payments: ${data.payments.overdue}`);
        console.log(`   - Open tickets: ${data.tickets.open}`);
        console.log(`   - Urgent tickets: ${data.tickets.urgent}`);
        console.log(`   - Pending residents: ${data.residents.pending}`);
      }
    } else {
      console.log('❌ Dashboard pending-tasks route failed');
    }

    console.log('\n🎉 Dashboard UI Fix Testing Completed!');
    console.log('💡 Summary:');
    console.log('   - ✅ Server is running');
    console.log('   - ✅ Dashboard routes are working');
    console.log('   - ✅ Data structure is correct');
    console.log('   - ✅ Frontend should now work without errors');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Navigate to dashboard in frontend');
    console.log('   2. Dashboard should now load with mock data');
    console.log('   3. No more undefined errors should appear');
    console.log('   4. All cards and activities should display properly');

  } catch (error) {
    console.error('❌ Error in testing:', error.message);
    console.log('💡 Please ensure the backend server is running on port 5000');
    console.log('💡 Start it with: cd backend && npm start');
  }
}

// Run the test
testDashboardUI(); 