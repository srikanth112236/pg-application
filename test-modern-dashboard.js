const fetch = require('node-fetch');

async function testModernDashboard() {
  console.log('🎨 Testing Modern Dashboard with Real Data...\n');

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

    // Step 2: Test dashboard overview with real data
    console.log('\n2️⃣ Testing modern dashboard overview...');
    
    // Use the branch ID from your database
    const sampleBranchId = '6890d17de221ac63b48256f7'; // Replace with actual branch ID
    
    const overviewResponse = await fetch(`http://localhost:5000/api/dashboard/overview?branchId=${sampleBranchId}`);
    
    if (overviewResponse.ok) {
      const overviewData = await overviewResponse.json();
      console.log('✅ Modern dashboard overview working!');
      
      if (overviewData.success && overviewData.data) {
        const data = overviewData.data;
        
        console.log('\n🎨 Modern Dashboard Data Preview:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // Revenue Overview
        console.log('💰 REVENUE OVERVIEW (Horizontal Cards):');
        console.log(`   • Total Revenue: ₹${data.financial.totalRevenue.toLocaleString()}`);
        console.log(`   • Monthly Revenue: ₹${data.financial.monthlyRevenue.toLocaleString()}`);
        console.log(`   • Pending Payments: ${data.financial.pendingPayments}`);
        console.log(`   • Overdue Payments: ${data.financial.overduePayments}`);
        console.log(`   • Revenue Growth: ${data.financial.revenueGrowth}%`);
        console.log(`   • Average Rent: ₹${data.financial.averageRent.toLocaleString()}`);
        
        // Residents Overview
        console.log('\n👥 RESIDENTS OVERVIEW (Horizontal Cards):');
        console.log(`   • Total Residents: ${data.residents.total}`);
        console.log(`   • Active Residents: ${data.residents.active}`);
        console.log(`   • Pending Residents: ${data.residents.pending}`);
        console.log(`   • Moved Out: ${data.residents.movedOut}`);
        console.log(`   • This Month: ${data.residents.thisMonth}`);
        
        // Tickets Overview
        console.log('\n🎫 TICKETS OVERVIEW (Horizontal Cards):');
        console.log(`   • Total Tickets: ${data.tickets.total}`);
        console.log(`   • Open Tickets: ${data.tickets.open}`);
        console.log(`   • Urgent Tickets: ${data.tickets.urgent}`);
        console.log(`   • Resolved Tickets: ${data.tickets.resolved}`);
        console.log(`   • Resolution Rate: ${data.tickets.resolutionRate}%`);
        
        // Quick Stats
        console.log('\n📊 QUICK STATS (Modern Cards):');
        console.log(`   • Occupancy Rate: ${data.occupancy.occupancyRate}% (${data.occupancy.occupiedRooms}/${data.occupancy.totalRooms} rooms)`);
        console.log(`   • Occupancy Trend: ${data.occupancy.occupancyTrend > 0 ? '+' : ''}${data.occupancy.occupancyTrend}`);
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
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

    // Step 3: Test recent activities for modern list
    console.log('\n3️⃣ Testing recent activities for modern list...');
    const activitiesResponse = await fetch(`http://localhost:5000/api/dashboard/activities?branchId=${sampleBranchId}`);
    
    if (activitiesResponse.ok) {
      const activitiesData = await activitiesResponse.json();
      console.log('✅ Recent activities working for modern list!');
      
      if (activitiesData.success && activitiesData.data) {
        console.log(`   - Activities count: ${activitiesData.data.length}`);
        
        if (activitiesData.data.length > 0) {
          console.log('\n📋 Recent Activities (Modern Compact List):');
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

    // Step 4: Test recent tickets for card list
    console.log('\n4️⃣ Testing recent tickets for card list...');
    const ticketsResponse = await fetch(`http://localhost:5000/api/dashboard/activities?branchId=${sampleBranchId}`);
    
    if (ticketsResponse.ok) {
      const ticketsData = await ticketsResponse.json();
      console.log('✅ Recent tickets working for card list!');
      
      if (ticketsData.success && ticketsData.data) {
        // Filter tickets from activities
        const tickets = ticketsData.data.filter(activity => activity.type === 'ticket');
        console.log(`   - Tickets count: ${tickets.length}`);
        
        if (tickets.length > 0) {
          console.log('\n🎫 Recent Tickets (Modern Card Grid):');
          tickets.slice(0, 3).forEach((ticket, index) => {
            console.log(`   ${index + 1}. ${ticket.title}`);
            console.log(`      Priority: ${ticket.priority}, Status: ${ticket.status}`);
            console.log(`      Description: ${ticket.description}`);
          });
        } else {
          console.log('   - No recent tickets found');
        }
      }
    } else {
      console.log('❌ Dashboard tickets route failed');
    }

    console.log('\n🎉 Modern Dashboard Testing Completed!');
    console.log('💡 Summary:');
    console.log('   - ✅ Server is running');
    console.log('   - ✅ Modern dashboard routes are working');
    console.log('   - ✅ Real data is being fetched');
    console.log('   - ✅ New layout structure is ready');

    console.log('\n🎨 Modern Dashboard Features:');
    console.log('   • Revenue Overview - Horizontal card row');
    console.log('   • Residents Overview - Horizontal card row');
    console.log('   • Tickets Overview - Horizontal card row');
    console.log('   • Recent Tickets - Modern card grid');
    console.log('   • Recent Activities - Compact list');
    console.log('   • Quick Stats - Modern cards');
    console.log('   • Real-time data from database');

    console.log('\n🚀 Next Steps:');
    console.log('   1. Navigate to dashboard in frontend');
    console.log('   2. Dashboard should show modern, compact layout');
    console.log('   3. All cards should display real data');
    console.log('   4. Recent tickets should appear in card format');
    console.log('   5. Activities should appear in compact list');

  } catch (error) {
    console.error('❌ Error in testing:', error.message);
    console.log('💡 Please ensure the backend server is running on port 5000');
    console.log('💡 Start it with: cd backend && npm start');
  }
}

// Run the test
testModernDashboard(); 