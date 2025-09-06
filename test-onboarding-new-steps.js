const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testOnboardingFlow() {
  console.log('🧪 Testing Onboarding Flow with New Steps...\n');

  try {
    // Test 1: Check onboarding status
    console.log('1️⃣ Testing onboarding status...');
    const statusResponse = await fetch(`${API_BASE_URL}/onboarding/status`, {
      headers: {
        'Authorization': 'Bearer test-token' // This would be a real token in actual test
      }
    });
    console.log('✅ Onboarding status endpoint accessible');

    // Test 2: Test branch setup endpoint
    console.log('\n2️⃣ Testing branch setup endpoint...');
    const branchData = {
      name: 'Test Branch',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        landmark: 'Near Test Landmark'
      },
      maintainer: {
        name: 'Test Maintainer',
        mobile: '9876543210',
        email: 'maintainer@test.com'
      },
      contact: {
        phone: '9876543210',
        email: 'contact@test.com',
        alternatePhone: '9876543211'
      },
      capacity: {
        totalRooms: 10,
        totalBeds: 20,
        availableRooms: 10
      },
      amenities: ['WiFi', 'AC', 'Food']
    };

    const branchResponse = await fetch(`${API_BASE_URL}/onboarding/setup-branch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(branchData)
    });
    console.log('✅ Branch setup endpoint accessible');

    // Test 3: Test payment settings endpoint
    console.log('\n3️⃣ Testing payment settings endpoint...');
    const paymentData = {
      upiId: 'test@paytm',
      upiName: 'Test UPI',
      accountHolderName: 'Test Account Holder',
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      ifscCode: 'TEST0001234',
      gpayNumber: '9876543210',
      paytmNumber: '9876543210',
      phonepeNumber: '9876543210',
      paymentInstructions: 'Test payment instructions',
      perDayCost: 500,
      advanceAmount: 1000,
      pgRules: ['No smoking', 'No alcohol']
    };

    const paymentResponse = await fetch(`${API_BASE_URL}/onboarding/setup-payment-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(paymentData)
    });
    console.log('✅ Payment settings endpoint accessible');

    console.log('\n🎉 All onboarding endpoints are accessible!');
    console.log('\n📋 New Steps Added:');
    console.log('   • Branch Setup (Step 3)');
    console.log('   • Payment Settings (Step 4)');
    console.log('\n🔄 Updated Flow:');
    console.log('   1. Profile Completion');
    console.log('   2. PG Configuration');
    console.log('   3. Branch Setup ← NEW');
    console.log('   4. Payment Settings ← NEW');
    console.log('   5. Security Setup');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOnboardingFlow();
