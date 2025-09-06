import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import SuperadminLayout from './layouts/SuperadminLayout';
import AdminLayout from './layouts/AdminLayout';
import SupportLayout from './layouts/SupportLayout';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminLogin from './components/auth/AdminLogin';
import AdminForgotPassword from './components/auth/AdminForgotPassword';
import SupportLogin from './components/auth/SupportLogin';

// Page Components
import Dashboard from './pages/superadmin/Dashboard';
import Users from './pages/superadmin/Users';
import SupportStaff from './pages/superadmin/SupportStaff';
import AdminDashboard from './pages/admin/Dashboard';
import PgManagement from './pages/superadmin/PgManagement';
import PGManagement from './pages/admin/PGManagement';
import Residents from './pages/admin/Residents';
import ResidentOnboarding from './pages/admin/ResidentOnboarding';
import ResidentOffboarding from './pages/admin/ResidentOffboarding';
import RoomSwitching from './pages/admin/RoomSwitching';
import MovedOut from './pages/admin/MovedOut';
import ResidentProfile from './pages/admin/ResidentProfile';
import Payments from './pages/admin/Payments';
import QRCodeManagement from './pages/admin/QRCodeManagement';
import RoomAvailability from './pages/admin/RoomAvailability';
import QRInterface from './pages/public/QRInterface';
import Settings from './pages/admin/Settings';
import Tickets from './pages/admin/Tickets';
import Reports from './pages/admin/Reports';
import TicketManagement from './pages/superadmin/TicketManagement';
import TicketDetails from './pages/superadmin/TicketDetails';
import SupportTickets from './pages/support/Tickets';
import SupportDashboard from './pages/support/Dashboard';
import SupportProfile from './pages/support/Profile';
import SupportSettings from './pages/support/Settings';
import TicketAnalytics from './pages/support/TicketAnalytics';
import SupportTicketDetails from './pages/support/TicketDetails';
import SuperadminTicketAnalytics from './pages/superadmin/TicketAnalytics';
import RecentActivities from './pages/superadmin/RecentActivities';
import TicketActivities from './pages/superadmin/TicketActivities';
import SuperadminActivities from './pages/superadmin/SuperadminActivities';
import BranchActivities from './pages/admin/BranchActivities';
import AllActivities from './pages/admin/AllActivities';
import AdminActivities from './pages/admin/AdminActivities';
import SupportActivities from './pages/support/SupportActivities';

// Common Components
import RoleRedirect from './components/common/RoleRedirect';
import ProtectedRoute from './components/common/ProtectedRoute';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import OnboardingTest from './components/debug/OnboardingTest';
import UserManagement from './components/superadmin/UserManagement';
import NotificationsPage from './pages/admin/Notifications';

