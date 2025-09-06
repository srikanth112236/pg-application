import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useOnboarding from '../../hooks/useOnboarding';

const RoleRedirect = () => {
  const { user } = useSelector((state) => state.auth);
  const { needsOnboarding, isOnboardingComplete } = useOnboarding();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndRedirect = async () => {
      console.log('🔄 RoleRedirect: Starting redirect check...');
      console.log('👤 User:', user ? { id: user._id, email: user.email, role: user.role } : 'No user');
      console.log('❓ Needs onboarding:', needsOnboarding());
      console.log('✅ Is onboarding complete:', isOnboardingComplete());
      
      if (user && user.role) {
        console.log('🎯 RoleRedirect: User authenticated, checking role:', user.role);
        
        // Only check onboarding for admin users
        if (user.role === 'admin') {
          console.log('🔍 RoleRedirect: Admin user detected, checking onboarding...');
          
          // Check if user needs onboarding
          if (needsOnboarding()) {
            console.log('🔄 RoleRedirect: User needs onboarding, redirecting to onboarding');
            navigate('/onboarding');
            return;
          }

          // Check if onboarding is complete
          if (isOnboardingComplete()) {
            console.log('✅ RoleRedirect: Onboarding complete, redirecting to admin dashboard');
            navigate('/admin/dashboard');
            return;
          }

          // If we get here, something is wrong with the onboarding status
          console.log('❓ RoleRedirect: Onboarding status unclear, redirecting to onboarding');
          navigate('/onboarding');
          return;
        }

        // For non-admin users, redirect based on role
        console.log('🎯 RoleRedirect: Redirecting user with role:', user.role);
        
        switch (user.role) {
          case 'superadmin':
            console.log('👑 RoleRedirect: Redirecting superadmin to dashboard');
            navigate('/superadmin/dashboard');
            break;
          case 'support':
            console.log('🛠️ RoleRedirect: Redirecting support staff to dashboard');
            navigate('/support/dashboard');
            break;
          case 'user':
            console.log('👤 RoleRedirect: Redirecting user to dashboard');
            navigate('/user/dashboard'); // Future user dashboard
            break;
          default:
            console.warn('⚠️ RoleRedirect: Unknown user role:', user.role);
            navigate('/login');
            break;
        }
      } else {
        console.log('🚫 RoleRedirect: No user or role found, redirecting to login');
        navigate('/login');
      }
    };

    checkAndRedirect();
  }, [user, needsOnboarding, isOnboardingComplete, navigate]);

  // Show loading while checking
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
        {user && (
          <div className="mt-4 text-sm text-gray-500">
            <p>User Role: {user.role}</p>
            <p>Needs Onboarding: {needsOnboarding() ? 'Yes' : 'No'}</p>
            <p>Onboarding Complete: {isOnboardingComplete() ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleRedirect; 