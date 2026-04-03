import { useState } from 'react'
import { Mail, Phone, MapPin, Lock, Bell, LogOut, Trash2, Eye, EyeOff, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function CaregiverProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Dr. Sarah Anderson',
    email: user?.email || 'sarah.anderson@hospital.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    specialization: 'Internal Medicine',
    licenseNumber: 'MD-12345'
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyReport: true,
    criticalOnly: false
  })

  const [editingPassword, setEditingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (field) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const getInitial = (name) => name.charAt(0).toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#14B8A6] rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center font-bold text-2xl text-white flex-shrink-0">
            {getInitial(formData.fullName)}
          </div>
          
          {/* User Info */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">{formData.fullName}</h2>
            <p className="text-white/80 text-sm">Caregiver Member</p>
            <p className="text-white/70 text-xs mt-1">{formData.specialization}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
            isEditing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gradient-to-r from-[#1E3A5F] to-[#14B8A6] text-white hover:shadow-lg'
          }`}
        >
          {isEditing ? (
            <>
              <X size={20} />
              Cancel
            </>
          ) : (
            <>
              <Edit2 size={20} />
              Edit Profile
            </>
          )}
        </button>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                isEditing
                  ? 'border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:shadow-md'
                  : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mail size={16} className="text-[#14B8A6]" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Phone size={16} className="text-[#14B8A6]" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* Location and Specialization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[#14B8A6]" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={(e) => handleFormChange('specialization', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* License Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={(e) => handleFormChange('licenseNumber', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                isEditing
                  ? 'border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:shadow-md'
                  : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Save Button */}
          {isEditing && (
            <button className="w-full px-6 py-3 bg-[#14B8A6] text-white rounded-xl hover:bg-teal-700 text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
              <Save size={20} />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive notifications via email' },
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive critical alerts via SMS' },
            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Get weekly summary reports' },
            { key: 'criticalOnly', label: 'Critical Only', desc: 'Only show critical level alerts' }
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#14B8A6]" />
                <div>
                  <p className="font-semibold text-gray-900">{pref.label}</p>
                  <p className="text-sm text-gray-600">{pref.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationChange(pref.key)}
                className={`relative w-14 h-8 rounded-full transition ${
                  notifications[pref.key] ? 'bg-[#14B8A6]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
                    notifications[pref.key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h3>

        {!editingPassword ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-[#14B8A6]" />
                <div>
                  <p className="font-semibold text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPassword(true)}
                className="px-4 py-2 text-[#14B8A6] hover:bg-teal-50 rounded-lg font-semibold transition"
              >
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-[#14B8A6]" />
                <div>
                  <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Not enabled</p>
                </div>
              </div>
              <button className="px-4 py-2 text-[#14B8A6] hover:bg-teal-50 rounded-lg font-semibold transition">
                Enable
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Current Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.current}
                onChange={(e) => handlePasswordChange('current', e.target.value)}
                className="w-full px-5 py-3 rounded-xl border-2 border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => handlePasswordChange('new', e.target.value)}
                className="w-full px-5 py-3 rounded-xl border-2 border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  className="w-full px-5 py-3 rounded-xl border-2 border-[#14B8A6] bg-white focus:ring-2 focus:ring-[#14B8A6]/10 focus:outline-none"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-[#14B8A6] text-white rounded-xl hover:bg-teal-700 text-lg font-semibold transition-all flex items-center justify-center gap-2">
                <Save size={20} />
                Update Password
              </button>
              <button
                onClick={() => {
                  setEditingPassword(false)
                  setPasswordData({ current: '', new: '', confirm: '' })
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 text-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 bg-red-50 rounded-3xl shadow-md p-8 transition-all duration-300 max-w-4xl mx-auto">
        <h3 className="text-red-700 font-bold text-2xl mb-2">Danger Zone</h3>
        <p className="text-red-600 text-sm mb-8 font-medium">These actions cannot be undone. Please proceed with caution.</p>
        <div className="space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
          >
            <LogOut size={20} />
            Logout
          </button>
          <button className="w-full px-6 py-4 rounded-xl border-2 border-red-300 text-red-700 font-semibold hover:bg-red-100 transition-all duration-300 flex items-center justify-center gap-2 text-lg">
            <Trash2 size={20} />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
