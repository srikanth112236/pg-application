import { useSelector } from 'react-redux';

const useOnboarding = () => {
  const { user, onboardingStatus } = useSelector((state) => state.auth);

  // Check if onboarding is needed (for admin users)
  const needsOnboarding = () => {
    if (!user || user.role !== 'admin') return false;
    if (!onboardingStatus) return true; // If no onboarding status, assume needs onboarding
    return !onboardingStatus.isCompleted;
  };

  // Check if onboarding is complete
  const isOnboardingComplete = () => {
    if (!user || user.role !== 'admin') return true; // Non-admin users don't need onboarding
    if (!onboardingStatus) return false; // If no onboarding status, assume incomplete
    return onboardingStatus.isCompleted;
  };

  // Get current step
  const getCurrentStep = () => {
    if (!onboardingStatus) return 'profile_completion';
    return onboardingStatus.currentStep;
  };

  // Get step progress
  const getStepProgress = () => {
    if (!onboardingStatus || !onboardingStatus.steps) return 0;
    
    const totalSteps = onboardingStatus.steps.length;
    const completedSteps = onboardingStatus.steps.filter(step => step.completed).length;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  // Get current step info
  const getCurrentStepInfo = () => {
    if (!onboardingStatus || !onboardingStatus.steps) return null;
    
    const currentStep = getCurrentStep();
    return onboardingStatus.steps.find(step => step.stepId === currentStep);
  };

  // Get all steps
  const getSteps = () => {
    return onboardingStatus?.steps || [];
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  console.log('🔍 useOnboarding: Current state:', {
    userRole: user?.role,
    hasOnboardingStatus: !!onboardingStatus,
    isCompleted: onboardingStatus?.isCompleted,
    currentStep: onboardingStatus?.currentStep,
    needsOnboarding: needsOnboarding(),
    isOnboardingComplete: isOnboardingComplete()
  });

  return {
    onboardingStatus,
    currentStep: getCurrentStep(),
    loading: false, // No loading since we get data from Redux
    needsOnboarding,
    isOnboardingComplete,
    getStepProgress,
    getCurrentStepInfo,
    getSteps,
    isAdmin,
    // Keep the API methods for updating onboarding status
    fetchOnboardingStatus: () => {}, // No-op since we get from Redux
    completeStep: async (stepId, data = {}) => {
      // This would be called from the onboarding wizard to update status
      console.log('🔄 Completing step:', stepId, data);
      // The actual API call would be handled in the onboarding wizard
    },
    skipStep: async (stepId) => {
      console.log('⏭️ Skipping step:', stepId);
      // The actual API call would be handled in the onboarding wizard
    },
    updateProfile: async (profileData) => {
      console.log('👤 Updating profile:', profileData);
      // The actual API call would be handled in the onboarding wizard
    },
    configurePG: async (pgData) => {
      console.log('🏠 Configuring PG:', pgData);
      // The actual API call would be handled in the onboarding wizard
    },
    completeSecuritySetup: async (newPassword) => {
      console.log('🔐 Completing security setup');
      // The actual API call would be handled in the onboarding wizard
    },
    completeFeatureTour: async () => {
      console.log('🎯 Completing feature tour');
      // The actual API call would be handled in the onboarding wizard
    },
    completeFirstResident: async (residentData) => {
      console.log('👥 Completing first resident:', residentData);
      // The actual API call would be handled in the onboarding wizard
    },
    completePaymentSetup: async (paymentData) => {
      console.log('💳 Completing payment setup:', paymentData);
      // The actual API call would be handled in the onboarding wizard
    }
  };
};

export default useOnboarding; 