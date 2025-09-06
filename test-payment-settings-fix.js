const mongoose = require('mongoose');
const User = require('./backend/src/models/user.model');
const PG = require('./backend/src/models/pg.model');
const Branch = require('./backend/src/models/branch.model');
const PaymentInfo = require('./backend/src/models/paymentInfo.model');
const OnboardingService = require('./backend/src/services/onboarding.service');

// Test data
const testUserId = '507f1f77bcf86cd799439011'; // Replace with actual user ID
const testPGId = '507f1f77bcf86cd799439012'; // Replace with actual PG ID
const testBranchId = '507f1f77bcf86cd799439013'; // Replace with actual branch ID

async function testPaymentSettingsFix() {
  try {
    console.log('🧪 Testing Payment Settings Fix...\n');

    // Test 1: First payment settings setup
    console.log('📝 Test 1: First payment settings setup');
    const paymentData1 = {
      upiId: 'test@paytm',
      upiName: 'Test User',
      accountHolderName: 'Test User',
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

    const result1 = await OnboardingService.setupPaymentSettings(testUserId, paymentData1);
    console.log('✅ First setup result:', result1.success ? 'SUCCESS' : 'FAILED');
    console.log('📊 Message:', result1.message);
    if (!result1.success) {
      console.log('❌ Error:', result1.error);
    }

    // Test 2: Second payment settings setup (should update, not create new)
    console.log('\n📝 Test 2: Second payment settings setup (update existing)');
    const paymentData2 = {
      upiId: 'updated@paytm',
      upiName: 'Updated User',
      accountHolderName: 'Updated User',
      bankName: 'Updated Bank',
      accountNumber: '0987654321',
      ifscCode: 'UPDT0001234',
      gpayNumber: '8765432109',
      paytmNumber: '8765432109',
      phonepeNumber: '8765432109',
      paymentInstructions: 'Updated payment instructions',
      perDayCost: 600,
      advanceAmount: 1200,
      pgRules: ['No smoking', 'No alcohol', 'No pets']
    };

    const result2 = await OnboardingService.setupPaymentSettings(testUserId, paymentData2);
    console.log('✅ Second setup result:', result2.success ? 'SUCCESS' : 'FAILED');
    console.log('📊 Message:', result2.message);
    if (!result2.success) {
      console.log('❌ Error:', result2.error);
    }

    // Test 3: Verify only one active payment info exists
    console.log('\n📝 Test 3: Verifying only one active payment info exists');
    const activePaymentInfos = await PaymentInfo.find({ 
      branchId: testBranchId, 
      isActive: true 
    });
    console.log('📊 Active payment infos count:', activePaymentInfos.length);
    console.log('📊 Payment info IDs:', activePaymentInfos.map(p => p._id));

    if (activePaymentInfos.length === 1) {
      console.log('✅ SUCCESS: Only one active payment info exists');
      console.log('📊 Latest UPI ID:', activePaymentInfos[0].upiId);
      console.log('📊 Latest UPI Name:', activePaymentInfos[0].upiName);
    } else {
      console.log('❌ FAILED: Multiple active payment infos exist');
    }

    console.log('\n🎉 Payment Settings Fix Test Completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testPaymentSettingsFix();
