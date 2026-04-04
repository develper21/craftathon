import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, AlertCircle, TrendingUp, Heart, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import Notification from '../components/Notification'

const statCardsTemplate = [
  { id: 1, label: 'Total Patients', icon: Users, color: 'bg-blue-50', iconColor: 'text-[#1E3A5F]' },
  { id: 2, label: 'Active Patients', icon: Heart, color: 'bg-teal-50', iconColor: 'text-[#14B8A6]' },
  { id: 3, label: 'Critical Alerts', icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-[#EF4444]' },
  { id: 4, label: 'Avg Adherence', icon: TrendingUp, color: 'bg-amber-50', iconColor: 'text-[#F59E0B]' }
]

export default function CaregiverDashboard() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [alerts, setAlerts] = useState([])
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    criticalAlerts: 0,
    avgAdherence: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [patientEmail, setPatientEmail] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  // Fetch caregiver data on mount
  useEffect(() => {
    fetchCaregiverData()
  }, [])

  const fetchCaregiverData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch patients and alerts in parallel
      const [patientsRes, alertsRes] = await Promise.all([
        api.getMyPatients().catch(() => ({ data: { patients: [] } })),
        api.getCaregiverAlerts().catch(() => ({ data: { alerts: [] } }))
      ])

      const patientsData = patientsRes.data?.patients || []
      const alertsData = alertsRes.data?.alerts || []

      setPatients(patientsData)
      setAlerts(alertsData)

      // Calculate stats
      const totalPatients = patientsData.length
      const activePatients = patientsData.filter(p => (p.adherenceScore || 0) > 0).length
      const criticalAlerts = alertsData.filter(a => !a.isRead && a.severity === 'critical').length
      const avgAdherence = totalPatients > 0 
        ? Math.round(patientsData.reduce((sum, p) => sum + (p.adherenceScore || 0), 0) / totalPatients)
        : 0

      setStats({
        totalPatients,
        activePatients,
        criticalAlerts,
        avgAdherence
      })
    } catch (err) {
      console.error('Error fetching caregiver data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkPatient = async (e) => {
    e.preventDefault()
    if (!patientEmail.trim()) return

    setLinkLoading(true)
    try {
      const result = await api.sendLinkRequest(patientEmail)
      if (result.success) {
        setNotification({ message: 'Link request sent successfully!', type: 'success' })
        setPatientEmail('')
        setShowLinkForm(false)
      } else {
        setNotification({ message: result.message || 'Failed to send link request', type: 'error' })
      }
    } catch (err) {
      setNotification({ message: err.message || 'Network error', type: 'error' })
    } finally {
      setLinkLoading(false)
    }
  }

  const handleMarkAlertRead = async (alertId) => {
    try {
      await api.markAlertRead(alertId)
      fetchCaregiverData()
    } catch (err) {
      console.error('Error marking alert as read:', err)
    }
  }

  const getAdherenceColor = (value) => {
    if (value >= 80) return 'bg-[#14B8A6]'
    if (value >= 60) return 'bg-[#F59E0B]'
    return 'bg-[#EF4444]'
  }

  const getStatusColor = (adherence) => {
    if (adherence >= 80) return 'text-[#14B8A6]'
    if (adherence >= 60) return 'text-[#F59E0B]'
    return 'text-[#EF4444]'
  }

  const statCards = statCardsTemplate.map(card => ({
    ...card,
    value: card.id === 1 ? stats.totalPatients.toString() :
           card.id === 2 ? stats.activePatients.toString() :
           card.id === 3 ? stats.criticalAlerts.toString() :
           `${stats.avgAdherence}%`
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
            <button onClick={fetchCaregiverData} className="ml-4 underline">Retry</button>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.firstName || 'Caregiver'}!</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your patients' medication adherence</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.id} className={`${stat.color} rounded-xl p-6 border border-gray-100`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-white rounded-lg ${stat.iconColor}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Link Patient Button */}
        <div className="flex justify-end">
          <button 
            onClick={() => setShowLinkForm(!showLinkForm)}
            className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#152a45] transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Link New Patient
          </button>
        </div>

        {/* Link Patient Form */}
        {showLinkForm && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Link New Patient</h3>
            <form onSubmit={handleLinkPatient} className="flex gap-3">
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="patient@example.com"
                required
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
              />
              <button
                type="submit"
                disabled={linkLoading}
                className="px-6 py-3 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0d9488] disabled:opacity-50"
              >
                {linkLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                type="button"
                onClick={() => setShowLinkForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Alerts */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Alerts</h2>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {alerts.filter(a => !a.isRead).length} new
                  </span>
                </div>
              </div>
              <div className="p-6">
                {alerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No alerts at this time</p>
                ) : (
                  <div className="space-y-4">
                    {alerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${alert.isRead ? 'bg-gray-50 border-gray-400' : 'bg-red-50 border-red-500'}`}>
                        <div className="flex items-start gap-3">
                          <AlertCircle size={20} className={alert.isRead ? 'text-gray-400' : 'text-red-500'} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{alert.patient?.firstName} {alert.patient?.lastName}</p>
                            <p className="text-sm text-gray-600 mt-1">{alert.message || 'Medication alert'}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!alert.isRead && (
                            <button
                              onClick={() => handleMarkAlertRead(alert.id)}
                              className="text-xs text-[#1E3A5F] hover:underline"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Patient Overview</h2>
              </div>
              <div className="p-6">
                {patients.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No patients linked yet</p>
                    <p className="text-gray-500 mb-6">Link a patient to start monitoring their medication adherence</p>
                    <button 
                      onClick={() => setShowLinkForm(true)}
                      className="px-6 py-3 bg-[#1E3A5F] text-white rounded-xl font-semibold hover:bg-[#152a45]"
                    >
                      Link Your First Patient
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patients.map((patient) => (
                      <div key={patient.linkId} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#1E3A5F] to-[#14B8A6] rounded-full flex items-center justify-center text-white font-bold">
                              {patient.patient?.firstName?.[0]}{patient.patient?.lastName?.[0]}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{patient.patient?.firstName} {patient.patient?.lastName}</h3>
                              <p className="text-sm text-gray-600">{patient.patient?.email}</p>
                            </div>
                          </div>
                          <div className={`text-2xl font-bold ${getStatusColor(patient.adherenceScore || 0)}`}>
                            {patient.adherenceScore || 0}%
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Adherence</span>
                            <span className="font-medium text-gray-900">{patient.adherenceScore || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getAdherenceColor(patient.adherenceScore || 0)}`}
                              style={{ width: `${patient.adherenceScore || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                          <Link 
                            to={`/caregiver/patient/${patient.linkId}`}
                            className="flex-1 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg font-medium text-center text-sm hover:bg-[#152a45] transition-colors"
                          >
                            View Details
                          </Link>
                          <Link 
                            to={`/caregiver/patient/${patient.linkId}/report`}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-center text-sm hover:bg-gray-200 transition-colors"
                          >
                            View Report
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
