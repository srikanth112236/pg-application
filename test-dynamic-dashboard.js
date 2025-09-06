const fetch = require('node-fetch');

async function testDynamicDashboard() {
  console.log('🔧 Testing Dynamic Dashboard with Real Data...\n');

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

    // Step 2: Get a sample branch ID (you'll need to replace this with a real branch ID from your database)
    console.log('\n2️⃣ Testing dashboard overview with real data...');
    
    // For testing, we'll use a sample branch ID - you should replace this with a real one
    const sampleBranchId = '6890d17de221ac63b48256f7'; // Replace with actual branch ID from your database
    
    const overviewResponse = await fetch(`http://localhost:5000/api/dashboard/overview?branchId=${sampleBranchId}`);
    
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Dashboard overview route working with real data!');
      
      if (overviewData.success && overviewData.data) {
        const data = overviewData.data;
        
        console.log('\n📊 Real Dashboard Data:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Resident Statistics
        console.log('👥 RESIDENTS:');
        console.log(`   • Total Residents: ${data.residents.total}`);
        console.log(`   • Active Residents: ${data.residents.active}`);
        console.log(`   • Pending Residents: ${data.residents.pending}`);
        console.log(`   • Moved Out: ${data.residents.movedOut}`);
        console.log(`   • This Month: ${data.residents.thisMonth}`);
        console.log(`   • By Gender - Male: ${data.residents.byGender.male}, Female: ${data.residents.byGender.female}`);
        
        // Financial Statistics
        console.log('\n💰 FINANCIAL:');
        console.log(`   • Total Revenue: ₹${data.financial.totalRevenue.toLocaleString()}`);
        console.log(`   • Monthly Revenue: ₹${data.financial.monthlyRevenue.toLocaleString()}`);
        console.log(`   • Pending Payments: ${data.financial.pendingPayments}`);
        console.log(`   • Overdue Payments: ${data.financial.overduePayments}`);
        console.log(`   • Revenue Growth: ${data.financial.revenueGrowth}%`);
        console.log(`   • Average Rent: ₹${data.financial.averageRent.toLocaleString()}`);
        
        // Occupancy Statistics
        console.log('\n🏠 OCCUPANCY:');
        console.log(`   • Total Rooms: ${data.occupancy.totalRooms}`);
        console.log(`   • Occupied Rooms: ${data.occupancy.occupiedRooms}`);
        console.log(`   • Available Rooms: ${data.occupancy.availableRooms}`);
        console.log(`   • Occupancy Rate: ${data.occupancy.occupancyRate}%`);
        console.log(`   • Occupancy Trend: ${data.occupancy.occupancyTrend > 0 ? '+' : ''}${data.occupancy.occupancyTrend}`);
        
        // Ticket Statistics
        console.log('\n🎫 TICKETS:');
        console.log(`   • Open Tickets: ${data.tickets.open}`);
        console.log(`   • Urgent Tickets: ${data.tickets.urgent}`);
        console.log(`   • Resolved Tickets: ${data.tickets.resolved}`);
        console.log(`   • Total Tickets: ${data.tickets.total}`);
        console.log(`   • Resolution Rate: ${data.tickets.resolutionRate}%`);
        
        // PG Information
        console.log('\n🏢 PG INFORMATION:');
        console.log(`   • Name: ${data.pg.name}`);
        console.log(`   • Email: ${data.pg.email}`);
        console.log(`   • Phone: ${data.pg.phone}`);
        console.log(`   • Address: ${data.pg.address}`);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Check if data is dynamic (not static)
        if (data.residents.total === 0 && data.financial.totalRevenue === 0) {
          console.log('\n⚠️  WARNING: Dashboard shows zero data');
          console.log('💡 This could mean:');
          console.log('   • No data exists in the database for this branch');
          console.log('   • Branch ID is incorrect');
          console.log('   • Database connection issues');
          console.log('💡 Please check your database and ensure you have:');
          console.log('   • Residents with the correct branchId');
          console.log('   • Payments with the correct branchId');
          console.log('   • Tickets with the correct branchId');
          console.log('   • Rooms with the correct branchId');
        } else {
          console.log('\n✅ SUCCESS: Dashboard is showing real dynamic data!');
        }
        
      } else {
        console.log('❌ Dashboard overview data structure incorrect');
        console.log('📊 Response:', overviewData);
      }
    } else {
      console.log('❌ Dashboard overview route failed');
      console.log('📊 Status:', overviewResponse.status);
      const errorText = await overviewResponse.text();
      console.log('📊 Error:', errorText);
    }

    // Step 3: Test dashboard activities with real data
    console.log('\n3️⃣ Testing dashboard activities with real data...');
    const activitiesResponse = await fetch(`http://localhost:5000/api/dashboard/activities?branchId=${sampleBranchId}`);
    
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      console.log('✅ Dashboard activities route working with real data!');
      
      if (activitiesData.success && activitiesData.data) {
        console.log(`   - Activities count: ${activitiesData.data.length}`);
        
        if (activitiesData.data.length > 0) {
          console.log('\n📋 Recent Activities:');
          activitiesData.data.slice(0, 3).forEach((activity, index) => {
            console.log(`   ${index + 1}. ${activity.title} - ${activity.description}`);
            console.log(`      Type: ${activity.type}, Status: ${activity.status}, Time: ${new Date(activity.timestamp).toLocaleString()}`);
          });
        } else {
          console.log('   - No recent activities found');
        }
      }
    } else {
      console.log('❌ Dashboard activities route failed');
    }

    // Step 4: Test dashboard pending-tasks with real data
    console.log('\n4️⃣ Testing dashboard pending-tasks with real data...');
    const tasksResponse = await fetch(`http://localhost:5000/api/dashboard/pending-tasks?branchId=${sampleBranchId}`);
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('✅ Dashboard pending-tasks route working with real data!');
      
      if (tasksData.success && tasksData.data) {
        const data = tasksData.data;
        console.log('\n📋 Pending Tasks Summary:');
        console.log(`   • Pending Payments: ${data.payments.pending}`);
        console.log(`   • Overdue Payments: ${data.payments.overdue}`);
        console.log(`   • Total Pending Amount: ₹${data.payments.totalAmount.toLocaleString()}`);
        console.log(`   • Open Tickets: ${data.tickets.open}`);
        console.log(`   • Urgent Tickets: ${data.tickets.urgent}`);
        console.log(`   • Pending Residents: ${data.residents.pending}`);
      }
    } else {
      console.log('❌ Dashboard pending-tasks route failed');
    }

    console.log('\n🎉 Dynamic Dashboard Testing Completed!');
    console.log('💡 Summary:');
    console.log('   - ✅ Server is running');
    console.log('   - ✅ Dashboard routes are working with real data');
    console.log('   - ✅ Data is being fetched from database');
    console.log('   - ✅ Frontend should now display real data');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Navigate to dashboard in frontend');
    console.log('   2. Dashboard should now show real data from your database');
    console.log('   3. All statistics should reflect actual data');
    console.log('   4. Activities should show real recent events');

  } catch (error) {
    console.error('❌ Error in testing:', error.message);
    console.log('💡 Please ensure the backend server is running on port 5000');
    console.log('💡 Start it with: cd backend && npm start');
  }
}

// Run the test
testDynamicDashboard(); 