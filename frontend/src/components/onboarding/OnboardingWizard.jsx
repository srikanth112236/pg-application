import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, AlertTriangle, Loader2, Settings, Shield, User, CheckCircle, Building2, CreditCard } from 'lucide-react';
import { updateOnboardingStatus } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

// Import step components
import ProfileStep from './steps/ProfileStep';
import PgConfigurationStep from './steps/PGConfigurationStep';
import BranchSetupStep from './steps/BranchSetupStep';
import PaymentSettingsStep from './steps/PaymentSettingsStep';
import SecuritySetupStep from './steps/SecurityStep';
import OnboardingDebug from './OnboardingDebug';

const OnboardingWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, onboardingStatus } = useSelector((state) => state.auth);
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [stepData, setStepData] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showDashboardLoading, setShowDashboardLoading] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  // Define steps
  const steps = [
    {
      id: 'profile_completion',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself and your PG',
      component: ProfileStep,
      icon: User
    },
    {
      id: 'pg_configuration',
      title: 'Configure Your PG',
      description: 'Set up your PG details and settings',
      component: PgConfigurationStep,
      icon: Settings
    },
    {
      id: 'branch_setup',
      title: 'Setup Your Branch',
      description: 'Create your first branch location',
      component: BranchSetupStep,
      icon: Building2
    },
    {
      id: 'payment_settings',
      title: 'Payment Settings',
      description: 'Configure payment methods and rules',
      component: PaymentSettingsStep,
      icon: CreditCard
    },
    {
      id: 'security_setup',
      title: 'Security Setup',
      description: 'Change your password for security',
      component: SecuritySetupStep,
      icon: Shield
    }
  ];

  // Calculate progress
  const progress = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Show loading screen after onboarding completion
  if (showDashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-purple-100/20"></div>
          
          <div className="relative z-10 text-center">
            {/* Animated logo/icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Check className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Setting Up Your Dashboard
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              We're preparing everything for you. This will just take a moment...
            </p>
            
            {/* Progress steps */}
            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-800 font-medium">Profile configuration complete</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-800 font-medium">PG settings configured</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-green-800 font-medium">Security setup verified</span>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
                <span className="text-blue-800 font-medium">Preparing dashboard...</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Initializing...</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // API call to complete step
  const completeStep = async (stepId, data = {}) => {
    setIsLoading(true);
    try {
      let endpoint = '/api/onboarding/complete-step';
      let requestBody = { stepId, data };

      // Use specific endpoints for certain steps
      switch (stepId) {
        case 'security_setup':
          endpoint = '/api/onboarding/security-setup';
          requestBody = { newPassword: data.newPassword };
          break;
        case 'profile_completion':
          endpoint = '/api/onboarding/update-profile';
          requestBody = data;
          break;
        case 'pg_configuration':
          endpoint = '/api/onboarding/configure-pg';
          requestBody = data;
          break;
        case 'branch_setup':
          endpoint = '/api/onboarding/setup-branch';
          requestBody = data;
          break;
        case 'payment_settings':
          endpoint = '/api/onboarding/setup-payment-settings';
          requestBody = data;
          break;
        default:
          // Use the generic complete-step endpoint
          break;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to complete step');
      }

      // Update Redux state
      dispatch(updateOnboardingStatus(result.data));

      return result;
    } catch (error) {
      console.error('Error completing step:', error);
      toast.error(error.message || 'Failed to complete step');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async (stepData = {}) => {
    const currentStep = steps[currentStepIndex];
    
    // Complete current step
    const result = await completeStep(currentStep.id, stepData);
    
    if (result) {
      // If this is the security setup step, show success popup and then loading screen
      if (currentStep.id === 'security_setup') {
        setShowPasswordSuccess(true);
        
        // After user closes success popup, show loading screen and redirect
        setTimeout(() => {
          setShowPasswordSuccess(false);
          setShowDashboardLoading(true);
          
          // Clear tokens and redirect to login after loading
          setTimeout(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            // Clear Redux state
            dispatch({ type: 'auth/logout' });
            navigate('/login');
          }, 12000); // 12 seconds total
        }, 3000);
        return;
      }
      
      // Move to next step or complete onboarding
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setStepData({}); // Clear step data for next step
      } else {
        // Onboarding complete
        toast.success('Onboarding completed! Welcome to your dashboard.');
        setShowDashboardLoading(true);
        
        // Show loading screen for 10-15 seconds
        setTimeout(() => {
          setShowDashboardLoading(false);
          navigate('/admin/dashboard');
        }, 12000);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStepData({}); // Clear step data for previous step
    }
  };

  const handleStepDataChange = (newData) => {
    setStepData(newData);
    setHasUnsavedChanges(true);
  };

  const handleConfirmAction = (action) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeConfirmedAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Get current step component
  const CurrentStepComponent = steps[currentStepIndex].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PG Setup Wizard</h1>
              <p className="text-gray-600">Complete your PG setup in a few steps</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Progress Indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Step {currentStepIndex + 1} of {steps.length}</span>
                <span>•</span>
                <span>{progress}% Complete</span>
              </div>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Progress */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Setup Progress</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {currentStepIndex} of {steps.length} steps completed
                </p>
              </div>

              {/* Steps List */}
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const StepIcon = step.icon;
                  
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isCurrent 
                          ? 'bg-blue-50 border border-blue-200' 
                          : isCompleted 
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <StepIcon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                        }`}>
                          {step.title}
                        </p>
                        <p className={`text-xs ${
                          isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel - Current Step */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {steps[currentStepIndex].title}
                  </h3>
                  <p className="text-gray-600">
                    {steps[currentStepIndex].description}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Step {currentStepIndex + 1} of {steps.length}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CurrentStepComponent
                    onComplete={handleNext}
                    data={stepData}
                    setData={handleStepDataChange}
                    isLoading={isLoading}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {currentStepIndex > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Back</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <OnboardingDebug />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-medium text-gray-900">Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Success Popup */}
      {showPasswordSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Password Updated Successfully!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                For security reasons, please log in again with your new password.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Security Note:</strong> You will be automatically redirected to the login page in a few seconds.
                </p>
              </div>
              <button
                onClick={() => setShowPasswordSuccess(false)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingWizard; 