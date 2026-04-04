import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, Clock, Calendar, Trash2, Save } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { api } from '../services/api'
import Notification from '../components/Notification'

export default function EditMedication() {
  const { medicationId } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    unit: 'mg',
    frequency: 'daily',
    selectedDays: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
    times: ['09:00'],
    startDate: '',
    endDate: '',
    instructions: ''
  })
  const [errors, setErrors] = useState({})

  // Fetch medication on mount
  useEffect(() => {
    if (medicationId) {
      fetchMedication()
    }
  }, [medicationId])

  const fetchMedication = async () => {
    try {
      setIsLoading(true)
      const result = await api.getMedication(medicationId)
      
      if (result.success && result.data?.medication) {
        const med = result.data.medication
        const dayMap = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 0: 'sun' }
        const selectedDays = { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false }
        
        if (med.customDays) {
          med.customDays.forEach(dayIndex => {
            const dayName = dayMap[dayIndex]
            if (dayName) selectedDays[dayName] = true
          })
        }

        setFormData({
          name: med.name || '',
          dosage: med.dosage || '',
          unit: med.unit || 'mg',
          frequency: med.frequency?.toLowerCase() || 'daily',
          selectedDays,
          times: med.times || ['09:00'],
          startDate: med.startDate?.split('T')[0] || '',
          endDate: med.endDate?.split('T')[0] || '',
          instructions: med.instructions || ''
        })
      } else {
        setNotification({ message: 'Failed to load medication', type: 'error' })
      }
    } catch (err) {
      console.error('Error fetching medication:', err)
      setNotification({ message: 'Network error', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDayChange = (day) => {
    setFormData({ ...formData, selectedDays: { ...formData.selectedDays, [day]: !formData.selectedDays[day] } })
  }

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times]
    newTimes[index] = value
    setFormData({ ...formData, times: newTimes })
  }

  const addTimeSlot = () => {
    setFormData({ ...formData, times: [...formData.times, '09:00'] })
  }

  const removeTimeSlot = (index) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index)
      setFormData({ ...formData, times: newTimes })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Medicine name required'
    if (!formData.dosage.trim()) newErrors.dosage = 'Dosage required'
    if (formData.frequency === 'weekly' && !Object.values(formData.selectedDays).some(v => v)) {
      newErrors.days = 'Select at least one day'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const dayMap = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 }
      const selectedDays = Object.entries(formData.selectedDays)
        .filter(([_, selected]) => selected)
        .map(([day]) => dayMap[day])

      const medicationData = {
        name: formData.name,
        dosage: formData.dosage,
        unit: formData.unit,
        frequency: formData.frequency.toUpperCase(),
        times: formData.times,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || null,
        instructions: formData.instructions,
        customDays: formData.frequency === 'weekly' ? selectedDays : []
      }

      const result = await api.updateMedication(medicationId, medicationData)
      
      if (result.success) {
        setNotification({ message: 'Medication updated successfully!', type: 'success' })
        setTimeout(() => navigate('/schedule'), 1500)
      } else {
        setNotification({ message: result.message || 'Failed to update medication', type: 'error' })
      }
    } catch (error) {
      console.error('Error updating medication:', error)
      setNotification({ message: 'Network error. Please try again.', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this medication? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await api.deleteMedication(medicationId)
      
      if (result.success) {
        setNotification({ message: 'Medication deleted successfully!', type: 'success' })
        setTimeout(() => navigate('/schedule'), 1500)
      } else {
        setNotification({ message: result.message || 'Failed to delete medication', type: 'error' })
      }
    } catch (error) {
      console.error('Error deleting medication:', error)
      setNotification({ message: 'Network error. Please try again.', type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout pageTitle="Edit Medication" pageSubtitle="Update medication details">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#2F5B8C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Edit Medication" pageSubtitle="Update medication details">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2F5B8C] via-[#3E6FA3] to-[#22C55E] px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Edit Medication</h2>
                  <p className="text-blue-100 text-sm">Update medication details</p>
                </div>
              </div>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Aspirin"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                      errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#3E6FA3]'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage *</label>
                    <input 
                      type="text" 
                      name="dosage" 
                      value={formData.dosage} 
                      onChange={handleInputChange} 
                      placeholder="e.g., 500"
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${
                        errors.dosage ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#3E6FA3]'
                      }`}
                    />
                    {errors.dosage && <p className="text-red-500 text-sm mt-2">{errors.dosage}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3E6FA3]"
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="tablet">tablet(s)</option>
                      <option value="capsule">capsule(s)</option>
                      <option value="drop">drop(s)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Schedule</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Frequency</label>
                  <div className="flex gap-4">
                    {['daily', 'weekly'].map((option) => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border-2 transition-all"
                        style={{
                          borderColor: formData.frequency === option ? '#3E6FA3' : '#e5e7eb',
                          backgroundColor: formData.frequency === option ? '#f0f4f9' : 'white'
                        }}>
                        <input 
                          type="radio" 
                          name="frequency" 
                          value={option} 
                          checked={formData.frequency === option} 
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-[#3E6FA3]" 
                        />
                        <span className="text-gray-700 font-medium capitalize">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Select Days *</label>
                    <div className="flex flex-wrap gap-3">
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day, idx) => (
                        <button 
                          key={day} 
                          type="button" 
                          onClick={() => handleDayChange(day)}
                          className={`w-12 h-12 rounded-lg font-semibold text-sm transition-all ${
                            formData.selectedDays[day] 
                              ? 'bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                        >
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                        </button>
                      ))}
                    </div>
                    {errors.days && <p className="text-red-500 text-sm mt-3">{errors.days}</p>}
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-[#3E6FA3]" />
                    Medicine Times
                  </label>
                  <div className="space-y-3">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex gap-3">
                        <input 
                          type="time" 
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3E6FA3]"
                        />
                        {formData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(index)}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTimeSlot}
                      className="text-sm text-[#3E6FA3] hover:underline font-medium"
                    >
                      + Add another time
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar size={18} className="text-[#3E6FA3]" />
                Treatment Period
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3E6FA3]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={formData.endDate} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3E6FA3]"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Instructions</h3>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows="3"
                placeholder="e.g., Take with food, Avoid alcohol..."
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-[#3E6FA3] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-8 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white font-semibold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/schedule')} 
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft size={20} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
