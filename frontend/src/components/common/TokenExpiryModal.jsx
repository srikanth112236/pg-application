import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { logout, clearAuth } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

/**
 * Token Expiry Modal Component
 * Shows when user's authentication token has expired
 * Handles navigation based on user role
 */
const TokenExpiryModal = ({ isOpen, onClose, onRefresh }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Get user from localStorage as fallback if Redux state is empty
  const getUserFromStorage = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };
  
  const currentUser = user || getUserFromStorage();

  // Listen for token expiry events to get error details
  useEffect(() => {
    const handleTokenExpired = (event) => {
      console.log('🚫 TokenExpiryModal: Received token expiry event:', event.detail);
      if (event.detail?.message) {
        setErrorMessage(event.detail.message);
      }
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Clear auth data immediately without API call since token is expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear Redux state to prevent auto-login
      dispatch(clearAuth());
      
      // Navigate based on user role
      if (currentUser?.role === 'superadmin') {
        navigate('/login');
      } else {
        navigate('/admin/login');
      }
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear auth and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear Redux state to prevent auto-login
      dispatch(clearAuth());
      
      if (currentUser?.role === 'superadmin') {
        navigate('/login');
      } else {
        navigate('/admin/login');
      }
    }
  };

  const handleRefresh = async () => {
    try {
      if (onRefresh) {
        await onRefresh();
        toast.success('Session refreshed successfully');
        onClose();
      }
    } catch (error) {
      toast.error('Failed to refresh session');
      handleLogout();
    }
  };

  const handleContinue = () => {
    // Force logout and redirect
    handleLogout();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Session Expired
                </h3>
                <p className="text-sm text-gray-500">
                  Your session has expired
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
                             <div className="mb-4">
                   <p className="text-gray-700 mb-3">
                     {errorMessage || 'Your authentication session has expired. For security reasons, you need to log in again.'}
                   </p>
                   <p className="text-sm text-gray-500">
                     Any unsaved work may be lost.
                   </p>
                 </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try to Refresh Session
                </button>
              )}
              
              <button
                onClick={handleContinue}
                className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log In Again
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              You will be redirected to the appropriate login page based on your role.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TokenExpiryModal; 