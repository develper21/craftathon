import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, Clock, Calendar, X } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import Notification from '../components/Notification'
import { api } from '../services/api'

export default function AddMedication() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState(null)
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }
  
  const [formData, setFormData] = useState({
    name: '', dosage: '', frequency: 'daily',
    selectedDays: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
    times: [], newTime: '09:00', prescriptionDate: getTodayDate(), startDate: getTodayDate(), endDate: ''
  })
  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDayChange = (day) => {
    setFormData({ ...formData, selectedDays: { ...formData.selectedDays, [day]: !formData.selectedDays[day] } })
  }

  const addTime = () => {
    if (!formData.newTime) {
      setErrors({ ...errors, newTime: 'Please select a time' })
      return
    }
    if (formData.times.includes(formData.newTime)) {
      setErrors({ ...errors, newTime: 'This time is already added' })
      return
    }
    const sortedTimes = [...formData.times, formData.newTime].sort()
    setFormData({ ...formData, times: sortedTimes, newTime: '09:00' })
    setErrors({ ...errors, newTime: '' })
  }

  const removeTime = (time) => {
    setFormData({ ...formData, times: formData.times.filter(t => t !== time) })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Medicine name required'
    if (!formData.dosage.trim()) newErrors.dosage = 'Dosage required'
    if (formData.times.length === 0) newErrors.times = 'Add at least one medicine time'
    if (formData.frequency === 'weekly' && !Object.values(formData.selectedDays).some(v => v)) {
      newErrors.days = 'Select at least one day'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setNotification(null)

    try {
      // Transform form data to API format
      const medicationData = {
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency.toUpperCase(),
        times: formData.times,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || null,
        instructions: '',
        unit: 'mg'
      }

      // Add custom days for weekly frequency
      if (formData.frequency === 'weekly') {
        const dayMap = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 0 }
        const selectedDays = Object.entries(formData.selectedDays)
          .filter(([_, selected]) => selected)
          .map(([day]) => dayMap[day])
        medicationData.customDays = selectedDays
      }

      const result = await api.createMedication(medicationData)
      
      if (result.success) {
        setNotification({ message: 'Medication added successfully!', type: 'success' })
        setTimeout(() => navigate('/dashboard'), 1500)
      } else {
        setNotification({ message: result.message || 'Failed to add medication', type: 'error' })
      }
    } catch (error) {
      console.error('Error adding medication:', error)
      setNotification({ message: error.message || 'Network error. Please try again.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout pageTitle="Add Medication" pageSubtitle="Register a new medication to your regimen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Form (2 columns) */}
          <div className="lg:col-span-2">
            {/* Premium Form Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#2F5B8C] via-[#3E6FA3] to-[#22C55E] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Plus className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">New Medication</h2>
                    <p className="text-blue-100 text-sm">Add to your daily regimen</p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4">Medication Details</h3>
              <div className="space-y-4">
                {/* Medicine Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Aspirin"
                    className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none text-sm ${
                      errors.name 
                        ? 'border-red-400 bg-red-50' 
                        : 'border-gray-300 bg-white hover:border-gray-400 focus:border-[#3E6FA3] focus:ring-2 focus:ring-[#3E6FA3]/10'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosage *</label>
                  <input 
                    type="text" 
                    name="dosage" 
                    value={formData.dosage} 
                    onChange={handleInputChange} 
                    placeholder="e.g., 500mg, 2 tablets"
                    className={`w-full px-3 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none text-sm ${
                      errors.dosage 
                        ? 'border-red-400 bg-red-50' 
                        : 'border-gray-300 bg-white hover:border-gray-400 focus:border-[#3E6FA3] focus:ring-2 focus:ring-[#3E6FA3]/10'
                    }`}
                  />
                  {errors.dosage && <p className="text-red-500 text-xs mt-1">{errors.dosage}</p>}
                </div>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Schedule</h3>
              <div className="space-y-4">
                {/* Frequency */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Frequency</label>
                  <div className="flex gap-3">
                    {[
                      { value: 'daily', label: 'Daily' },
                      { value: 'weekly', label: 'Weekly' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border-2 transition-all duration-200 text-sm"
                        style={{
                          borderColor: formData.frequency === option.value ? '#3E6FA3' : '#e5e7eb',
                          backgroundColor: formData.frequency === option.value ? '#f0f4f9' : 'white'
                        }}>
                        <input 
                          type="radio" 
                          name="frequency" 
                          value={option.value} 
                          checked={formData.frequency === option.value} 
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-[#3E6FA3]" 
                        />
                        <span className="text-gray-700 font-medium">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Days Selection (Weekly Only) */}
                {formData.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Select Days *</label>
                    <div className="flex flex-wrap gap-2">
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day, idx) => (
                        <button 
                          key={day} 
                          type="button" 
                          onClick={() => handleDayChange(day)}
                          className={`w-10 h-10 rounded-lg font-semibold text-xs transition-all duration-200 ${
                            formData.selectedDays[day] 
                              ? 'bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                        >
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                        </button>
                      ))}
                    </div>
                    {errors.days && <p className="text-red-500 text-xs mt-2">{errors.days}</p>}
                  </div>
                )}

                {/* Time */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock size={16} className="text-[#3E6FA3]" />
                    Medicine Times *
                  </label>
                  <div className="space-y-2">
                    {/* Time Input Section */}
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        value={formData.newTime} 
                        onChange={(e) => setFormData({ ...formData, newTime: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-[#3E6FA3] focus:ring-2 focus:ring-[#3E6FA3]/10 focus:outline-none transition-all duration-200 text-sm"
                      />
                      <button
                        type="button"
                        onClick={addTime}
                        className="px-4 py-2 bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] text-white rounded-lg hover:shadow-md font-semibold transition-all duration-200 text-sm"
                      >
                        Add
                      </button>
                    </div>
                    {errors.newTime && <p className="text-red-500 text-xs">{errors.newTime}</p>}

                    {/* Added Times Display */}
                    {formData.times.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {formData.times.map((time) => (
                          <div 
                            key={time} 
                            className="flex items-center justify-between bg-gradient-to-r from-[#3E6FA3]/10 to-[#2F5B8C]/10 border border-[#3E6FA3] rounded-lg px-3 py-2 font-semibold text-[#2F5B8C] text-sm"
                          >
                            <span className="flex items-center gap-2">
                              <Clock size={14} className="text-[#3E6FA3]" />
                              {time}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeTime(time)}
                              className="ml-2 text-red-500 hover:text-red-700 transition"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                        <p className="text-blue-700 text-xs">No times added yet</p>
                      </div>
                    )}
                    {errors.times && <p className="text-red-500 text-xs">{errors.times}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-[#3E6FA3]" />
                Important Dates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Prescription Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Prescription Date *</label>
                  <input 
                    type="date" 
                    name="prescriptionDate" 
                    value={formData.prescriptionDate} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-[#3E6FA3] focus:ring-2 focus:ring-[#3E6FA3]/10 focus:outline-none transition-all duration-200 text-sm"
                  />
                </div>
                
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-[#3E6FA3] focus:ring-2 focus:ring-[#3E6FA3]/10 focus:outline-none transition-all duration-200 text-sm"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">End Date (Optional)</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    value={formData.endDate} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 focus:border-[#3E6FA3] focus:ring-2 focus:ring-[#3E6FA3]/10 focus:outline-none transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] text-white font-semibold hover:shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Plus size={18} />
                {isLoading ? 'Adding...' : 'Add Medication'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/dashboard')} 
                className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
              >
                <ChevronLeft size={18} />
                Cancel
              </button>
            </div>
              </form>
            </div>
          </div>

          {/* Right Side - Preview Panel (1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Summary</h3>
                
                {/* Medicine Name Preview */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicine Name</p>
                  <p className="text-lg font-bold text-[#2F5B8C] mt-1">
                    {formData.name || '—'}
                  </p>
                </div>

                {/* Dosage Preview */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dosage</p>
                  <p className="text-lg font-bold text-gray-700 mt-1">
                    {formData.dosage || '—'}
                  </p>
                </div>

                {/* Frequency Preview */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Frequency</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                      {formData.frequency === 'daily' ? 'Every Day' : 'Weekly'}
                    </span>
                  </div>
                </div>

                {/* Days Preview (Weekly) */}
                {formData.frequency === 'weekly' && (
                  <div className="mb-5 pb-5 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day, idx) => (
                        <span
                          key={day}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                            formData.selectedDays[day]
                              ? 'bg-[#2F5B8C] text-white'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Times Preview */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicine Times</p>
                  {formData.times.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.times.map((time) => (
                        <span
                          key={time}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700"
                        >
                          <Clock size={14} />
                          {time}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2 italic">No times added</p>
                  )}
                </div>

                {/* Dates Preview */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Important Dates</p>
                  <div className="text-sm text-gray-700 mt-2 space-y-1">
                    <p>
                      <span className="font-semibold">Prescribed:</span> {formData.prescriptionDate || '—'}
                    </p>
                    <p>
                      <span className="font-semibold">Start:</span> {formData.startDate || '—'}
                    </p>
                    <p>
                      <span className="font-semibold">End:</span> {formData.endDate || 'Ongoing'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <span className="font-semibold">Tip:</span> You can edit or delete medications anytime from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </DashboardLayout>
  )
}
