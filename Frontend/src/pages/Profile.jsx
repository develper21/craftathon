import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import Notification from '../components/Notification'
import { useState } from 'react'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notification, setNotification] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'patient'
  })

  const handleSave = () => {
    setNotification({
      message: 'Profile updated successfully!',
      type: 'success'
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    setNotification({
      message: 'Logged out successfully!',
      type: 'success'
    })
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card className="p-12 text-center mb-8">
          <div className="w-24 h-24 bg-primary-blue rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-5xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold text-primary-dark mb-2">
            {formData.name}
          </h1>
          <p className="text-gray-600 capitalize">
            {formData.role === 'doctor' ? 'Doctor / Caregiver' : 'Patient'}
          </p>
        </Card>

        {/* Profile Information */}
        <Card className="p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-primary-dark">Profile Information</h2>
            <Button
              variant={isEditing ? 'secondary' : 'primary'}
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="clay-input"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor / Caregiver</option>
                </select>
              </div>
              <Button variant="primary" onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="pb-6 border-b-2 border-gray-200">
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="text-lg font-semibold text-primary-dark">{formData.name}</p>
              </div>
              <div className="pb-6 border-b-2 border-gray-200">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-primary-dark">{formData.email}</p>
              </div>
              <div className="pb-6">
                <p className="text-sm text-gray-600">Role</p>
                <p className="text-lg font-semibold text-primary-dark capitalize">
                  {formData.role === 'doctor' ? 'Doctor / Caregiver' : 'Patient'}
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Account Settings */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-dark mb-6">Account Settings</h2>
          <div className="space-y-4">
            <Button variant="secondary" className="w-full text-left">
              🔔 Notification Preferences
            </Button>
            <Button variant="secondary" className="w-full text-left">
              🔐 Change Password
            </Button>
            <Button variant="secondary" className="w-full text-left">
              👥 Manage Caregivers
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 border-2 border-red-300 bg-red-50">
          <h2 className="text-2xl font-bold text-red-700 mb-6">Danger Zone</h2>
          <div className="space-y-4">
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              🚪 Logout
            </Button>
            <Button variant="secondary" className="w-full bg-red-600 hover:bg-red-700">
              🗑️ Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}
