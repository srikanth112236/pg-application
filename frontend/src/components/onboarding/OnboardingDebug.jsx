import React from 'react';
import { useSelector } from 'react-redux';
import useOnboarding from '../../hooks/useOnboarding';

const OnboardingDebug = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    onboardingStatus,
    currentStep,
    loading,
    needsOnboarding,
    isOnboardingComplete,
    getStepProgress,
    fetchOnboardingStatus
  } = useOnboarding();

  const handleRefresh = () => {
    fetchOnboardingStatus();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Onboarding Debug</h2>
      
      <div className="space-y-4">
        {/* User Info */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">User Info</h3>
          <p>ID: {user?._id || 'No user'}</p>
          <p>Email: {user?.email || 'No email'}</p>
          <p>Role: {user?.role || 'No role'}</p>
        </div>

        {/* Onboarding Status */}
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Onboarding Status</h3>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>Status: {onboardingStatus ? 'Loaded' : 'Not loaded'}</p>
          <p>Is Completed: {onboardingStatus?.isCompleted ? 'Yes' : 'No'}</p>
          <p>Current Step: {onboardingStatus?.currentStep || 'None'}</p>
          <p>Progress: {getStepProgress()}%</p>
          <p>Needs Onboarding: {needsOnboarding() ? 'Yes' : 'No'}</p>
          <p>Is Onboarding Complete: {isOnboardingComplete() ? 'Yes' : 'No'}</p>
        </div>

        {/* Steps Info */}
        {onboardingStatus && (
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Steps Info</h3>
            <div className="space-y-2">
              {onboardingStatus.steps.map((step, index) => (
                <div key={step.stepId} className="flex items-center justify-between">
                  <span>{step.stepId}</span>
                  <span className={step.completed ? 'text-green-600' : 'text-red-600'}>
                    {step.completed ? '✅' : '❌'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Actions</h3>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Onboarding Status
          </button>
        </div>

        {/* Raw Data */}
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Raw Data</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({ onboardingStatus, currentStep, loading }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDebug; 