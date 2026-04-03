import { useState } from 'react'
import { Mail, Phone, MapPin, Lock, Bell, LogOut, Trash2, Eye, EyeOff, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminProfile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.name || 'Administrator',
    email: user?.email || 'admin@example.com',
    phone: '+1 (555) 123-4567',
    location: 'System Administration',
    department: 'System Administration'
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    weeklyReport: true,
    criticalOnly: true
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
      <div className="bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-xl shadow-md p-6 text-white hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center font-bold text-2xl text-white flex-shrink-0">
            {getInitial(formData.fullName)}
          </div>
          
          {/* User Info */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">{formData.fullName}</h2>
            <p className="text-white/80 text-sm">Administrator</p>
            <p className="text-white/70 text-xs mt-1">{formData.department}</p>
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
              : 'bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white hover:shadow-lg'
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
              value={formData.fullName}
              onChange={(e) => handleFormChange('fullName', e.target.value)}
              disabled={!isEditing}
              className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                isEditing
                  ? 'border-[#6366F1] bg-white focus:ring-2 focus:ring-[#6366F1]/10 focus:shadow-md'
                  : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Mail size={16} className="text-[#6366F1]" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#6366F1] bg-white focus:ring-2 focus:ring-[#6366F1]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Phone size={16} className="text-[#6366F1]" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#6366F1] bg-white focus:ring-2 focus:ring-[#6366F1]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* Location and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-[#6366F1]" />
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#6366F1] bg-white focus:ring-2 focus:ring-[#6366F1]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleFormChange('department', e.target.value)}
                disabled={!isEditing}
                className={`w-full px-5 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
                  isEditing
                    ? 'border-[#6366F1] bg-white focus:ring-2 focus:ring-[#6366F1]/10 focus:shadow-md'
                    : 'border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <button className="w-full px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-indigo-700 text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2">
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
            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive system alerts via email' },
            { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Receive critical alerts via SMS' },
            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Get weekly summary reports' },
            { key: 'criticalOnly', label: 'Critical Only', desc: 'Only show critical level alerts' }
          ].map((pref) => (
            <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-[#6366F1]" />
                <div>
                  <p className="font-semibold text-gray-900">{pref.label}</p>
                  <p className="text-sm text-gray-600">{pref.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationChange(pref.key)}
                className={`relative w-14 h-8 rounded-full transition ${
                  notifications[pref.key] ? 'bg-[#6366F1]' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
                    notifications[pref.key] ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-8 transition-all duration-300">
        <h3 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h3>

        {!editingPassword ? (
          <button
            onClick={() => setEditingPassword(true)}
            className="px-6 py-3 bg-[#6366F1] hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
          >
            <Lock size={18} />
            Change Password
          </button>
        ) : (
          <div className="space-y-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1]"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.new}
                onChange={(e) => handlePasswordChange('new', e.target.value)}
                placeholder="Enter new password"
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1]"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirm}
                onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]/10 focus:border-[#6366F1]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditingPassword(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingPassword(false)}
                className="flex-1 px-4 py-3 bg-[#6366F1] hover:bg-indigo-700 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-3xl shadow-md border border-red-200 p-8 transition-all duration-300">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-red-100 rounded-lg text-red-600">
            <Trash2 size={24} />
          </div>
          <h3 className="text-2xl font-bold text-red-600">Danger Zone</h3>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut size={18} />
            Logout
          </button>
          <button className="w-full px-6 py-3 border-2 border-red-300 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition">
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  )
}
