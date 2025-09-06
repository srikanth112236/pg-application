const mongoose = require('mongoose');
const Onboarding = require('./src/models/onboarding.model');
const User = require('./src/models/user.model');
require('dotenv').config();

async function testOnboarding() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test user (admin)
    const user = await User.findOne({ role: 'admin' });
    if (!user) {
      console.log('❌ No admin user found for testing');
      return;
    }

    console.log('👤 Test user:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Test onboarding creation
    console.log('\n🔄 Testing onboarding creation...');
    const onboarding = await Onboarding.createForUser(user._id);
    console.log('✅ Created onboarding:', {
      id: onboarding._id,
      userId: onboarding.userId,
      isCompleted: onboarding.isCompleted,
      currentStep: onboarding.currentStep,
      stepsCount: onboarding.steps.length
    });

    // Test step completion
    console.log('\n🔄 Testing step completion...');
    await onboarding.completeStep('profile_completion', { firstName: 'Test', lastName: 'User' });
    console.log('✅ Completed profile step:', {
      isCompleted: onboarding.isCompleted,
      currentStep: onboarding.currentStep
    });

    // Test getting onboarding status
    console.log('\n🔄 Testing get onboarding status...');
    const status = await Onboarding.findOne({ userId: user._id });
    console.log('✅ Onboarding status:', {
      isCompleted: status.isCompleted,
      currentStep: status.currentStep,
      completedSteps: status.steps.filter(s => s.completed).length
    });

    console.log('\n✅ Onboarding test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testOnboarding(); 