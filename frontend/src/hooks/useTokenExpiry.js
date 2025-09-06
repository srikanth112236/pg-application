import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import authService from '../services/auth.service';

/**
 * Custom hook to handle token expiry detection and modal management
 * @returns {Object} Token expiry state and handlers
 */
export const useTokenExpiry = () => {
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const { user } = useSelector((state) => state.auth);

  /**
   * Check if token is expired
   * @returns {boolean} True if token is expired
   */
  const checkTokenExpiry = useCallback(() => {
    const token = authService.getAccessToken();
    if (!token) {
      return true;
    }

    try {
      // Decode JWT token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // Check if token is expired (with 30 second buffer)
      const isExpired = payload.exp < (currentTime - 30);
      
      if (isExpired && !isTokenExpired) {
        setIsTokenExpired(true);
        setShowExpiryModal(true);
      }
      
      return isExpired;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }, [isTokenExpired]);

  /**
   * Handle token expiry
   */
  const handleTokenExpiry = useCallback(() => {
    setIsTokenExpired(true);
    setShowExpiryModal(true);
  }, []);

  /**
   * Close expiry modal
   */
  const closeExpiryModal = useCallback(() => {
    setShowExpiryModal(false);
  }, []);

  /**
   * Refresh token attempt
   */
  const handleRefreshToken = useCallback(async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Attempt to refresh token
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.success && data.data?.accessToken) {
        // Store new token
        localStorage.setItem('accessToken', data.data.accessToken);
        setIsTokenExpired(false);
        setShowExpiryModal(false);
        return true;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }, []);

  /**
   * Get navigation path based on user role
   */
  const getLoginPath = useCallback(() => {
    if (user?.role === 'superadmin') {
      return '/login';
    } else {
      return '/admin/login';
    }
  }, [user?.role]);

  // Check token expiry periodically
  useEffect(() => {
    const checkExpiry = () => {
      checkTokenExpiry();
    };

    // Check immediately
    checkExpiry();

    // Check every 30 seconds
    const interval = setInterval(checkExpiry, 30000);

    return () => clearInterval(interval);
  }, [checkTokenExpiry]);

  // Check token expiry on route changes
  useEffect(() => {
    checkTokenExpiry();
  }, [checkTokenExpiry]);

  // Listen for token expiry events from API
  useEffect(() => {
    const handleTokenExpired = (event) => {
      console.log('🚫 Token expiry event received:', event.detail);
      setIsTokenExpired(true);
      setShowExpiryModal(true);
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    return () => {
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []);

  return {
    showExpiryModal,
    isTokenExpired,
    handleTokenExpiry,
    closeExpiryModal,
    handleRefreshToken,
    getLoginPath,
    checkTokenExpiry,
  };
}; 