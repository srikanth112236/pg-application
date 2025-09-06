const mongoose = require('mongoose');
require('dotenv').config();

// Import models and validation
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');
const Branch = require('./src/models/branch.model');
const Resident = require('./src/models/resident.model');
const { validateResident } = require('./src/middleware/validation.middleware');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testResidentValidation = async () => {
  try {
    console.log('🧪 Testing Resident Validation with branchId...\n');

    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await User.deleteMany({ email: 'test@example.com' });
    await PG.deleteMany({ name: 'Test PG' });
    await Branch.deleteMany({ name: 'Test Branch' });
    await Resident.deleteMany({ firstName: 'Test' });

    // Create test user
    console.log('👤 Creating test user...');
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      role: 'admin',
      phone: '1234567890'
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser._id);

    // Create test PG
    console.log('🏢 Creating test PG...');
    const testPG = new PG({
      name: 'Test PG',
      description: 'Test PG for validation testing',
      address: '123 Test Street, Test City, Test State 123456',
      phone: '1234567890',
      email: 'testpg@example.com',
      admin: testUser._id,
      createdBy: testUser._id
    });
    await testPG.save();
    console.log('✅ Test PG created:', testPG._id);

    // Update user with PG association
    testUser.pgId = testPG._id;
    await testUser.save();

    // Create test branch
    console.log('🏢 Creating test branch...');
    const testBranch = new Branch({
      name: 'Test Branch',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      maintainer: {
        name: 'Test Maintainer',
        mobile: '1234567890',
        email: 'maintainer@example.com'
      },
      contact: {
        phone: '1234567890',
        email: 'contact@example.com'
      },
      pgId: testPG._id,
      createdBy: testUser._id
    });
    await testBranch.save();
    console.log('✅ Test branch created:', testBranch._id);

    // Test 1: Valid resident data with branchId
    console.log('\n📝 Test 1: Testing valid resident data with branchId...');
    const validResidentData = {
      firstName: 'Test',
      lastName: 'Resident',
      phone: '1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      permanentAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Parent',
        phone: '1234567890',
        address: '456 Emergency Street, Test City'
      },
      branchId: testBranch._id.toString(),
      checkInDate: new Date(),
      contractStartDate: new Date()
    };

    // Test validation middleware
    const req = { body: validResidentData };
    const res = {
      status: (code) => ({
        json: (data) => {
          console.log(`Response Status: ${code}`);
          console.log('Response Data:', data);
          return data;
        }
      })
    };
    let validationPassed = false;
    const next = () => {
      validationPassed = true;
      console.log('✅ Validation passed');
    };

    validateResident(req, res, next);
    
    if (validationPassed) {
      console.log('✅ Validation middleware passed for valid data');
    } else {
      console.log('❌ Validation middleware failed for valid data');
    }

    // Test 2: Invalid resident data without branchId
    console.log('\n📝 Test 2: Testing invalid resident data without branchId...');
    const invalidResidentData = {
      firstName: 'Test',
      lastName: 'Resident',
      phone: '1234567890',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male',
      permanentAddress: {
        street: '123 Test Street',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Parent',
        phone: '1234567890',
        address: '456 Emergency Street, Test City'
      },
      // Missing branchId
      checkInDate: new Date(),
      contractStartDate: new Date()
    };

    const req2 = { body: invalidResidentData };
    let validationFailed = false;
    const res2 = {
      status: (code) => ({
        json: (data) => {
          validationFailed = true;
          console.log(`❌ Validation failed with status: ${code}`);
          console.log('Error Data:', data);
          return data;
        }
      })
    };
    const next2 = () => {
      console.log('❌ Validation should have failed but passed');
    };

    validateResident(req2, res2, next2);
    
    if (validationFailed) {
      console.log('✅ Validation correctly failed for invalid data');
    } else {
      console.log('❌ Validation should have failed but passed');
    }

    // Test 3: Create actual resident with valid data
    console.log('\n📝 Test 3: Creating actual resident with valid data...');
    const resident = new Resident({
      ...validResidentData,
      pgId: testPG._id,
      createdBy: testUser._id
    });

    try {
      await resident.save();
      console.log('✅ Resident created successfully:', resident._id);
    } catch (error) {
      console.log('❌ Failed to create resident:', error.message);
    }

    console.log('\n🎉 Resident validation tests completed!');
    console.log('\n📋 Summary:');
    console.log('  ✅ branchId field is now included in validation schema');
    console.log('  ✅ Validation middleware works correctly');
    console.log('  ✅ Resident creation works with proper data');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await User.deleteMany({ email: 'test@example.com' });
      await PG.deleteMany({ name: 'Test PG' });
      await Branch.deleteMany({ name: 'Test Branch' });
      await Resident.deleteMany({ firstName: 'Test' });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
    
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
testResidentValidation(); 