const App = () => {
  const { user, loading, hasCheckedAuth } = useAuth();
  const [showFallback, setShowFallback] = useState(false);
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    console.log('🎬 App render state:', { user: !!user, loading, hasCheckedAuth });
    
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 3000);

    // Force render after 8 seconds if still loading
    const forceTimer = setTimeout(() => {
      if (loading) {
        console.log('🚨 Force rendering app due to prolonged loading');
        setForceRender(true);
      }
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
    };
  }, [user, loading, hasCheckedAuth]);

  // Show loading screen while checking authentication (unless forced to render)
  if (loading && !forceRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {showFallback ? 'Almost ready...' : 'Loading...'}
          </p>
          {showFallback && (
            <button 
              onClick={() => setForceRender(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue Anyway
            </button>
          )}
        </div>
      </div>
    );
  }

  console.log('🚀 App rendering routes...');

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/public/qr/:qrCode" element={<QRInterface />} />
      {/* Admin Public Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      
      {/* Support Public Routes */}
      <Route path="/support-login" element={<SupportLogin />} />
      
      {/* Onboarding Route */}
      <Route path="/onboarding" element={<OnboardingWizard />} />
      <Route path="/onboarding-test" element={<OnboardingTest />} />
      
      {/* Role-based Redirects */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/dashboard" element={<RoleRedirect />} />
      
      {/* Superadmin Routes */}
      <Route path="/superadmin" element={<SuperadminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="activities" element={<RecentActivities />} />
        <Route path="superadmin-activities" element={<SuperadminActivities />} />
        <Route path="ticket-activities" element={<TicketActivities />} />
        <Route path="pg-management" element={<PgManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="support-staff" element={<SupportStaff />} />
        <Route path="tickets" element={<TicketManagement />} />
        <Route path="tickets/:id" element={<TicketDetails />} />
        <Route path="payments" element={<div className="p-8 text-center text-gray-500">Payment Tracking (Coming Soon)</div>} />
        <Route path="analytics" element={<SuperadminTicketAnalytics />} />
        <Route path="reports" element={<div className="p-8 text-center text-gray-500">Reports (Coming Soon)</div>} />
        <Route path="settings" element={<div className="p-8 text-center text-gray-500">Settings (Coming Soon)</div>} />
      </Route>
      
      {/* Admin Routes - Protected with Onboarding Check */}
      <Route path="/admin" element={
        <ProtectedRoute requireOnboarding={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="activities" element={<AllActivities />} />
        <Route path="admin-activities" element={<AdminActivities />} />
        <Route path="pg-management" element={
          <ProtectedRoute requireOnboarding={true}>
            <PGManagement />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute requireOnboarding={true}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="residents" element={
          <ProtectedRoute requireOnboarding={true}>
            <Residents />
          </ProtectedRoute>
        } />
        <Route path="residents/:id" element={
          <ProtectedRoute requireOnboarding={true}>
            <ResidentProfile />
          </ProtectedRoute>
        } />
       
        <Route path="onboarding" element={
          <ProtectedRoute requireOnboarding={true}>
            <ResidentOnboarding />
          </ProtectedRoute>
        } />
        <Route path="offboarding" element={
          <ProtectedRoute requireOnboarding={true}>
            <ResidentOffboarding />
          </ProtectedRoute>
        } />
        <Route path="room-switching" element={
          <ProtectedRoute requireOnboarding={true}>
            <RoomSwitching />
          </ProtectedRoute>
        } />
        <Route path="moved-out" element={
          <ProtectedRoute requireOnboarding={true}>
            <MovedOut />
          </ProtectedRoute>
        } />
        <Route path="payments" element={
          <ProtectedRoute requireOnboarding={true}>
            <Payments />
          </ProtectedRoute>
        } />
        <Route path="notifications" element={
          <ProtectedRoute requireOnboarding={true}>
            <NotificationsPage   />
          </ProtectedRoute>
        } />
        <Route path="qr-management" element={
          <ProtectedRoute requireOnboarding={true}>
            <QRCodeManagement />
          </ProtectedRoute>
        } />
        <Route path="profile" element={
          <ProtectedRoute requireOnboarding={true}>
            <ResidentProfile />
          </ProtectedRoute>
        } />
        <Route path="payments-report" element={
          <ProtectedRoute requireOnboarding={true}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="room-availability" element={
          <ProtectedRoute requireOnboarding={true}>
            <RoomAvailability />
          </ProtectedRoute>
        } />
        <Route path="branch-activities" element={
          <ProtectedRoute requireOnboarding={true}>
            <BranchActivities />
          </ProtectedRoute>
        } />
        <Route path="tickets" element={
          <ProtectedRoute requireOnboarding={true}>
            <Tickets />
          </ProtectedRoute>
        } />
      </Route>

      {/* Support Routes */}
      <Route path="/support" element={<SupportLayout />}>
        <Route path="dashboard" element={<SupportDashboard />} />
        <Route path="tickets" element={<SupportTickets />} />
        <Route path="tickets/:id" element={<SupportTicketDetails />} />
        <Route path="activities" element={<SupportActivities />} />
        <Route path="analytics" element={<TicketAnalytics />} />
        <Route path="profile" element={<SupportProfile />} />
        <Route path="settings" element={<SupportSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App; 