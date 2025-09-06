const mongoose = require('mongoose');
const OnboardingService = require('./src/services/onboarding.service');
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');

// Test PG configuration
async function testPGConfiguration() {
  try {
    console.log('🧪 Testing PG Configuration...');
    
    // Create a test user
    const testUser = new User({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'testadmin@example.com',
      password: 'Test@123',
      phone: '1234567890',
      role: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    
    await testUser.save();
    console.log('✅ Test user created:', testUser._id);
    
    // Test PG configuration data
    const pgData = {
      name: 'Test PG',
      description: 'A test PG for onboarding',
      address: '123 Test Street, Test City, Test State - 123456',
      phone: '9876543210',
      email: 'testpg@example.com',
      branches: [
        {
          name: 'Main Branch',
          location: 'Test Location',
          floors: 2,
          roomsPerFloor: 5
        }
      ],
      sharingTypes: [
        {
          type: '1-sharing',
          name: 'Single Occupancy',
          description: 'One person per room',
          cost: 8000
        },
        {
          type: '2-sharing',
          name: 'Double Sharing',
          description: 'Two persons per room',
          cost: 6000
        }
      ]
    };
    
    console.log('📊 Testing PG configuration with data:', pgData);
    
    // Test the configurePG method
    const result = await OnboardingService.configurePG(testUser._id, pgData);
    
    console.log('📤 Configuration result:', {
      success: result.success,
      statusCode: result.statusCode,
      message: result.message,
      error: result.error
    });
    
    if (result.success) {
      console.log('✅ PG configuration successful!');
      
      // Check if PG was created with admin field
      const pg = await PG.findById(result.data.pg._id);
      console.log('🏠 PG created:', {
        id: pg._id,
        name: pg.name,
        admin: pg.admin,
        createdBy: pg.createdBy,
        hasAdmin: !!pg.admin
      });
      
      if (pg.admin) {
        console.log('✅ Admin field is properly set!');
      } else {
        console.log('❌ Admin field is missing!');
      }
    } else {
      console.log('❌ PG configuration failed:', result.error);
    }
    
    // Clean up
    await User.findByIdAndDelete(testUser._id);
    if (result.success && result.data.pg) {
      await PG.findByIdAndDelete(result.data.pg._id);
    }
    console.log('🧹 Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPGConfiguration(); 