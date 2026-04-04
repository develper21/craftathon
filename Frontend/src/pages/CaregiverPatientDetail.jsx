import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Calendar, Pill, TrendingUp, AlertCircle, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import CaregiverLayout from '../components/CaregiverLayout'
import CircleProgress from '../components/CircleProgress'
import { api } from '../services/api'
import Notification from '../components/Notification'

export default function CaregiverPatientDetail() {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [medications, setMedications] = useState([])
  const [adherenceData, setAdherenceData] = useState(null)
  const [doseHistory, setDoseHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)

  // Fetch patient details on mount
  useEffect(() => {
    if (patientId) {
      fetchPatientDetails()
    }
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch patient details from the API
      const result = await api.getPatientDetail(patientId)
      
      if (result.success) {
        const data = result.data
        setPatient(data.patient)
        setAdherenceData({
          adherenceScore: data.adherenceScore || 0,
          lastMonthTaken: data.lastMonthTaken || 0,
          lastMonthScheduled: data.lastMonthScheduled || 0
        })
        setMedications(data.medications || [])
        // Dose history is likely in the data or we can derive it from display
        setDoseHistory([])
      } else {
        setError('Failed to load patient details')
      }
    } catch (err) {
      console.error('Error fetching patient details:', err)
      setError('Failed to load patient details')
    } finally {
      setLoading(false)
    }
  }

  // Get adherence color based on score
  const getAdherenceColor = (score) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getAdherenceBg = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <CaregiverLayout pageTitle="Patient Details" pageSubtitle="View patient information and adherence">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#3E6FA3] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </CaregiverLayout>
    )
  }

  if (!patient && !loading) {
    return (
      <CaregiverLayout pageTitle="Patient Details" pageSubtitle="View patient information and adherence">
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Patient not found or access denied</p>
          <Link to="/caregiver/patients" className="mt-4 inline-block px-6 py-3 bg-[#3E6FA3] text-white rounded-xl font-semibold hover:bg-opacity-90">
            Back to Patients
          </Link>
        </div>
      </CaregiverLayout>
    )
  }

  const adherenceScore = adherenceData?.adherenceScore || 0

  return (
    <CaregiverLayout pageTitle="Patient Details" pageSubtitle="View patient information and adherence">
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
          <button onClick={fetchPatientDetails} className="ml-4 underline">Retry</button>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-6">
        <Link 
          to="/caregiver/patients"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Patients
        </Link>
      </div>

      {/* Patient Header Card */}
      <div className="bg-gradient-to-r from-[#2F5B8C] via-[#3E6FA3] to-[#22C55E] rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center font-bold text-3xl text-white flex-shrink-0">
            {(patient?.firstName?.[0] || patient?.name?.[0] || '?')}{(patient?.lastName?.[0] || '')}
          </div>
          
          {/* Patient Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">
              {patient?.firstName && patient?.lastName 
                ? `${patient.firstName} ${patient.lastName}`
                : patient?.firstName 
                  ? patient.firstName
                  : patient?.name 
                    ? patient.name
                    : 'Unknown Patient'}
            </h2>
            <p className="text-blue-100 text-lg">{patient?.email || 'N/A'}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-blue-100">
              {patient?.phone && (
                <span className="flex items-center gap-2">
                  <Phone size={16} />
                  {patient.phone}
                </span>
              )}
              {patient?.dateOfBirth && (
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Adherence Score */}
          <div className="text-center bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <CircleProgress percentage={adherenceScore} size="md" />
            <p className="mt-2 text-sm text-blue-100">Adherence Score</p>
            <p className={`text-2xl font-bold ${getAdherenceColor(adherenceScore)}`}>
              {adherenceScore}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats & Info */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Medications</span>
                <span className="font-bold text-[#3E6FA3] text-xl">{medications.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Month</span>
                <span className="font-semibold text-gray-900">
                  {adherenceData?.lastMonthTaken}/{adherenceData?.lastMonthScheduled} doses
                </span>
              </div>
            </div>
          </div>

          {/* Adherence Status */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adherence Status</h3>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className={`h-3 rounded-full ${getAdherenceBg(adherenceScore)} transition-all duration-500`}
                style={{ width: `${adherenceScore}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {adherenceScore >= 80 
                ? '✓ Excellent adherence! Patient is doing great.' 
                : adherenceScore >= 60 
                  ? '⚠ Good adherence with room to improve.' 
                  : '✗ Adherence needs attention. Reach out soon.'}
            </p>
          </div>

          {/* Status Badge */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                adherenceScore >= 80 ? 'bg-green-500' : 
                adherenceScore >= 60 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`} />
              <span className={`font-semibold ${
                adherenceScore >= 80 ? 'text-green-600' : 
                adherenceScore >= 60 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {adherenceScore >= 80 ? 'On Track' : adherenceScore >= 60 ? 'At Risk' : 'Critical'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column - Medications & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Medications */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Pill className="text-[#3E6FA3]" size={20} />
                Current Medications
              </h3>
              <span className="px-3 py-1 bg-blue-50 text-[#3E6FA3] rounded-full text-sm font-medium">
                {medications.length} active
              </span>
            </div>

            {medications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No medications found for this patient</p>
            ) : (
              <div className="space-y-4">
                {medications.map((med) => (
                  <div key={med.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#2F5B8C] transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{med.name}</h4>
                        <p className="text-sm text-gray-600">{med.dosage}{med.unit}</p>
                        {med.instructions && (
                          <p className="text-xs text-gray-500 mt-1">{med.instructions}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#2F5B8C]">
                          {med.times?.join(', ') || '09:00'}
                        </p>
                        <p className="text-xs text-gray-500">{med.frequency?.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-[#2F5B8C]" size={20} />
                Recent Activity (Last 7 Days)
              </h3>
              <Link 
                to={`/caregiver/patient/${patientId}/history`}
                className="text-sm text-[#2F5B8C] hover:underline"
              >
                View Full History
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        log.status === 'TAKEN' ? 'bg-green-500' : 
                        log.status === 'LATE' ? 'bg-yellow-500' : 
                        log.status === 'SKIPPED' ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-semibold text-gray-900">{log.medication?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">
                          {log.status} • {new Date(log.takenAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      log.status === 'TAKEN' ? 'bg-green-100 text-green-800' : 
                      log.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                      log.status === 'SKIPPED' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link 
              to={`/caregiver/patient/${patientId}/report`}
              className="flex-1 px-6 py-3 bg-[#2F5B8C] text-white rounded-xl font-semibold text-center hover:bg-[#264a73] transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              View Weekly Report
            </Link>
            <button 
              className="flex-1 px-6 py-3 bg-[#22C55E] text-white rounded-xl font-semibold text-center hover:bg-[#1ea852] transition-colors flex items-center justify-center gap-2"
              onClick={() => setNotification({ message: 'Message feature coming soon!', type: 'info' })}
            >
              <Mail size={20} />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </CaregiverLayout>
  )
}
