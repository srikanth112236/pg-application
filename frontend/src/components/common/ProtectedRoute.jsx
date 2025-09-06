import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import useOnboarding from '../../hooks/useOnboarding';

const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { needsOnboarding, isOnboardingComplete } = useOnboarding();

  // If not authenticated, redirect to appropriate login based on current path
  if (!isAuthenticated || !user) {
    console.log('🔒 ProtectedRoute: User not authenticated, redirecting to login');
    
    // Determine redirect path based on current location
    const currentPath = window.location.pathname;
    let redirectPath = '/login'; // Default for superadmin
    
    if (currentPath.startsWith('/admin')) {
      redirectPath = '/admin/login';
    } else if (currentPath.startsWith('/superadmin')) {
      redirectPath = '/login';
    }
    
    console.log(`🔒 ProtectedRoute: Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // If this route requires onboarding check (for admin users)
  if (requireOnboarding && user.role === 'admin') {
    console.log('🔍 ProtectedRoute: Checking onboarding for admin user');
    console.log('❓ Needs onboarding:', needsOnboarding());
    console.log('✅ Is onboarding complete:', isOnboardingComplete());

    // Check if user needs onboarding
    if (needsOnboarding()) {
      console.log('🔄 ProtectedRoute: User needs onboarding, redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    }

    // Check if onboarding is complete
    if (isOnboardingComplete()) {
      console.log('✅ ProtectedRoute: Onboarding complete, allowing access');
      return children;
    }

    // If we get here, something is wrong with the onboarding status
    console.log('❓ ProtectedRoute: Onboarding status unclear, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // For non-admin users or routes that don't require onboarding check
  console.log('✅ ProtectedRoute: Allowing access');
  return children;
};

export default ProtectedRoute; 