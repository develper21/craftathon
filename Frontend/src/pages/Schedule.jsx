import { useState, useEffect } from 'react'
import { Sun, Clock, Moon, AlertCircle, Trash2 } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import { api } from '../services/api'
import Notification from '../components/Notification'

export default function Schedule() {
  const navigate = useNavigate()
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: null, deleting: false })

  // Fetch medications on mount
  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await api.getMedications()
      
      if (result.success) {
        // Transform API data to schedule format
        const meds = result.data?.medications?.map(med => ({
          id: med.id,
          name: med.name,
          dosage: `${med.dosage}${med.unit || 'mg'}`,
          times: med.times || ['09:00'],
          frequency: med.frequency,
          customDays: med.customDays || [],
          startDate: med.startDate,
          endDate: med.endDate,
          instructions: med.instructions
        })) || []

        setMedications(meds)
      } else {
        setError(result.message || 'Failed to load medications')
      }
    } catch (err) {
      console.error('Error fetching medications:', err)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Helper to get day names from customDays array (0=Sunday, 6=Saturday)
  const getDayNames = (customDays) => {
    if (!customDays || customDays.length === 0) {
      // Default to all days for daily frequency
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return customDays.map(dayIndex => dayMap[dayIndex])
  }

  // Expand medications by time slots
  const expandMedicationsByTime = () => {
    const expanded = []
    medications.forEach(med => {
      if (med.times && med.times.length > 0) {
        med.times.forEach(time => {
          expanded.push({
            ...med,
            time,
            days: getDayNames(med.customDays)
          })
        })
      }
    })
    return expanded
  }

  const expandedMeds = expandMedicationsByTime()

  const getMedicationStyle = (time) => {
    const hour = parseInt(time?.split(':')[0] || 9)
    if (hour < 12) {
      return { gradient: 'from-blue-50 to-blue-100', border: 'border-blue-200' }
    }
    if (hour < 17) {
      return { gradient: 'from-amber-50 to-amber-100', border: 'border-amber-200' }
    }
    return { gradient: 'from-indigo-50 to-indigo-100', border: 'border-indigo-200' }
  }

  const getTimeBadgeStyle = (time) => {
    const hour = parseInt(time?.split(':')[0] || 9)
    if (hour < 12) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' }
    if (hour < 17) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' }
    return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-300' }
  }

  const handleDelete = (id, name) => {
    setDeleteModal({ show: true, id, name, deleting: false })
  }

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, deleting: true }))
    
    try {
      const result = await api.deleteMedication(deleteModal.id)
      if (result.success) {
        // Remove from state instead of refetching
        setMedications(prev => prev.filter(med => med.id !== deleteModal.id))
        setNotification({ message: `"${deleteModal.name}" deleted successfully`, type: 'success' })
        setDeleteModal({ show: false, id: null, name: null, deleting: false })
      } else {
        setNotification({ message: result.message || 'Failed to delete', type: 'error' })
        setDeleteModal(prev => ({ ...prev, deleting: false }))
      }
    } catch (err) {
      setNotification({ message: 'Network error', type: 'error' })
      setDeleteModal(prev => ({ ...prev, deleting: false }))
    }
  }

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, name: null, deleting: false })
  }

  const TimeSection = ({ title, icon: Icon, medications: meds, timeRange }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3]">
          <Icon className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500">{timeRange} • {meds.length} medications</p>
        </div>
      </div>
      
      {meds.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No medications scheduled for this time</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meds.map((med, idx) => {
            const style = getMedicationStyle(med.time)
            const badgeStyle = getTimeBadgeStyle(med.time)
            return (
              <div 
                key={`${med.id}-${idx}`} 
                className={`bg-gradient-to-br ${style.gradient} rounded-2xl shadow-sm hover:shadow-md border-2 ${style.border} p-6 transition-all duration-300 hover:scale-102 cursor-pointer`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-gray-900">{med.name}</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/edit-medication/${med.id}`)}
                          className="p-1.5 rounded-lg bg-white/50 hover:bg-white text-gray-600 hover:text-[#2F5B8C] transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button
                          onClick={() => handleDelete(med.id, med.name)}
                          className="p-1.5 rounded-lg bg-white/50 hover:bg-white text-gray-600 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{med.dosage}</p>
                    
                    {/* Day Pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {med.days?.map(day => (
                        <span 
                          key={day} 
                          className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 shadow-sm"
                        >
                          {day}
                        </span>
                      ))}
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-gray-500 mt-3 italic">{med.instructions}</p>
                    )}
                  </div>
                  
                  {/* Time Badge */}
                  <div className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm whitespace-nowrap ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                    {med.time}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout pageTitle="Medication Schedule" pageSubtitle="View your complete medication timetable">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#2F5B8C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Medication Schedule" pageSubtitle="View your complete medication timetable">
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
          <button onClick={fetchMedications} className="ml-4 underline">Retry</button>
        </div>
      )}

      {/* Add Medication Button */}
      <div className="flex justify-end mb-6">
        <Link 
          to="/add-medication"
          className="px-6 py-3 bg-[#2F5B8C] text-white rounded-xl font-semibold hover:bg-[#264a73] transition-colors flex items-center gap-2"
        >
          <span>+</span> Add Medication
        </Link>
      </div>

      <div className="space-y-12">
        {/* Morning Medications */}
        <TimeSection 
          title="Morning Doses" 
          icon={Sun}
          medications={expandedMeds.filter(m => parseInt(m.time?.split(':')[0]) < 12)}
          timeRange="6:00 AM - 12:00 PM"
        />

        {/* Afternoon Medications */}
        <TimeSection 
          title="Afternoon Doses" 
          icon={Clock}
          medications={expandedMeds.filter(m => {
            const hour = parseInt(m.time?.split(':')[0])
            return hour >= 12 && hour < 17
          })}
          timeRange="12:00 PM - 5:00 PM"
        />

        {/* Evening Medications */}
        <TimeSection 
          title="Evening Doses" 
          icon={Moon}
          medications={expandedMeds.filter(m => {
            const hour = parseInt(m.time?.split(':')[0])
            return hour >= 17
          })}
          timeRange="5:00 PM - 11:00 PM"
        />

        {/* Weekly Overview */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Weekly Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const dayCode = day.slice(0, 3)
              const dayMeds = expandedMeds.filter(m => m.days?.includes(dayCode))
              return (
                <div 
                  key={day} 
                  className="bg-gradient-to-b from-[#2F5B8C]/5 to-[#3E6FA3]/5 rounded-xl p-4 border-2 border-[#3E6FA3]/20 hover:shadow-md transition-all duration-200"
                >
                  <h4 className="font-bold text-gray-900 text-center mb-4">{day.slice(0, 3)}</h4>
                  <div className="space-y-2">
                    {dayMeds.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center">No meds</p>
                    ) : (
                      dayMeds.map((med, idx) => (
                        <div key={`${med.id}-${idx}`} className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                          <p className="font-semibold text-gray-900 text-xs line-clamp-1">{med.name}</p>
                          <p className="text-gray-600 text-xs mt-1">{med.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-center text-xl font-bold text-gray-900 mb-2">
              Delete Medication?
            </h3>

            {/* Message */}
            <p className="text-center text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteModal.name}"</span>? This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleteModal.deleting}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteModal.deleting}
                className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteModal.deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
