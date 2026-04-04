import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { api } from '../services/api'
import Notification from '../components/Notification'

export default function CaregiverAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      if (!loading) setLoading(true)
      const result = await api.getCaregiverAlerts()
      if (result.success) {
        const alertsData = result.data?.alerts || []
        setAlerts(alertsData.map(a => ({
          id: a.id,
          alertId: a.id,
          patientName: a.patient?.firstName && a.patient?.lastName ? `${a.patient.firstName} ${a.patient.lastName}` : 'Unknown',
          patientEmail: a.patient?.email,
          medication: a.medicationName || 'Unknown',
          reason: a.reason || 'Missed dose',
          type: 'MISSED_DOSE',
          severity: 'critical',
          createdAt: a.createdAt,
          status: a.status || 'UNREAD'
        })))
      }
    } catch (err) {
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (alertId) => {
    try {
      const result = await api.markAlertRead(alertId)
      if (result.success) {
        setAlerts(alerts.map(a => a.alertId === alertId ? { ...a, status: 'READ' } : a))
        setNotification({ message: 'Alert marked as read', type: 'success' })
      }
    } catch (err) {
      setNotification({ message: 'Error updating alert', type: 'error' })
    }
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now - date) / 1000)
    
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading alerts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Notification */}
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Unread</div>
            <div className="text-3xl font-bold text-red-600">{alerts.filter(a => a.status === 'UNREAD').length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Read</div>
            <div className="text-3xl font-bold text-green-600">{alerts.filter(a => a.status === 'READ').length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-900">{alerts.length}</div>
          </div>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <CheckCircle size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">No alerts</p>
            <p className="text-gray-500 text-sm">All patients are on track</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.alertId} className={`border rounded-lg p-4 flex justify-between items-start ${
                alert.status === 'UNREAD' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{alert.patientName}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      alert.status === 'UNREAD' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {alert.status === 'UNREAD' ? 'Unread' : 'Read'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">{alert.medication}</span> - {alert.reason}
                  </p>
                  <p className="text-xs text-gray-500">{alert.patientEmail}</p>
                  <p className="text-xs text-gray-500 mt-1">{getTimeAgo(alert.createdAt)}</p>
                </div>
                {alert.status === 'UNREAD' && (
                  <button
                    onClick={() => handleMarkAsRead(alert.alertId)}
                    className="ml-4 px-4 py-2 text-sm font-semibold text-white bg-[#3E6FA3] rounded hover:opacity-90"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
