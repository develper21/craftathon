import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import VerifyEmail from '../pages/VerifyEmail'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import PatientDashboard from '../pages/PatientDashboard'
import MedicationHistory from '../pages/MedicationHistory'
import AddMedication from '../pages/AddMedication'
import EditMedication from '../pages/EditMedication'
import Schedule from '../pages/Schedule'
import Adherence from '../pages/Adherence'
import AdherenceReport from '../pages/AdherenceReport'
import Profile from '../pages/Profile'
import Notifications from '../pages/Notifications'
import PatientDetail from '../pages/PatientDetail'
import Alerts from '../pages/Alerts'

// Caregiver Components
import CaregiverLayout from '../components/CaregiverLayout'
import CaregiverDashboard from '../pages/CaregiverDashboard'
import CaregiverPatientsList from '../pages/CaregiverPatientsList'
import CaregiverAlerts from '../pages/CaregiverAlerts'
import CaregiverReports from '../pages/CaregiverReports'
import CaregiverProfile from '../pages/CaregiverProfile'
import CaregiverNotifications from '../pages/CaregiverNotifications'

// Admin Components
import AdminLayout from '../components/AdminLayout'
import AdminDashboard from '../pages/AdminDashboard'
import AdminUsers from '../pages/AdminUsers'
import AdminAlerts from '../pages/AdminAlerts'
import AdminAnalytics from '../pages/AdminAnalytics'
import AdminSettings from '../pages/AdminSettings'
import AdminNotifications from '../pages/AdminNotifications'
import AdminProfile from '../pages/AdminProfile'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="text-gray-600">Loading...</div></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole) {
    const userRole = user?.role?.toUpperCase()
    const required = requiredRole.toUpperCase()
    // Special case: DOCTOR and CAREGIVER can both access caregiver routes
    const hasAccess = userRole === required || (required === 'CAREGIVER' && userRole === 'DOCTOR')
    if (!hasAccess) {
      return <Navigate to="/" />
    }
  }

  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Patient Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medication-history"
        element={
          <ProtectedRoute requiredRole="patient">
            <MedicationHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-medication"
        element={
          <ProtectedRoute requiredRole="patient">
            <AddMedication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-medication/:medicationId"
        element={
          <ProtectedRoute requiredRole="patient">
            <EditMedication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute requiredRole="patient">
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adherence"
        element={
          <ProtectedRoute requiredRole="patient">
            <Adherence />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adherence-report"
        element={
          <ProtectedRoute requiredRole="patient">
            <AdherenceReport />
          </ProtectedRoute>
        }
      />

      {/* Shared Routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/patient/:patientId"
        element={
          <ProtectedRoute requiredRole="doctor">
            <PatientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/alerts"
        element={
          <ProtectedRoute requiredRole="doctor">
            <Alerts />
          </ProtectedRoute>
        }
      />

      {/* Caregiver Nested Routes */}
      <Route
        path="/caregiver"
        element={
          <ProtectedRoute requiredRole="caregiver">
            <CaregiverLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CaregiverDashboard />} />
        <Route path="patients" element={<CaregiverPatientsList />} />
        <Route path="alerts" element={<CaregiverAlerts />} />
        <Route path="reports" element={<CaregiverReports />} />
        <Route path="profile" element={<CaregiverProfile />} />
        <Route path="notifications" element={<CaregiverNotifications />} />
      </Route>

      {/* Default Caregiver Redirect */}
      <Route path="/caregiver" element={<Navigate to="/caregiver/dashboard" replace />} />

      {/* Admin Nested Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Default Admin Redirect */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
