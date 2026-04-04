import { useState, useEffect } from 'react'
import { Search, Eye, AlertCircle, Plus, Trash2, Mail, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Notification from '../components/Notification'

export default function CaregiverPatientsList() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [linkEmail, setLinkEmail] = useState('')
  const [notification, setNotification] = useState(null)
  const [isLinking, setIsLinking] = useState(false)

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients()
    const interval = setInterval(fetchPatients, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      console.log('[CAREGIVER_PATIENTS] Fetching patients...')
      const result = await api.getMyPatients()
      console.log('[CAREGIVER_PATIENTS] Result:', result)
      if (result.success) {
        const patientData = result.data?.patients || []
        console.log('[CAREGIVER_PATIENTS] Loaded patients:', patientData)
        setPatients(patientData)
      } else {
        console.error('[CAREGIVER_PATIENTS] API returned success=false:', result.message)
      }
    } catch (err) {
      console.error('[CAREGIVER_PATIENTS] Error fetching patients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkPatient = async (e) => {
    e.preventDefault()

    if (!linkEmail.trim()) {
      setNotification({ message: 'Please enter patient email', type: 'error' })
      return
    }

    setIsLinking(true)
    try {
      const result = await api.sendLinkRequest(linkEmail)
      if (result.success) {
        setNotification({ message: 'Link request sent! Waiting for patient approval.', type: 'success' })
        setLinkEmail('')
        setShowLinkForm(false)
        setTimeout(() => fetchPatients(), 1000)
      } else {
        setNotification({ message: result.message || 'Failed to link patient', type: 'error' })
      }
    } catch (err) {
      setNotification({ message: 'Error linking patient', type: 'error' })
    } finally {
      setIsLinking(false)
    }
  }

  const handleUnlinkPatient = async (patientId) => {
    if (!confirm('Are you sure you want to unlink this patient?')) return

    try {
      const result = await api.unlinkPatient(patientId)
      if (result.success) {
        setNotification({ message: 'Patient unlinked', type: 'success' })
        setPatients(patients.filter(p => p.linkId !== patientId))
      }
    } catch (err) {
      setNotification({ message: 'Error unlinking patient', type: 'error' })
    }
  }

  const getStatus = (adherence) => {
    if (adherence >= 85) return 'good'
    if (adherence >= 70) return 'warning'
    return 'critical'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return { bg: 'bg-green-50', text: 'text-green-700', badge: 'bg-green-100 text-green-700', label: 'Excellent' }
      case 'warning':
        return { bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', label: 'Good' }
      case 'critical':
        return { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: 'Needs Attention' }
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700', label: 'Unknown' }
    }
  }

  // Use all patients for display
  const filteredPatients = patients

  if (loading && patients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading patients...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        {/* Link Patient Form */}
        {showLinkForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Link New Patient</h3>
            <form onSubmit={handleLinkPatient} className="flex gap-3">
              <input
                type="email"
                placeholder="Enter patient email..."
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E6FA3]"
              />
              <button
                type="submit"
                disabled={isLinking}
                className="px-6 py-2 bg-[#3E6FA3] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {isLinking ? 'Sending...' : 'Send'}
              </button>
              <button
                type="button"
                onClick={() => setShowLinkForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowLinkForm(!showLinkForm)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3E6FA3] text-white rounded-lg font-semibold hover:opacity-90"
          >
            <Plus size={18} />
            Link Patient
          </button>
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-gray-900">{patients.length}</span>
          </div>
        </div>

        {/* Patients Display */}
        {patients.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Linked</h3>
            <p className="text-gray-600 mb-4">Send link requests to start monitoring patients</p>
            <button
              onClick={() => setShowLinkForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-[#3E6FA3] text-white rounded-lg font-semibold"
            >
              <Plus size={18} />
              Link First Patient
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Month</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Adherence</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => {
                  const status = getStatus(p.adherenceScore || 0)
                  const statusInfo = getStatusColor(status)
                  
                  // Get patient name with proper fallbacks
                  const patientName = p.patient?.firstName && p.patient?.lastName 
                    ? `${p.patient.firstName} ${p.patient.lastName}`
                    : p.patient?.firstName 
                      ? p.patient.firstName
                      : p.firstName && p.lastName 
                        ? `${p.firstName} ${p.lastName}`
                        : p.firstName 
                          ? p.firstName
                          : p.name 
                            ? p.name
                            : 'Unknown Patient'
                  
                  const patientEmail = p.patient?.email || p.email || 'N/A'
                  
                  return (
                    <tr key={p.linkId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{patientEmail}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {p.lastMonthTaken}/{p.lastMonthScheduled} doses
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                status === 'good' ? 'bg-green-500' : status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(p.adherenceScore || 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{Math.round(p.adherenceScore || 0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badge}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => navigate(`/caregiver/patient/${p.linkId}`)}
                            className="p-2 hover:bg-blue-50 rounded text-[#3E6FA3]"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleUnlinkPatient(p.linkId)}
                            className="p-2 hover:bg-red-50 rounded text-red-600"
                            title="Unlink"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

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
