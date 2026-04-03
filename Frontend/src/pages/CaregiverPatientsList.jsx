import { useState } from 'react'
import { Search, Eye, AlertCircle } from 'lucide-react'

export default function CaregiverPatientsList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const patients = [
    {
      id: 1,
      name: 'John Doe',
      condition: 'Diabetes Type 2',
      medications: 3,
      adherence: 75,
      status: 'warning',
      lastCheckin: '2 hours ago'
    },
    {
      id: 2,
      name: 'Emma Johnson',
      condition: 'Hypertension',
      medications: 2,
      adherence: 95,
      status: 'good',
      lastCheckin: '30 mins ago'
    },
    {
      id: 3,
      name: 'Robert Wilson',
      condition: 'Heart Disease',
      medications: 4,
      adherence: 60,
      status: 'critical',
      lastCheckin: '4 hours ago'
    },
    {
      id: 4,
      name: 'Sarah Smith',
      condition: 'Arthritis',
      medications: 2,
      adherence: 88,
      status: 'good',
      lastCheckin: '1 hour ago'
    },
    {
      id: 5,
      name: 'Michael Brown',
      condition: 'Asthma',
      medications: 2,
      adherence: 72,
      status: 'warning',
      lastCheckin: '3 hours ago'
    },
    {
      id: 6,
      name: 'Lisa Anderson',
      condition: 'Thyroid',
      medications: 1,
      adherence: 92,
      status: 'good',
      lastCheckin: '45 mins ago'
    }
  ]

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getAdherenceColor = (value) => {
    if (value >= 80) return 'bg-[#14B8A6]'
    if (value >= 60) return 'bg-[#F59E0B]'
    return 'bg-[#EF4444]'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-600 mt-2">Monitor and manage your patients</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'good', 'warning', 'critical'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? status === 'all'
                    ? 'bg-[#1E3A5F] text-white'
                    : status === 'good'
                    ? 'bg-green-100 text-green-700'
                    : status === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patient Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Condition</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Medications</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Adherence</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Check-in</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{patient.name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{patient.condition}</td>
                  <td className="px-6 py-4 text-gray-600">{patient.medications} meds</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">{patient.adherence}%</div>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${getAdherenceColor(patient.adherence)}`}
                          style={{ width: `${patient.adherence}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(patient.status)}`}
                    >
                      {patient.status === 'good' ? 'Good' : patient.status === 'warning' ? 'Warning' : 'Critical'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.lastCheckin}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[#14B8A6] hover:bg-teal-50 transition">
                      <Eye size={18} />
                      <span className="text-sm font-medium">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-600 font-medium">No patients found</p>
          <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
