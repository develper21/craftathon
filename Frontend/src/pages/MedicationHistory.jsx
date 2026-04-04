import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function MedicationHistory() {
  const { user } = useAuth()
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, taken, missed, pending, skipped
  const [actioningDoseId, setActioningDoseId] = useState(null) // Track which dose is being processed

  useEffect(() => {
    fetchMedicationHistory()
  }, [])

  const fetchMedicationHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all doses (pending included history and future)
      const [pendingRes, historyRes] = await Promise.all([
        api.getPendingDoses().catch(() => ({ data: { pending: [] } })),
        api.getDoseHistory({ limit: 100, page: 1 }).catch(() => ({ data: { logs: [] } }))
      ])

      // Combine pending doses and history logs
      const pendingDoses = (pendingRes.data?.pending || []).map(dose => ({
        id: dose.id,
        medicationId: dose.medication?.id,
        medicationName: dose.medication?.name,
        dosage: dose.medication?.dosage,
        scheduledAt: new Date(dose.scheduledAt),
        status: dose.status?.toLowerCase() || 'pending',
        takenAt: dose.doseLog?.takenAt ? new Date(dose.doseLog.takenAt) : null,
        notes: dose.doseLog?.notes,
        type: 'pending'
      }))

      const historyDoses = (historyRes.data?.logs || []).map(log => ({
        id: log.id,
        medicationId: log.medicationId,
        medicationName: log.medication?.name,
        dosage: log.medication?.dosage,
        scheduledAt: log.takenAt ? new Date(log.takenAt) : null,
        status: log.status?.toLowerCase() || 'unknown',
        takenAt: log.takenAt ? new Date(log.takenAt) : null,
        notes: log.notes,
        type: 'history'
      }))

      // Combine and sort by date (newest first)
      let allMeds = [...pendingDoses, ...historyDoses]
      allMeds = allMeds.sort((a, b) => {
        const timeA = a.scheduledAt || new Date(0)
        const timeB = b.scheduledAt || new Date(0)
        return timeB - timeA
      })

      setMedications(allMeds)
    } catch (err) {
      console.error('[HISTORY] Error fetching medication history:', err)
      setError('Failed to load medication history')
    } finally {
      setLoading(false)
    }
  }

  // Filter medications based on selected filter
  const filteredMeds = medications.filter(med => {
    if (filter === 'all') return true
    return med.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return 'bg-green-100 text-green-800 border-green-300'
      case 'missed': return 'bg-red-100 text-red-800 border-red-300'
      case 'skipped': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'late': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-300'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'taken': return '✓ Taken'
      case 'missed': return '✕ Missed'
      case 'skipped': return '⊘ Skipped'
      case 'late': return '⚠ Taken Late'
      case 'pending': return 'Pending'
      default: return status?.charAt(0).toUpperCase() + status?.slice(1)
    }
  }

  const formatDateTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeStatus = (scheduledAt, takenAt, status) => {
    if (!scheduledAt) return ''
    if (status === 'pending') return 'Upcoming'
    if (status === 'taken' && takenAt) {
      const scheduledTime = new Date(scheduledAt)
      const actualTime = new Date(takenAt)
      const diffMin = Math.floor((actualTime - scheduledTime) / 60000)
      if (diffMin <= 15) return `On time`
      return `${diffMin} min late`
    }
    return ''
  }

  const handleTakeMedication = async (doseId, medName, dosage) => {
    try {
      setActioningDoseId(doseId)
      console.log(`[HISTORY] Taking medication - doseId: ${doseId}, medicine: ${medName}`)

      const result = await api.logDose({ doseScheduleId: doseId })
      console.log('[HISTORY] Dose logged successfully:', result)

      // Optimistic update - update status immediately
      setMedications(prevMeds =>
        prevMeds.map(med =>
          med.id === doseId
            ? { ...med, status: 'taken', takenAt: new Date() }
            : med
        )
      )

      setError(null)
    } catch (err) {
      console.error('[HISTORY] Error taking medication:', err)
      setError(err.message || 'Failed to take medication')
    } finally {
      setActioningDoseId(null)
    }
  }

  const handleSkipMedication = async (doseId, medName, dosage) => {
    try {
      setActioningDoseId(doseId)
      console.log(`[HISTORY] Skipping medication - doseId: ${doseId}, medicine: ${medName}`)

      const result = await api.skipDose({ doseScheduleId: doseId })
      console.log('[HISTORY] Dose skipped successfully:', result)

      // Optimistic update - update status immediately
      setMedications(prevMeds =>
        prevMeds.map(med =>
          med.id === doseId
            ? { ...med, status: 'skipped', takenAt: new Date() }
            : med
        )
      )

      setError(null)
    } catch (err) {
      console.error('[HISTORY] Error skipping medication:', err)
      setError(err.message || 'Failed to skip medication')
    } finally {
      setActioningDoseId(null)
    }
  }

  if (loading) {
    return (
      <DashboardLayout pageTitle="Medication History" pageSubtitle="View all your medication records">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#2F5B8C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Medication History" pageSubtitle="View all your medication records and adherence">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
          <button onClick={fetchMedicationHistory} className="ml-4 underline">Retry</button>
        </div>
      )}

      {/* Back Button & Title */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-[#2F5B8C] hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Complete Medication History</h1>
        <div></div>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        {['all', 'pending', 'taken', 'missed', 'skipped', 'late'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-[#2F5B8C] text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status === 'all' ? 'All Medications' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{medications.filter(m => m.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Taken</p>
          <p className="text-2xl font-bold text-green-600">{medications.filter(m => m.status === 'taken').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium">Missed</p>
          <p className="text-2xl font-bold text-red-600">{medications.filter(m => m.status === 'missed').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-500">
          <p className="text-gray-600 text-sm font-medium">Skipped</p>
          <p className="text-2xl font-bold text-gray-600">{medications.filter(m => m.status === 'skipped').length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-medium">Late</p>
          <p className="text-2xl font-bold text-orange-600">{medications.filter(m => m.status === 'late').length}</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {filteredMeds.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No medications found</p>
            <p className="text-sm">Try selecting a different filter or add a medication</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Medicine Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Dosage</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Scheduled</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Taken At</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Timing</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Notes</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeds.map((med, idx) => (
                  <tr key={med.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{med.medicationName}</td>
                    <td className="px-6 py-4 text-gray-600">{med.dosage || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(med.scheduledAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{med.takenAt ? formatDateTime(med.takenAt) : '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(med.status)}`}>
                        {getStatusLabel(med.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getTimeStatus(med.scheduledAt, med.takenAt, med.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{med.notes || '—'}</td>
                    <td className="px-6 py-4">
                      {med.status === 'pending' ? (
                        <>
                          {actioningDoseId === med.id ? (
                            // Show loading spinner while processing
                            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold">
                              <div className="w-5 h-5 border-3 border-gray-400 border-t-[#22C55E] rounded-full animate-spin"></div>
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col gap-3">
                              <button
                                onClick={() => handleTakeMedication(med.id, med.medicationName, med.dosage)}
                                className="px-6 py-3 text-sm font-bold rounded-xl bg-[#22C55E] text-white hover:bg-[#1ea852] hover:shadow-lg active:scale-95 transition-all duration-200 whitespace-nowrap"
                              >
                                ✓ Take Now
                              </button>
                              <button
                                onClick={() => handleSkipMedication(med.id, med.medicationName, med.dosage)}
                                className="px-6 py-3 text-sm font-bold rounded-xl bg-gray-400 text-white hover:bg-gray-500 hover:shadow-lg active:scale-95 transition-all duration-200 whitespace-nowrap"
                              >
                                ⊘ Skip
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Count */}
      <div className="mt-6 text-center text-gray-600">
        <p className="text-sm">Showing {filteredMeds.length} of {medications.length} medications</p>
      </div>
    </DashboardLayout>
  )
}
