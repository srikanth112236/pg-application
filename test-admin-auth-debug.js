const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pg-maintenance');

// Import User model
const User = require('./backend/src/models/user.model');

async function debugAdminAuth() {
  console.log('🧪 Admin Authentication Debug\n');

  try {
    // Find all admin users
    console.log('1. Checking for admin users in database...');
    const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName email role isActive');
    
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`   Role: "${user.role}" | Active: ${user.isActive}`);
    });

    if (adminUsers.length === 0) {
      console.log('\n❌ No admin users found!');
      console.log('🔧 Possible solutions:');
      console.log('1. Check if user role is exactly "admin" (case sensitive)');
      console.log('2. Run user creation script to create admin user');
      console.log('3. Check database connection');
      return;
    }

    // Check if there are users with similar roles
    console.log('\n2. Checking for users with role variations...');
    const allUsers = await User.find({}).select('email role');
    const roleMap = {};
    
    allUsers.forEach(user => {
      if (!roleMap[user.role]) {
        roleMap[user.role] = 0;
      }
      roleMap[user.role]++;
    });

    console.log('Role distribution:');
    Object.entries(roleMap).forEach(([role, count]) => {
      console.log(`- "${role}": ${count} users`);
    });

    // Test JWT token creation and verification
    console.log('\n3. Testing JWT token creation...');
    const testUser = adminUsers[0];
    
    const testToken = jwt.sign(
      { 
        userId: testUser._id,
        id: testUser._id,
        role: testUser.role 
      },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '24h' }
    );

    console.log('✅ JWT token created successfully');
    
    // Verify the token
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    console.log('✅ JWT token verified successfully');
    console.log('Token payload:', {
      userId: decoded.userId || decoded.id,
      role: decoded.role,
      exp: new Date(decoded.exp * 1000)
    });

    // Test authorization check
    console.log('\n4. Testing authorization logic...');
    const allowedRoles = ['admin'];
    const userRole = testUser.role;
    const isAuthorized = allowedRoles.includes(userRole);
    
    console.log('Authorization test:', {
      userRole: `"${userRole}"`,
      allowedRoles: allowedRoles,
      isAuthorized: isAuthorized,
      roleMatch: userRole === 'admin'
    });

    if (!isAuthorized) {
      console.log('❌ Authorization would fail!');
      console.log(`User role "${userRole}" not in allowed roles [${allowedRoles.join(', ')}]`);
    } else {
      console.log('✅ Authorization would succeed');
    }

    console.log('\n🎯 Debugging Steps for Frontend:');
    console.log('1. Check browser localStorage for accessToken');
    console.log('2. Check if token is being sent in Authorization header');
    console.log('3. Check browser console for authentication logs');
    console.log('4. Check backend logs for authentication/authorization messages');
    console.log('5. Verify user is actually logged in as admin');

    console.log('\n💡 Quick Test:');
    console.log('Try this in browser console:');
    console.log('localStorage.getItem("accessToken")');
    console.log('// Should return a JWT token');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run the debug
debugAdminAuth(); 