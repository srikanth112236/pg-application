const axios = require('axios');
require('dotenv').config();

async function testSimplifiedOnboarding() {
  try {
    console.log('🧪 Testing Simplified Onboarding Flow...');

    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const { accessToken } = loginResponse.data.data.tokens;
    console.log('✅ Login successful, got access token');

    // Check onboarding status before any steps
    const statusBeforeResponse = await axios.get('http://localhost:5000/api/onboarding/status', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Initial onboarding status:', {
      isCompleted: statusBeforeResponse.data.data?.isCompleted,
      currentStep: statusBeforeResponse.data.data?.currentStep,
      stepsCount: statusBeforeResponse.data.data?.steps?.length
    });

    // Test profile completion
    const profileResponse = await axios.post('http://localhost:5000/api/onboarding/update-profile', {
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      address: '123 Main Street, City, State 12345'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('👤 Profile completion:', {
      success: profileResponse.data.success,
      message: profileResponse.data.message
    });

    // Test PG configuration
    const pgResponse = await axios.post('http://localhost:5000/api/onboarding/configure-pg', {
      name: 'Test PG',
      description: 'A test PG for onboarding',
      address: '456 PG Street, City, State 12345',
      phone: '9876543210',
      email: 'pg@example.com'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🏠 PG configuration:', {
      success: pgResponse.data.success,
      message: pgResponse.data.message
    });

    // Test security setup (final step)
    const securityResponse = await axios.post('http://localhost:5000/api/onboarding/security-setup', {
      newPassword: 'NewSecurePassword123!'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔐 Security setup:', {
      success: securityResponse.data.success,
      message: securityResponse.data.message,
      isCompleted: securityResponse.data.data?.isCompleted,
      currentStep: securityResponse.data.data?.currentStep
    });

    if (securityResponse.data.success) {
      console.log('✅ Simplified onboarding completed successfully!');
      
      // Check final onboarding status
      const statusAfterResponse = await axios.get('http://localhost:5000/api/onboarding/status', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Final onboarding status:', {
        isCompleted: statusAfterResponse.data.data?.isCompleted,
        currentStep: statusAfterResponse.data.data?.currentStep,
        stepsCount: statusAfterResponse.data.data?.steps?.length
      });

      if (statusAfterResponse.data.data?.isCompleted) {
        console.log('✅ Onboarding marked as complete!');
        console.log('🎉 User can now access the dashboard directly!');
      } else {
        console.log('❌ Onboarding not marked as complete');
      }
    } else {
      console.log('❌ Security setup failed:', securityResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testSimplifiedOnboarding(); 