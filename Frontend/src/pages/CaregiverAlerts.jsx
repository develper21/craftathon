import { useState } from 'react'
import { AlertCircle, Bell, CheckCircle, Clock } from 'lucide-react'

export default function CaregiverAlerts() {
  const [activeTab, setActiveTab] = useState('all')
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      patient: 'John Doe',
      medication: 'Aspirin',
      issue: 'Missed dose',
      severity: 'critical',
      time: '2 hours ago',
      status: 'new'
    },
    {
      id: 2,
      patient: 'Emma Johnson',
      medication: 'Lisinopril',
      issue: 'Low adherence this week',
      severity: 'warning',
      time: '4 hours ago',
      status: 'new'
    },
    {
      id: 3,
      patient: 'Robert Wilson',
      medication: 'Warfarin',
      issue: 'Missed dose',
      severity: 'critical',
      time: '6 hours ago',
      status: 'new'
    },
    {
      id: 4,
      patient: 'Michael Brown',
      medication: 'Albuterol',
      issue: 'Missed check-in',
      severity: 'warning',
      time: '8 hours ago',
      status: 'acknowledged'
    },
    {
      id: 5,
      patient: 'Sarah Smith',
      medication: 'Metformin',
      issue: 'Dose adjustment needed',
      severity: 'info',
      time: '12 hours ago',
      status: 'resolved'
    },
    {
      id: 6,
      patient: 'Lisa Anderson',
      medication: 'Levothyroxine',
      issue: 'Appointment reminder',
      severity: 'info',
      time: '1 day ago',
      status: 'resolved'
    }
  ])

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'all') return true
    return alert.status === 'new' || alert.status === 'acknowledged'
  })

  const handleAcknowledge = (id) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, status: 'acknowledged' } : alert)))
  }

  const handleResolve = (id) => {
    setAlerts(alerts.map((alert) => (alert.id === id ? { ...alert, status: 'resolved' } : alert)))
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length
  const warningCount = alerts.filter((a) => a.severity === 'warning' && a.status !== 'resolved').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <p className="text-gray-600 mt-2">Manage and respond to patient alerts</p>
      </div>

      {/* Alert Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-3xl font-bold text-[#EF4444] mt-2">{criticalCount}</p>
            </div>
            <div className="p-3 bg-white rounded-lg text-[#EF4444]">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-3xl font-bold text-[#F59E0B] mt-2">{warningCount}</p>
            </div>
            <div className="p-3 bg-white rounded-lg text-[#F59E0B]">
              <Bell size={24} />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts (30d)</p>
              <p className="text-3xl font-bold text-[#1E3A5F] mt-2">{alerts.length}</p>
            </div>
            <div className="p-3 bg-white rounded-lg text-[#1E3A5F]">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'all'
              ? 'border-[#14B8A6] text-[#14B8A6]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Alerts
        </button>
        <button
          onClick={() => setActiveTab('needs-action')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'needs-action'
              ? 'border-[#14B8A6] text-[#14B8A6]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Needs Action ({alerts.filter((a) => a.status === 'new' || a.status === 'acknowledged').length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-lg p-6 border transition ${
              alert.severity === 'critical'
                ? 'bg-red-50 border-red-100'
                : alert.severity === 'warning'
                ? 'bg-yellow-50 border-yellow-100'
                : 'bg-blue-50 border-blue-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{alert.patient}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      alert.severity === 'critical'
                        ? 'bg-[#EF4444] text-white'
                        : alert.severity === 'warning'
                        ? 'bg-[#F59E0B] text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {alert.severity === 'critical' ? 'Critical' : alert.severity === 'warning' ? 'Warning' : 'Info'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      alert.status === 'new'
                        ? 'bg-purple-100 text-purple-700'
                        : alert.status === 'acknowledged'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {alert.status === 'new' ? 'New' : alert.status === 'acknowledged' ? 'Acknowledged' : 'Resolved'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">{alert.medication}</span> — {alert.issue}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-2">
                  <Clock size={14} />
                  {alert.time}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {alert.status === 'new' && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Acknowledge
                  </button>
                )}
                {(alert.status === 'new' || alert.status === 'acknowledged') && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 rounded-lg bg-[#14B8A6] text-white hover:bg-teal-700 transition text-sm font-medium flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <CheckCircle className="mx-auto text-green-400 mb-3" size={40} />
          <p className="text-gray-600 font-medium">No alerts</p>
          <p className="text-gray-500 text-sm mt-1">All caught up! No alerts need action</p>
        </div>
      )}
    </div>
  )
}
