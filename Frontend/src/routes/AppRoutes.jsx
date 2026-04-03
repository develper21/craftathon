import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import VerifyEmail from '../pages/VerifyEmail'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import PatientDashboard from '../pages/PatientDashboard'
import AddMedication from '../pages/AddMedication'
import Schedule from '../pages/Schedule'
import Adherence from '../pages/Adherence'
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

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="text-gray-600">Loading...</div></div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />
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
        path="/add-medication"
        element={
          <ProtectedRoute requiredRole="patient">
            <AddMedication />
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
          <ProtectedRoute requiredRole="doctor">
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
