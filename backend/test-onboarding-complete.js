const axios = require('axios');
require('dotenv').config();

async function testOnboardingComplete() {
  try {
    console.log('🧪 Testing Onboarding Complete Flow...');

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

    // Check onboarding status before security setup
    const statusBeforeResponse = await axios.get('http://localhost:5000/api/onboarding/status', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Onboarding status before:', {
      isCompleted: statusBeforeResponse.data.data?.isCompleted,
      currentStep: statusBeforeResponse.data.data?.currentStep
    });

    // Test security setup (which should complete onboarding)
    const securityResponse = await axios.post('http://localhost:5000/api/onboarding/security-setup', {
      newPassword: 'NewSecurePassword123!'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔐 Security setup response:', {
      success: securityResponse.data.success,
      message: securityResponse.data.message,
      isCompleted: securityResponse.data.data?.isCompleted,
      currentStep: securityResponse.data.data?.currentStep
    });

    if (securityResponse.data.success) {
      console.log('✅ Security setup completed successfully!');
      
      // Check onboarding status after security setup
      const statusAfterResponse = await axios.get('http://localhost:5000/api/onboarding/status', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📊 Onboarding status after:', {
        isCompleted: statusAfterResponse.data.data?.isCompleted,
        currentStep: statusAfterResponse.data.data?.currentStep
      });

      if (statusAfterResponse.data.data?.isCompleted) {
        console.log('✅ Onboarding marked as complete!');
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

testOnboardingComplete(); 