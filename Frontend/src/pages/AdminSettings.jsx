import { useState } from 'react'
import { Bell, Mail, Lock, Database, Shield, Eye, Save } from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReport: true,
    systemAlerts: true,
    maintenanceMode: false,
    twoFactorAuth: true,
    dataBackup: true,
    autoLogout: true,
    anonymizeData: false
  })

  const [saved, setSaved] = useState(false)

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const ToggleSwitch = ({ value, onChange }) => (
    <button
      onClick={onChange}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition ${
        value ? 'bg-[#6366F1]' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white transition ${
          value ? 'translate-x-9' : 'translate-x-1'
        }`}
      />
    </button>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage system configuration and preferences</p>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-600">
            <Save size={16} />
          </div>
          <p className="text-green-700 font-medium">Settings saved successfully</p>
        </div>
      )}

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <Bell size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600 mt-1">Receive alerts and updates via email</p>
            </div>
            <ToggleSwitch
              value={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600 mt-1">Get critical alerts via SMS</p>
            </div>
            <ToggleSwitch
              value={settings.smsNotifications}
              onChange={() => handleToggle('smsNotifications')}
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600 mt-1">Receive push notifications in browser</p>
            </div>
            <ToggleSwitch
              value={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-gray-900">Weekly Report</p>
              <p className="text-sm text-gray-600 mt-1">Send weekly system performance report</p>
            </div>
            <ToggleSwitch
              value={settings.weeklyReport}
              onChange={() => handleToggle('weeklyReport')}
            />
          </div>
        </div>
      </div>

      {/* Alert Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Mail size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Alert Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">System Alerts</p>
              <p className="text-sm text-gray-600 mt-1">Enable critical system and adherence alerts</p>
            </div>
            <ToggleSwitch
              value={settings.systemAlerts}
              onChange={() => handleToggle('systemAlerts')}
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-sm text-gray-600 mt-1">Put system in maintenance mode (users will see status page)</p>
            </div>
            <ToggleSwitch
              value={settings.maintenanceMode}
              onChange={() => handleToggle('maintenanceMode')}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Shield size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600 mt-1">Require 2FA for all admin accounts</p>
            </div>
            <ToggleSwitch
              value={settings.twoFactorAuth}
              onChange={() => handleToggle('twoFactorAuth')}
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Auto Logout</p>
              <p className="text-sm text-gray-600 mt-1">Auto logout users after 30 minutes of inactivity</p>
            </div>
            <ToggleSwitch
              value={settings.autoLogout}
              onChange={() => handleToggle('autoLogout')}
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-gray-900">Session Timeout</p>
              <p className="text-sm text-gray-600 mt-1">Currently set to 30 minutes</p>
            </div>
            <input
              type="text"
              value="30 min"
              readOnly
              className="px-3 py-2 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <Database size={20} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Data & Privacy</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Automatic Data Backup</p>
              <p className="text-sm text-gray-600 mt-1">Backup database daily at 2:00 AM</p>
            </div>
            <ToggleSwitch
              value={settings.dataBackup}
              onChange={() => handleToggle('dataBackup')}
            />
          </div>

          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium text-gray-900">Anonymize User Data</p>
              <p className="text-sm text-gray-600 mt-1">Remove personal identifiable information from old records</p>
            </div>
            <ToggleSwitch
              value={settings.anonymizeData}
              onChange={() => handleToggle('anonymizeData')}
            />
          </div>
        </div>
      </div>

      {/* Dangerous Actions */}
      <div className="bg-white rounded-xl p-6 border border-red-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 rounded-lg text-red-600">
            <Lock size={20} />
          </div>
          <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        </div>

        <div className="space-y-3">
          <button className="w-full px-4 py-3 border border-red-200 rounded-lg text-red-600 font-medium hover:bg-red-50 transition">
            Export System Logs
          </button>
          <button className="w-full px-4 py-3 border border-red-200 rounded-lg text-red-600 font-medium hover:bg-red-50 transition">
            Reset All User Sessions
          </button>
          <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition">
            Delete All Demo Data
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end sticky bottom-6">
        <button className="px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#6366F1] hover:bg-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  )
}
