const { validateResident } = require('./src/middleware/validation.middleware');

// Test the validation middleware
const testValidation = () => {
  console.log('🧪 Testing Resident Validation Fix...\n');

  // Test 1: Valid data with branchId
  console.log('📝 Test 1: Valid data with branchId');
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    permanentAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456'
    },
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Parent',
      phone: '1234567890',
      address: '456 Emergency St'
    },
    branchId: '507f1f77bcf86cd799439011', // Mock ObjectId
    checkInDate: new Date(),
    contractStartDate: new Date()
  };

  const req1 = { body: validData };
  const res1 = {
    status: (code) => ({
      json: (data) => {
        console.log(`❌ Validation failed with status: ${code}`);
        console.log('Error:', data);
        return data;
      }
    })
  };
  let passed1 = false;
  const next1 = () => {
    passed1 = true;
    console.log('✅ Validation passed for valid data');
  };

  validateResident(req1, res1, next1);

  // Test 2: Invalid data without branchId
  console.log('\n📝 Test 2: Invalid data without branchId');
  const invalidData = {
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    permanentAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456'
    },
    emergencyContact: {
      name: 'Emergency Contact',
      relationship: 'Parent',
      phone: '1234567890',
      address: '456 Emergency St'
    },
    // Missing branchId
    checkInDate: new Date(),
    contractStartDate: new Date()
  };

  const req2 = { body: invalidData };
  let failed2 = false;
  const res2 = {
    status: (code) => ({
      json: (data) => {
        failed2 = true;
        console.log(`✅ Validation correctly failed with status: ${code}`);
        console.log('Error:', data);
        return data;
      }
    })
  };
  const next2 = () => {
    console.log('❌ Validation should have failed but passed');
  };

  validateResident(req2, res2, next2);

  console.log('\n📋 Test Results:');
  console.log(`  Test 1 (Valid data): ${passed1 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`  Test 2 (Invalid data): ${failed2 ? '✅ PASSED' : '❌ FAILED'}`);

  if (passed1 && failed2) {
    console.log('\n🎉 All validation tests passed! The branchId validation is working correctly.');
  } else {
    console.log('\n❌ Some validation tests failed. Please check the implementation.');
  }
};

// Run the test
testValidation(); 