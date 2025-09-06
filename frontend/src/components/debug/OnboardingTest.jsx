import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const OnboardingTest = () => {
  const { user } = useSelector((state) => state.auth);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testOnboardingAPI = async () => {
    if (!user) {
      setError('No user found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🧪 Testing onboarding API for user:', user._id);
      
      const response = await fetch('/api/onboarding/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('📡 Onboarding API response:', data);
      
      if (data.success) {
        setOnboardingStatus(data.data);
      } else {
        setError(data.message || 'Failed to fetch onboarding status');
      }
    } catch (err) {
      console.error('❌ Onboarding API error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createOnboarding = async () => {
    if (!user) {
      setError('No user found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🆕 Creating onboarding for user:', user._id);
      
      const response = await fetch('/api/onboarding/complete-step', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          stepId: 'profile_completion',
          data: { test: true }
        })
      });

      const data = await response.json();
      console.log('📡 Create onboarding response:', data);
      
      if (data.success) {
        setOnboardingStatus(data.data);
      } else {
        setError(data.message || 'Failed to create onboarding');
      }
    } catch (err) {
      console.error('❌ Create onboarding error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      testOnboardingAPI();
    }
  }, [user]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Onboarding Debug Test</h2>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">User Information</h3>
          <p>ID: {user?._id || 'No user'}</p>
          <p>Email: {user?.email || 'No email'}</p>
          <p>Role: {user?.role || 'No role'}</p>
          <p>Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</p>
        </div>

        {/* Actions */}
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Actions</h3>
          <div className="space-x-4">
            <button
              onClick={testOnboardingAPI}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Onboarding API'}
            </button>
            <button
              onClick={createOnboarding}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Onboarding'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-semibold mb-2">Onboarding Status</h3>
          {loading && <p className="text-blue-600">Loading...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {onboardingStatus && (
            <div>
              <p>Is Completed: {onboardingStatus.isCompleted ? 'Yes' : 'No'}</p>
              <p>Current Step: {onboardingStatus.currentStep}</p>
              <p>Steps Count: {onboardingStatus.steps?.length || 0}</p>
              <p>Completed Steps: {onboardingStatus.steps?.filter(s => s.completed).length || 0}</p>
            </div>
          )}
        </div>

        {/* Raw Data */}
        {onboardingStatus && (
          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Raw Onboarding Data</h3>
            <pre className="text-xs overflow-auto bg-white p-2 rounded">
              {JSON.stringify(onboardingStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingTest; 