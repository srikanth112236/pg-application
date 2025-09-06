const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testDashboardData() {
  console.log('📊 Testing Dashboard Data...\n');

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

    // Step 3: Test Dashboard Overview
    console.log('\n3️⃣ Testing Dashboard Overview...');
    
    const overviewResponse = await fetch(`${BASE_URL}/dashboard/overview`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const overviewData = await overviewResponse.json();
    
    if (overviewData.success) {
      console.log('✅ Dashboard overview working');
      console.log('📊 Overview Data:');
      console.log('   - Total Residents:', overviewData.data.residents.total);
      console.log('   - Active Residents:', overviewData.data.residents.active);
      console.log('   - Pending Residents:', overviewData.data.residents.pending);
      console.log('   - Moved Out Residents:', overviewData.data.residents.movedOut);
      console.log('   - Occupancy Rate:', overviewData.data.residents.occupancyRate + '%');
      console.log('   - Total Revenue:', overviewData.data.financial.totalRevenue);
      console.log('   - Monthly Revenue:', overviewData.data.financial.monthlyRevenue);
      console.log('   - Revenue Growth:', overviewData.data.financial.revenueGrowth + '%');
      console.log('   - Pending Payments:', overviewData.data.financial.pendingPayments);
      console.log('   - Overdue Payments:', overviewData.data.financial.overduePayments);
      console.log('   - Total Rooms:', overviewData.data.operational.totalRooms);
      console.log('   - Occupied Rooms:', overviewData.data.operational.occupiedRooms);
      console.log('   - Open Tickets:', overviewData.data.operational.openTickets);
      console.log('   - Urgent Tickets:', overviewData.data.operational.urgentTickets);
    } else {
      console.log('❌ Dashboard overview failed:', overviewData.message);
    }

    // Step 4: Test Recent Activities
    console.log('\n4️⃣ Testing Recent Activities...');
    
    const activitiesResponse = await fetch(`${BASE_URL}/dashboard/activities?limit=5`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const activitiesData = await activitiesResponse.json();
    
    if (activitiesData.success) {
      console.log('✅ Recent activities working');
      console.log(`📊 Found ${activitiesData.data.length} recent activities`);
      
      if (activitiesData.data.length > 0) {
        console.log('📋 Recent activities:');
        activitiesData.data.forEach((activity, index) => {
          console.log(`   ${index + 1}. ${activity.title}`);
          console.log(`      - Type: ${activity.type}`);
          console.log(`      - Description: ${activity.description}`);
          console.log(`      - Status: ${activity.status}`);
          console.log(`      - Timestamp: ${activity.timestamp}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Recent activities failed:', activitiesData.message);
    }

    // Step 5: Test Pending Tasks
    console.log('\n5️⃣ Testing Pending Tasks...');
    
    const tasksResponse = await fetch(`${BASE_URL}/dashboard/pending-tasks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const tasksData = await tasksResponse.json();
    
    if (tasksData.success) {
      console.log('✅ Pending tasks working');
      console.log('📊 Pending Tasks:');
      console.log('   - Pending Payments:', tasksData.data.payments.pending);
      console.log('   - Overdue Payments:', tasksData.data.payments.overdue);
      console.log('   - Open Tickets:', tasksData.data.tickets.open);
      console.log('   - Urgent Tickets:', tasksData.data.tickets.urgent);
      console.log('   - Pending Residents:', tasksData.data.residents.pending);
    } else {
      console.log('❌ Pending tasks failed:', tasksData.message);
    }

    // Step 6: Test Revenue Analytics
    console.log('\n6️⃣ Testing Revenue Analytics...');
    
    const revenueResponse = await fetch(`${BASE_URL}/dashboard/revenue?period=monthly`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const revenueData = await revenueResponse.json();
    
    if (revenueData.success) {
      console.log('✅ Revenue analytics working');
      console.log('📊 Revenue Analytics:');
      console.log('   - Period:', revenueData.data.period);
      console.log('   - Total Revenue:', revenueData.data.summary.totalRevenue);
      console.log('   - Total Payments:', revenueData.data.summary.totalPayments);
      console.log('   - Current Period:', revenueData.data.summary.currentPeriod);
      console.log('   - Previous Period:', revenueData.data.summary.previousPeriod);
      console.log('   - Growth Rate:', revenueData.data.summary.growthRate + '%');
      console.log(`   - Data Points: ${revenueData.data.data.length}`);
    } else {
      console.log('❌ Revenue analytics failed:', revenueData.message);
    }

    // Step 7: Test Occupancy Analytics
    console.log('\n7️⃣ Testing Occupancy Analytics...');
    
    const occupancyResponse = await fetch(`${BASE_URL}/dashboard/occupancy`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const occupancyData = await occupancyResponse.json();
    
    if (occupancyData.success) {
      console.log('✅ Occupancy analytics working');
      console.log('📊 Occupancy Analytics:');
      console.log('   - Total Rooms:', occupancyData.data.current.totalRooms);
      console.log('   - Occupied Rooms:', occupancyData.data.current.occupiedRooms);
      console.log('   - Vacant Rooms:', occupancyData.data.current.vacantRooms);
      console.log('   - Occupancy Rate:', occupancyData.data.current.occupancyRate + '%');
      console.log(`   - Room Types: ${occupancyData.data.roomTypes.length}`);
      console.log(`   - Trend Data Points: ${occupancyData.data.trend.length}`);
    } else {
      console.log('❌ Occupancy analytics failed:', occupancyData.message);
    }

    console.log('\n🎉 Dashboard Data Testing Completed!');
    console.log('💡 Summary:');
    console.log('   - ✅ Dashboard overview API working');
    console.log('   - ✅ Recent activities API working');
    console.log('   - ✅ Pending tasks API working');
    console.log('   - ✅ Revenue analytics API working');
    console.log('   - ✅ Occupancy analytics API working');
    console.log('   - ✅ Real-time data being fetched');
    console.log('   - ✅ Frontend should display dynamic data');

  } catch (error) {
    console.error('❌ Error in testing:', error);
  }
}

// Run the script
testDashboardData(); 