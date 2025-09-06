const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = 'admin@pg.com';
const TEST_PASSWORD = 'admin123';

let accessToken = '';
let testResidentId = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (response.data.success) {
      accessToken = response.data.data.tokens.accessToken;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.response?.data || error.message);
    return false;
  }
}

async function getResidents() {
  try {
    console.log('👥 Fetching residents...');
    const response = await axios.get(`${BASE_URL}/api/residents`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success && response.data.data.residents.length > 0) {
      // Find a resident with room assignment
      const allocatedResident = response.data.data.residents.find(
        resident => resident.roomId && resident.bedNumber
      );
      
      if (allocatedResident) {
        testResidentId = allocatedResident._id;
        console.log('✅ Found allocated resident:', allocatedResident.firstName, allocatedResident.lastName);
        console.log('📍 Room:', allocatedResident.roomNumber, 'Bed:', allocatedResident.bedNumber);
        return true;
      } else {
        console.log('❌ No allocated residents found');
        return false;
      }
    } else {
      console.log('❌ No residents found');
      return false;
    }
  } catch (error) {
    console.log('❌ Residents fetch error:', error.response?.data || error.message);
    return false;
  }
}

async function testResidentDetailsAPI() {
  try {
    console.log('\n🔍 Testing Enhanced Resident Details API...');
    
    const response = await axios.get(`${BASE_URL}/api/residents/${testResidentId}/details`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const details = response.data.data;
      console.log('✅ Resident details fetched successfully');
      console.log('👤 Resident:', details.firstName, details.lastName);
      console.log('🏠 Room:', details.roomNumber, 'Bed:', details.bedNumber);
      
      // Test payment summary
      if (details.paymentSummary) {
        console.log('\n💰 Payment Summary Found:');
        console.log('📅 Current Month:', details.paymentSummary.currentMonth.month, details.paymentSummary.currentMonth.year);
        console.log('💳 Payment Status:', details.paymentSummary.currentMonth.status);
        console.log('💵 Amount:', `₹${details.paymentSummary.currentMonth.amount}`);
        console.log('🏦 Advance Payment:', `₹${details.paymentSummary.advancePayment.amount}`, details.paymentSummary.advancePayment.status);
        console.log('🔒 Security Deposit:', `₹${details.paymentSummary.securityDeposit.amount}`, details.paymentSummary.securityDeposit.status);
        console.log('📊 Total Paid:', `₹${details.paymentSummary.totalPaid}`);
        console.log('📈 Total Months:', details.paymentSummary.totalMonths);
        console.log('⚠️ Pending Amount:', `₹${details.paymentSummary.pendingAmount}`);
        
        if (details.paymentSummary.recentPayments.length > 0) {
          console.log('\n📋 Recent Payments:');
          details.paymentSummary.recentPayments.forEach((payment, index) => {
            console.log(`  ${index + 1}. ${payment.month} ${payment.year} - ₹${payment.amount} (${payment.paymentMethod})`);
          });
        }
        
        console.log('\n✅ Payment summary structure is correct');
        return true;
      } else {
        console.log('⚠️ Payment summary not found in response');
        return false;
      }
    } else {
      console.log('❌ Failed to fetch resident details:', response.data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Resident details API error:', error.response?.data || error.message);
    return false;
  }
}

async function testPaymentStructure() {
  try {
    console.log('\n🧪 Testing Payment Data Structure...');
    
    const response = await axios.get(`${BASE_URL}/api/residents/${testResidentId}/details`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      const paymentSummary = response.data.data.paymentSummary;
      
      if (!paymentSummary) {
        console.log('❌ Payment summary missing');
        return false;
      }
      
      // Check required fields
      const requiredFields = [
        'currentMonth',
        'recentPayments',
        'totalPaid',
        'totalMonths',
        'averageAmount',
        'expectedMonthlyRent',
        'pendingAmount',
        'advancePayment',
        'securityDeposit'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in paymentSummary));
      
      if (missingFields.length > 0) {
        console.log('❌ Missing required fields:', missingFields.join(', '));
        return false;
      }
      
      // Check currentMonth structure
      const currentMonthFields = ['month', 'year', 'isPaid', 'amount', 'status'];
      const missingCurrentMonthFields = currentMonthFields.filter(field => !(field in paymentSummary.currentMonth));
      
      if (missingCurrentMonthFields.length > 0) {
        console.log('❌ Missing currentMonth fields:', missingCurrentMonthFields.join(', '));
        return false;
      }
      
      // Check advance payment structure
      const advanceFields = ['amount', 'status'];
      const missingAdvanceFields = advanceFields.filter(field => !(field in paymentSummary.advancePayment));
      
      if (missingAdvanceFields.length > 0) {
        console.log('❌ Missing advancePayment fields:', missingAdvanceFields.join(', '));
        return false;
      }
      
      // Check security deposit structure
      const depositFields = ['amount', 'refundable', 'status'];
      const missingDepositFields = depositFields.filter(field => !(field in paymentSummary.securityDeposit));
      
      if (missingDepositFields.length > 0) {
        console.log('❌ Missing securityDeposit fields:', missingDepositFields.join(', '));
        return false;
      }
      
      console.log('✅ All payment structure fields are present');
      console.log('✅ Payment data structure validation passed');
      return true;
    }
  } catch (error) {
    console.log('❌ Payment structure test error:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting Resident Offboarding Payment Integration Tests...');
  console.log('=' .repeat(70));
  
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Tests failed: Could not login');
    return;
  }
  
  // Get residents
  const residentsSuccess = await getResidents();
  if (!residentsSuccess) {
    console.log('❌ Tests failed: Could not find allocated residents');
    return;
  }
  
  // Test resident details API
  const detailsSuccess = await testResidentDetailsAPI();
  if (!detailsSuccess) {
    console.log('❌ Tests failed: Resident details API issues');
    return;
  }
  
  // Test payment data structure
  const structureSuccess = await testPaymentStructure();
  if (!structureSuccess) {
    console.log('❌ Tests failed: Payment data structure issues');
    return;
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('🎉 All Resident Offboarding Payment Integration Tests Passed!');
  console.log('✅ Backend API enhancement completed successfully');
  console.log('✅ Payment summary structure is correct');
  console.log('✅ Frontend will receive all required payment data');
  console.log('\n📝 Next Steps:');
  console.log('   1. Test the frontend ResidentOffboarding component');
  console.log('   2. Verify payment display in step 2');
  console.log('   3. Check payment summary in review step 3');
  console.log('   4. Ensure vacation flow works with payment info');
}

// Run tests
runTests().catch(console.error); 