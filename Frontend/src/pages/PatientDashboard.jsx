import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import CircleProgress from '../components/CircleProgress'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { usePushNotifications } from '../utils/pushNotifications'
import { CheckCircle, XCircle, UserPlus } from 'lucide-react'
import Notification from '../components/Notification'

export default function PatientDashboard() {
  const { user } = useAuth()
  const { requestPermission, showReminder } = usePushNotifications()
  const [medications, setMedications] = useState([])
  const [adherenceData, setAdherenceData] = useState(null)
  const [streakData, setStreakData] = useState(null)
  const [pendingLinkRequests, setPendingLinkRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [actioningDoseId, setActioningDoseId] = useState(null) // Track which dose is being processed
  const [actioningLinkId, setActioningLinkId] = useState(null) // Track which link request is being processed

  // Fetch dashboard data on mount and auto-refresh every 10 seconds ONLY
  useEffect(() => {
    // Initial load
    fetchDashboardDataInternal()
    
    // Auto-refresh every exactly 10 seconds
    const interval = setInterval(fetchDashboardDataInternal, 10000)
    
    return () => clearInterval(interval)
  }, [])

  // Request push notification permission - only after user interaction
  const handleEnableNotifications = () => {
    requestPermission()
  }

  // Internal fetch - doesn't show loading spinner for auto-refresh
  const fetchDashboardDataInternal = async () => {
    try {
      // Fetch pending doses, adherence, streak, and link requests in parallel
      const [pendingRes, adherenceRes, streakRes, linkRes] = await Promise.all([
        api.getPendingDoses().catch(err => {
          console.error('[DASHBOARD] Error fetching pending doses:', err)
          return { data: { pending: [] } }
        }),
        api.getAdherenceScore(7).catch(err => {
          console.error('[DASHBOARD] Error fetching adherence score:', err)
          return { data: { adherenceScore: 0 } }
        }),
        api.getStreak().catch(err => {
          console.error('[DASHBOARD] Error fetching streak:', err)
          return { data: { currentStreak: 0, longestStreak: 0 } }
        }),
        api.getPendingLinkRequests().catch(err => {
          console.error('[DASHBOARD] Error fetching link requests:', err)
          return { success: false, data: { requests: [] } }
        })
      ])

      const today = new Date()
      const now = new Date()

      console.log(`[DASHBOARD] Fetched ${pendingRes.data?.pending?.length || 0} pending doses`)
      console.log(`[DASHBOARD] Fetched ${linkRes.data?.requests?.length || 0} pending link requests`)
      setAdherenceData(adherenceRes.data)
      setStreakData(streakRes.data)
      setPendingLinkRequests(linkRes.data?.requests || [])
      
      // Transform doses - only include medications that haven't passed yet today
      let meds = (pendingRes.data?.pending || []).map(dose => ({
        id: dose.id,
        medicationId: dose.medication?.id,
        name: dose.medication?.name || 'Unknown',
        dosage: dose.medication?.dosage || '',
        scheduledAt: new Date(dose.scheduledAt),
        time: new Date(dose.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: dose.status?.toLowerCase() || 'pending',
        isTaken: dose.status === 'TAKEN' || !!dose.doseLog,
        instructions: dose.medication?.instructions,
        color: dose.medication?.color,
      }))

      // Sort by time - upcoming first
      meds = meds.sort((a, b) => a.scheduledAt - b.scheduledAt)

      console.log(`[DASHBOARD] Filtered & sorted ${meds.length} medications for today`)
      setMedications(meds)
      setError(null)
    } catch (err) {
      console.error('[DASHBOARD] Error fetching dashboard data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Public fetch - used only for initial load (shows loading)
  const fetchDashboardData = async () => {
    setLoading(true)
    await fetchDashboardDataInternal()
  }

  const handleTakeMedication = async (doseId, medName, dosage) => {
    try {
      setActioningDoseId(doseId) // Show loading only for this item
      console.log(`[DASHBOARD] Taking medication - doseId: ${doseId}, medicine: ${medName}`)
      
      const result = await api.logDose({ doseScheduleId: doseId })
      console.log(`[DASHBOARD] Take result:`, result)
      
      // Update just this medication locally (optimistic update)
      setMedications(prevMeds => 
        prevMeds.map(med => 
          med.id === doseId 
            ? { ...med, status: 'taken', isTaken: true }
            : med
        )
      )
      
      // Auto-refresh will pick up changes in 10 seconds
    } catch (err) {
      console.error('[DASHBOARD] Error logging dose:', err)
      setError('Failed to log dose. Please try again.')
    } finally {
      setActioningDoseId(null)
    }
  }

  const handleSkipMedication = async (doseId, medName, dosage) => {
    try {
      setActioningDoseId(doseId) // Show loading only for this item
      console.log(`[DASHBOARD] Skipping medication - doseId: ${doseId}, medicine: ${medName}`)
      
      const result = await api.skipDose(doseId, 'User skipped')
      console.log(`[DASHBOARD] Skip result:`, result)
      
      // Update just this medication locally (optimistic update)
      setMedications(prevMeds => 
        prevMeds.map(med => 
          med.id === doseId 
            ? { ...med, status: 'skipped', isTaken: true }
            : med
        )
      )
      
      // Auto-refresh will pick up changes in 10 seconds
    } catch (err) {
      console.error('[DASHBOARD] Error skipping dose:', err)
      setError('Failed to skip dose. Please try again.')
    } finally {
      setActioningDoseId(null)
    }
  }

  const handleApproveLinkRequest = async (linkId, caregiverName) => {
    try {
      setActioningLinkId(linkId)
      console.log(`[DASHBOARD] Approving link request - linkId: ${linkId}`)
      
      const result = await api.respondToLinkRequest(linkId, true)
      
      if (result.success) {
        // Remove from pending list
        setPendingLinkRequests(prevRequests => 
          prevRequests.filter(req => req.id !== linkId)
        )
        setNotification({ 
          message: `✓ You've approved ${caregiverName} as your caregiver!`, 
          type: 'success' 
        })
      } else {
        setNotification({ 
          message: result.message || 'Failed to approve request', 
          type: 'error' 
        })
      }
    } catch (err) {
      console.error('[DASHBOARD] Error approving link request:', err)
      setNotification({ message: 'Error approving request. Please try again.', type: 'error' })
    } finally {
      setActioningLinkId(null)
    }
  }

  const handleRejectLinkRequest = async (linkId, caregiverName) => {
    try {
      setActioningLinkId(linkId)
      console.log(`[DASHBOARD] Rejecting link request - linkId: ${linkId}`)
      
      const result = await api.respondToLinkRequest(linkId, false)
      
      if (result.success) {
        // Remove from pending list
        setPendingLinkRequests(prevRequests => 
          prevRequests.filter(req => req.id !== linkId)
        )
        setNotification({ 
          message: `✗ You've rejected the request from ${caregiverName}`, 
          type: 'info' 
        })
      } else {
        setNotification({ 
          message: result.message || 'Failed to reject request', 
          type: 'error' 
        })
      }
    } catch (err) {
      console.error('[DASHBOARD] Error rejecting link request:', err)
      setNotification({ message: 'Error rejecting request. Please try again.', type: 'error' })
    } finally {
      setActioningLinkId(null)
    }
  }

  // Show push notification for pending medications
  const showMedicationReminder = (med) => {
    if (med.status === 'pending') {
      showReminder(med.name, med.dosage, med.time)
    }
  }

  // Calculate stats from real data
  const totalMeds = medications.length
  const takenCount = medications.filter(m => m.status === 'taken').length
  const adherenceRate = Math.round(adherenceData?.adherenceScore || 0)
  
  const morningMeds = medications.filter((m) => {
    const hour = m.scheduledAt?.getHours()
    return hour >= 5 && hour < 12
  })
  const afternoonMeds = medications.filter((m) => {
    const hour = m.scheduledAt?.getHours()
    return hour >= 12 && hour < 17
  })
  const nightMeds = medications.filter((m) => {
    const hour = m.scheduledAt?.getHours()
    return hour >= 17 || hour < 5
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'bg-green-100 text-green-800 border-green-300'
      case 'missed': return 'bg-red-100 text-red-800 border-red-300'
      case 'skipped': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'late': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    }
  }

  const getStatusLabel = (status) => status?.charAt(0).toUpperCase() + status?.slice(1)

  if (loading) {
    return (
      <DashboardLayout pageTitle="Dashboard" pageSubtitle="Loading your data...">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#2F5B8C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Dashboard" pageSubtitle="Track your medications and stay on top of your health">
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">Dismiss</button>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#2F5B8C] via-[#3E6FA3] to-[#22C55E] rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold mb-2">Hello, {user?.firstName || 'Patient'}</h2>
            <p className="text-blue-100 text-lg">Stay on track with your medications today</p>
          </div>
          <div className="hidden md:block"></div>
        </div>
      </div>

      {/* Pending Caregiver Link Requests */}
      {pendingLinkRequests.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus size={24} className="text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900">Caregiver Link Requests</h3>
          </div>
          <div className="space-y-3">
            {pendingLinkRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-semibold text-gray-900">
                    {request.caregiver?.firstName && request.caregiver?.lastName 
                      ? `${request.caregiver.firstName} ${request.caregiver.lastName}`
                      : 'Unknown Caregiver'}
                  </p>
                  <p className="text-sm text-gray-600">{request.caregiver?.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Wants to be your caregiver to monitor your medication adherence</p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  {actioningLinkId === request.id ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleApproveLinkRequest(request.id, request.caregiver?.firstName || 'Caregiver')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 active:scale-95 transition-all"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectLinkRequest(request.id, request.caregiver?.firstName || 'Caregiver')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#2F5B8C] hover:shadow-lg transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Today's Medications</p>
          <p className="text-3xl font-bold text-[#2F5B8C]">{totalMeds}</p>
          <p className="text-xs text-gray-500 mt-3">Scheduled for today</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#22C55E] hover:shadow-lg transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Taken Today</p>
          <p className="text-3xl font-bold text-[#22C55E]">{takenCount}</p>
          <p className="text-xs text-gray-500 mt-3">Out of {totalMeds}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Pending</p>
          <p className="text-3xl font-bold text-red-500">{medications.filter(m => m.status === 'pending').length}</p>
          <p className="text-xs text-gray-500 mt-3">Need attention</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#3E6FA3] hover:shadow-lg transition-shadow">
          <p className="text-gray-600 text-sm font-medium mb-2">Adherence Rate</p>
          <p className="text-3xl font-bold text-[#3E6FA3]">{adherenceRate}%</p>
          <p className="text-xs text-gray-500 mt-3">Last 7 days</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Medications */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#2F5B8C]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                </svg>
                Today's Medications
              </h3>
              <Link to="/add-medication" className="px-4 py-2 bg-[#2F5B8C] text-white rounded-lg text-sm font-medium hover:bg-[#264a73] transition-colors">
                + Add Medication
              </Link>
            </div>
            
            {medications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg mb-2">No medications scheduled for today</p>
                <Link to="/add-medication" className="text-[#2F5B8C] hover:underline">
                  Add your first medication
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show only top 4-5 upcoming medications */}
                {medications.slice(0, 5).map((med) => (
                  <div key={med.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#2F5B8C] hover:shadow-md hover:bg-blue-50/30 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{med.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{med.dosage} • {med.time}</p>
                        {med.instructions && <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(med.status)}`}>
                          {getStatusLabel(med.status)}
                        </span>
                        {med.status === 'pending' && (
                          <div className="flex gap-2">
                            {actioningDoseId === med.id ? (
                              // Show loading spinner while processing this specific medication
                              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-600">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-[#22C55E] rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Processing...</span>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => handleTakeMedication(med.id, med.name, med.dosage)} className="px-4 py-2 rounded-xl bg-[#22C55E] text-white font-semibold hover:bg-[#1ea852] hover:shadow-lg active:scale-95 text-sm transition-all duration-200">
                                  Take Now
                                </button>
                                <button onClick={() => handleSkipMedication(med.id, med.name, med.dosage)} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 active:scale-95 text-sm transition-all duration-200">
                                  Skip
                                </button>
                              </>
                            )}
                            <button onClick={() => showMedicationReminder(med)} className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm" title="Test notification">
                              🔔
                            </button>
                          </div>
                        )}
                        {med.status === 'taken' && <div className="text-[#22C55E] font-semibold text-sm">✓ Taken</div>}
                        {med.status === 'skipped' && <div className="text-gray-500 font-semibold text-sm">⊘ Skipped</div>}
                        {med.status === 'missed' && <div className="text-red-600 font-semibold text-sm">✕ Missed</div>}
                        {med.status === 'late' && <div className="text-orange-600 font-semibold text-sm">⚠ Taken Late</div>}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Show "View All History" button if there are more medications */}
                {medications.length > 5 && (
                  <div className="text-center mt-6 pt-4 border-t border-gray-200">
                    <Link 
                      to="/medication-history"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                    >
                      📋 View All Medication History ({medications.length} total)
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Weekly Adherence</h3>
            <div className="flex justify-center mb-4">
              <CircleProgress percentage={adherenceRate} size={120} />
            </div>
            <p className="text-sm text-gray-600">Keep up the great work!</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-6 border border-orange-200 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-orange-900 mb-2">{streakData?.currentStreak || 0} Day Streak</h3>
              <p className="text-sm text-orange-700 mb-4">Keep it going!</p>
              <div className="w-full bg-orange-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full" style={{ width: `${Math.min((streakData?.currentStreak || 0) / 30 * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-orange-600 mt-3 font-medium">Best: {streakData?.longestStreak || 0} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-[#2F5B8C]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          Today's Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-blue-100">Morning</h4>
            <div className="space-y-3">
              {morningMeds.length > 0 ? morningMeds.map((m) => (
                <div key={m.id}><p className="font-medium text-gray-900">{m.name}</p><p className="text-gray-600 text-sm">{m.time}</p></div>
              )) : <p className="text-sm text-gray-500">No medications</p>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-yellow-100">Afternoon</h4>
            <div className="space-y-3">
              {afternoonMeds.length > 0 ? afternoonMeds.map((m) => (
                <div key={m.id}><p className="font-medium text-gray-900">{m.name}</p><p className="text-gray-600 text-sm">{m.time}</p></div>
              )) : <p className="text-sm text-gray-500">No medications</p>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-indigo-100">Evening</h4>
            <div className="space-y-3">
              {nightMeds.length > 0 ? nightMeds.map((m) => (
                <div key={m.id}><p className="font-medium text-gray-900">{m.name}</p><p className="text-gray-600 text-sm">{m.time}</p></div>
              )) : <p className="text-sm text-gray-500">No medications</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
