const mongoose = require('mongoose');

const onboardingStepSchema = new mongoose.Schema({
  stepId: {
    type: String,
    required: true,
    enum: [
      'profile_completion',
      'pg_configuration', 
      'branch_setup',
      'payment_settings',
      'security_setup',
      'feature_tour',
      'first_resident',
      'payment_setup'
    ]
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const onboardingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  currentStep: {
    type: String,
    default: 'profile_completion',
    enum: [
      'profile_completion',
      'pg_configuration',
      'branch_setup',
      'payment_settings',
      'security_setup', 
      'feature_tour',
      'first_resident',
      'payment_setup',
      'completed'
    ]
  },
  steps: [onboardingStepSchema],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  skippedSteps: [{
    type: String,
    enum: [
      'profile_completion',
      'pg_configuration',
      'branch_setup',
      'payment_settings',
      'security_setup',
      'feature_tour',
      'first_resident',
      'payment_setup'
    ]
  }]
}, {
  timestamps: true
});

// Index for quick lookups
onboardingSchema.index({ userId: 1 });
onboardingSchema.index({ isCompleted: 1 });

// Method to check if onboarding is complete
onboardingSchema.methods.isOnboardingComplete = function() {
  return this.isCompleted && this.currentStep === 'completed';
};

// Method to get next step
onboardingSchema.methods.getNextStep = function() {
  const stepOrder = [
    'profile_completion',
    'pg_configuration',
    'branch_setup',
    'payment_settings',
    'security_setup',
    'feature_tour',
    'first_resident',
    'payment_setup'
  ];
  
  const currentIndex = stepOrder.indexOf(this.currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return 'completed';
  }
  
  return stepOrder[currentIndex + 1];
};

// Method to mark step as complete
onboardingSchema.methods.completeStep = function(stepId, data = {}) {
  const step = this.steps.find(s => s.stepId === stepId);
  if (step) {
    step.completed = true;
    step.completedAt = new Date();
    step.data = data;
  } else {
    this.steps.push({
      stepId,
      completed: true,
      completedAt: new Date(),
      data
    });
  }
  
  this.currentStep = this.getNextStep();
  if (this.currentStep === 'completed') {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Method to skip step
onboardingSchema.methods.skipStep = function(stepId) {
  if (!this.skippedSteps.includes(stepId)) {
    this.skippedSteps.push(stepId);
  }
  this.currentStep = this.getNextStep();
  return this.save();
};

// Static method to create onboarding for new user
onboardingSchema.statics.createForUser = async function(userId) {
  const onboarding = new this({
    userId,
    steps: [
      { stepId: 'profile_completion', completed: false },
      { stepId: 'pg_configuration', completed: false },
      { stepId: 'branch_setup', completed: false },
      { stepId: 'payment_settings', completed: false },
      { stepId: 'security_setup', completed: false },
      { stepId: 'feature_tour', completed: false },
      { stepId: 'first_resident', completed: false },
      { stepId: 'payment_setup', completed: false }
    ]
  });
  
  return onboarding.save();
};

module.exports = mongoose.model('Onboarding', onboardingSchema); 