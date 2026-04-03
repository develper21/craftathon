import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Signup from '../pages/Signup'
import PatientDashboard from '../pages/PatientDashboard'
import AddMedication from '../pages/AddMedication'
import Schedule from '../pages/Schedule'
import Adherence from '../pages/Adherence'
import Profile from '../pages/Profile'
import DoctorDashboard from '../pages/DoctorDashboard'
import PatientDetail from '../pages/PatientDetail'
import Alerts from '../pages/Alerts'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth()

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

      {/* Doctor Routes */}
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
