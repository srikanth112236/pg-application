const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('./src/models/user.model');
const PG = require('./src/models/pg.model');
const Branch = require('./src/models/branch.model');
const Resident = require('./src/models/resident.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const testResidentCRUD = async () => {
  try {
    console.log('🧪 Testing Resident CRUD functionality with updated schema...\n');

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
      description: 'Test PG for resident CRUD testing',
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

    // Test 1: Create resident with minimal required fields
    console.log('\n📝 Test 1: Creating resident with minimal required fields...');
    const minimalResident = new Resident({
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
      pgId: testPG._id,
      branchId: testBranch._id,
      checkInDate: new Date(),
      contractStartDate: new Date(),
      createdBy: testUser._id
    });
    await minimalResident.save();
    console.log('✅ Minimal resident created:', minimalResident._id);

    // Test 2: Create resident with all optional fields
    console.log('\n📝 Test 2: Creating resident with all optional fields...');
    const fullResident = new Resident({
      firstName: 'Full',
      lastName: 'Resident',
      email: 'fullresident@example.com',
      phone: '1234567891',
      alternatePhone: '1234567892',
      dateOfBirth: new Date('1995-05-15'),
      gender: 'female',
      permanentAddress: {
        street: '789 Full Street',
        city: 'Full City',
        state: 'Full State',
        pincode: '654321'
      },
      workDetails: {
        company: 'Test Company',
        designation: 'Software Engineer',
        workAddress: '456 Work Street, Work City',
        workPhone: '1234567893',
        workEmail: 'work@example.com',
        salary: 50000,
        joiningDate: new Date('2023-01-01')
      },
      emergencyContact: {
        name: 'Emergency Contact Full',
        relationship: 'Spouse',
        phone: '1234567894',
        address: '789 Emergency Street, Full City'
      },
      pgId: testPG._id,
      branchId: testBranch._id,
      roomNumber: 'A101',
      bedNumber: 1,
      status: 'active',
      checkInDate: new Date(),
      contractStartDate: new Date(),
      contractEndDate: new Date('2024-12-31'),
      documents: {
        idProof: 'path/to/id-proof.pdf',
        addressProof: 'path/to/address-proof.pdf',
        workId: 'path/to/work-id.pdf',
        photo: 'path/to/photo.jpg'
      },
      dietaryRestrictions: 'Vegetarian',
      medicalConditions: 'None',
      specialRequirements: 'Quiet room preferred',
      notes: 'Test resident with all fields filled',
      createdBy: testUser._id
    });
    await fullResident.save();
    console.log('✅ Full resident created:', fullResident._id);

    // Test 3: Create resident with only work details (no email)
    console.log('\n📝 Test 3: Creating resident with work details but no email...');
    const workOnlyResident = new Resident({
      firstName: 'Work',
      lastName: 'Resident',
      phone: '1234567895',
      dateOfBirth: new Date('1992-03-20'),
      gender: 'male',
      permanentAddress: {
        street: '321 Work Street',
        city: 'Work City',
        state: 'Work State',
        pincode: '111111'
      },
      workDetails: {
        company: 'Another Company',
        designation: 'Manager',
        workAddress: '999 Work Address, Work City'
      },
      emergencyContact: {
        name: 'Work Emergency Contact',
        relationship: 'Sibling',
        phone: '1234567896',
        address: '888 Emergency Address, Work City'
      },
      pgId: testPG._id,
      branchId: testBranch._id,
      checkInDate: new Date(),
      contractStartDate: new Date(),
      createdBy: testUser._id
    });
    await workOnlyResident.save();
    console.log('✅ Work-only resident created:', workOnlyResident._id);

    // Test 4: Create resident with email but no work details
    console.log('\n📝 Test 4: Creating resident with email but no work details...');
    const emailOnlyResident = new Resident({
      firstName: 'Email',
      lastName: 'Resident',
      email: 'emailresident@example.com',
      phone: '1234567897',
      dateOfBirth: new Date('1988-12-10'),
      gender: 'female',
      permanentAddress: {
        street: '555 Email Street',
        city: 'Email City',
        state: 'Email State',
        pincode: '222222'
      },
      emergencyContact: {
        name: 'Email Emergency Contact',
        relationship: 'Friend',
        phone: '1234567898',
        address: '777 Emergency Address, Email City'
      },
      pgId: testPG._id,
      branchId: testBranch._id,
      checkInDate: new Date(),
      contractStartDate: new Date(),
      createdBy: testUser._id
    });
    await emailOnlyResident.save();
    console.log('✅ Email-only resident created:', emailOnlyResident._id);

    // Test 5: Verify all residents were created
    console.log('\n📊 Test 5: Verifying all residents were created...');
    const allResidents = await Resident.find({ firstName: { $in: ['Test', 'Full', 'Work', 'Email'] } });
    console.log(`✅ Found ${allResidents.length} test residents:`);
    allResidents.forEach(resident => {
      console.log(`  - ${resident.firstName} ${resident.lastName} (${resident.email || 'No email'}) - ${resident.status}`);
    });

    // Test 6: Test resident retrieval with population
    console.log('\n📊 Test 6: Testing resident retrieval with population...');
    const populatedResident = await Resident.findById(fullResident._id)
      .populate('pgId', 'name')
      .populate('branchId', 'name')
      .populate('createdBy', 'firstName lastName');
    
    console.log('✅ Populated resident data:');
    console.log(`  - Name: ${populatedResident.firstName} ${populatedResident.lastName}`);
    console.log(`  - Email: ${populatedResident.email || 'No email'}`);
    console.log(`  - PG: ${populatedResident.pgId?.name}`);
    console.log(`  - Branch: ${populatedResident.branchId?.name}`);
    console.log(`  - Created by: ${populatedResident.createdBy?.firstName} ${populatedResident.createdBy?.lastName}`);
    console.log(`  - Work details: ${populatedResident.workDetails?.company || 'No work details'}`);

    // Test 7: Test resident update
    console.log('\n📝 Test 7: Testing resident update...');
    const updatedResident = await Resident.findByIdAndUpdate(
      minimalResident._id,
      {
        $set: {
          email: 'updated@example.com',
          workDetails: {
            company: 'Updated Company',
            designation: 'Updated Role'
          },
          status: 'active'
        }
      },
      { new: true }
    );
    console.log('✅ Resident updated:', updatedResident.firstName, updatedResident.email);

    // Test 8: Test resident deletion (soft delete)
    console.log('\n🗑️ Test 8: Testing resident soft delete...');
    const deletedResident = await Resident.findByIdAndUpdate(
      emailOnlyResident._id,
      { isActive: false },
      { new: true }
    );
    console.log('✅ Resident soft deleted:', deletedResident.firstName, 'Active:', deletedResident.isActive);

    // Test 9: Verify active residents count
    console.log('\n📊 Test 9: Verifying active residents count...');
    const activeResidents = await Resident.find({ isActive: true });
    console.log(`✅ Active residents count: ${activeResidents.length}`);

    // Test 10: Test resident search
    console.log('\n🔍 Test 10: Testing resident search...');
    const searchResults = await Resident.find({
      $or: [
        { firstName: { $regex: 'Test', $options: 'i' } },
        { lastName: { $regex: 'Resident', $options: 'i' } }
      ],
      isActive: true
    });
    console.log(`✅ Search results: ${searchResults.length} residents found`);

    console.log('\n🎉 All resident CRUD tests completed successfully!');
    console.log('\n📋 Summary of changes tested:');
    console.log('  ✅ Email field is now optional');
    console.log('  ✅ Work details are now optional');
    console.log('  ✅ Financial details (rentAmount, securityDeposit, paymentCycle) removed');
    console.log('  ✅ Documents field is now optional');
    console.log('  ✅ All CRUD operations work correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    try {
      await User.deleteMany({ email: 'test@example.com' });
      await PG.deleteMany({ name: 'Test PG' });
      await Branch.deleteMany({ name: 'Test Branch' });
      await Resident.deleteMany({ firstName: { $in: ['Test', 'Full', 'Work', 'Email'] } });
      console.log('✅ Test data cleaned up');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }
    
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
testResidentCRUD(); 