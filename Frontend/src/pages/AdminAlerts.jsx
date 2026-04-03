import { useState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminAlerts() {
  const [severityFilter, setSeverityFilter] = useState('all')

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      patient: 'John Doe',
      issue: 'Missed dose - Aspirin',
      severity: 'high',
      time: '2 minutes ago',
      status: 'unresolved'
    },
    {
      id: 2,
      patient: 'Emma Johnson',
      issue: 'Low adherence this week',
      severity: 'medium',
      time: '15 minutes ago',
      status: 'unresolved'
    },
    {
      id: 3,
      patient: 'Robert Wilson',
      issue: 'Critical adherence drop',
      severity: 'high',
      time: '1 hour ago',
      status: 'unresolved'
    },
    {
      id: 4,
      patient: 'Michael Brown',
      issue: 'Missed check-in',
      severity: 'medium',
      time: '2 hours ago',
      status: 'unresolved'
    },
    {
      id: 5,
      patient: 'Sarah Smith',
      issue: 'Dose adjustment needed',
      severity: 'low',
      time: '3 hours ago',
      status: 'resolved'
    },
    {
      id: 6,
      patient: 'Lisa Anderson',
      issue: 'Appointment reminder',
      severity: 'low',
      time: '5 hours ago',
      status: 'resolved'
    }
  ])

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter === 'all') return true
    return alert.severity === severityFilter
  })

  const unresolvedCount = alerts.filter(a => a.status === 'unresolved').length
  const highSeverityCount = alerts.filter(a => a.severity === 'high' && a.status === 'unresolved').length

  const handleResolve = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, status: 'resolved' } : alert
    ))
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-100'
      case 'medium':
        return 'bg-yellow-50 border-yellow-100'
      case 'low':
        return 'bg-blue-50 border-blue-100'
      default:
        return 'bg-gray-50 border-gray-100'
    }
  }

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-[#EF4444] text-white'
      case 'medium':
        return 'bg-[#F59E0B] text-white'
      case 'low':
        return 'bg-[#3B82F6] text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alerts Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage system alerts</p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unresolved Alerts</p>
              <p className="text-3xl font-bold text-[#EF4444] mt-2">{unresolvedCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-[#EF4444]">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-3xl font-bold text-[#EF4444] mt-2">{highSeverityCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-[#EF4444]">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts (30d)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{alerts.length}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex gap-2">
        {['all', 'high', 'medium', 'low'].map((severity) => (
          <button
            key={severity}
            onClick={() => setSeverityFilter(severity)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              severityFilter === severity
                ? 'bg-[#6366F1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {severity === 'all' ? 'All Alerts' : severity === 'high' ? 'High' : severity === 'medium' ? 'Medium' : 'Low'}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`rounded-xl p-6 border-2 transition ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{alert.patient}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity === 'high' ? 'Critical' : alert.severity === 'medium' ? 'Warning' : 'Info'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    alert.status === 'resolved' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {alert.status === 'resolved' ? 'Resolved' : 'Unresolved'}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{alert.issue}</p>
                <p className="text-sm text-gray-600">{alert.time}</p>
              </div>
              {alert.status === 'unresolved' && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-4 py-2 bg-[#22C55E] hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center gap-2 flex-shrink-0"
                >
                  <CheckCircle size={16} />
                  Resolve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <CheckCircle className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-600 font-medium">No alerts found</p>
          <p className="text-gray-500 text-sm mt-1">All alerts have been resolved</p>
        </div>
      )}
    </div>
  )
}
