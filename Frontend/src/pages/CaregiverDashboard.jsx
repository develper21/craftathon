import { Users, AlertCircle, TrendingUp, Heart } from 'lucide-react'

export default function CaregiverDashboard() {
  const stats = [
    { label: 'Total Patients', value: '12', icon: Users, color: 'bg-blue-50', iconColor: 'text-[#1E3A5F]' },
    { label: 'Active Patients', value: '8', icon: Heart, color: 'bg-teal-50', iconColor: 'text-[#14B8A6]' },
    { label: 'Critical Alerts', value: '3', icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-[#EF4444]' },
    { label: 'Avg Adherence', value: '82%', icon: TrendingUp, color: 'bg-amber-50', iconColor: 'text-[#F59E0B]' }
  ]

  const recentAlerts = [
    { id: 1, patient: 'John Doe', issue: 'Missed dose - Aspirin', time: '2 hours ago', severity: 'critical' },
    { id: 2, patient: 'Emma Johnson', issue: 'Missed dose - Metformin', time: '4 hours ago', severity: 'warning' },
    { id: 3, patient: 'Robert Wilson', issue: 'Low adherence this week', time: '6 hours ago', severity: 'warning' }
  ]

  const patients = [
    { id: 1, name: 'John Doe', condition: 'Diabetes Type 2', adherence: 75, status: 'warning' },
    { id: 2, name: 'Emma Johnson', condition: 'Hypertension', adherence: 95, status: 'good' },
    { id: 3, name: 'Robert Wilson', condition: 'Heart Disease', adherence: 60, status: 'critical' },
    { id: 4, name: 'Sarah Smith', condition: 'Arthritis', adherence: 88, status: 'good' }
  ]

  const getAdherenceColor = (value) => {
    if (value >= 80) return 'bg-[#14B8A6]'
    if (value >= 60) return 'bg-[#F59E0B]'
    return 'bg-[#EF4444]'
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Caregiver Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor and manage patient adherence</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`${stat.color} rounded-xl p-6 border border-gray-100`}>
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

      {/* Alerts & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Alerts</h2>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border-red-100'
                    : 'bg-yellow-50 border-yellow-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{alert.patient}</p>
                    <p className="text-sm text-gray-600 mt-1">{alert.issue}</p>
                    <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      alert.severity === 'critical'
                        ? 'bg-[#EF4444] text-white'
                        : 'bg-[#F59E0B] text-white'
                    }`}
                  >
                    {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Adherence Rate</span>
                <span className="text-sm font-bold text-[#1E3A5F]">82%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active Patients</span>
                <span className="text-sm font-bold text-[#1E3A5F]">67%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-[#14B8A6] rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Critical Cases</span>
                <span className="text-sm font-bold text-[#EF4444]">3</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div className="h-full bg-[#EF4444] rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Overview */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Patients Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
              <p className="font-semibold text-gray-900">{patient.name}</p>
              <p className="text-sm text-gray-600 mt-1">{patient.condition}</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Adherence</span>
                  <span className="text-sm font-bold text-gray-900">{patient.adherence}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className={`h-full rounded-full ${getAdherenceColor(patient.adherence)}`}
                    style={{ width: `${patient.adherence}%` }}
                  ></div>
                </div>
              </div>
              <div className="mt-3">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    patient.status === 'good'
                      ? 'bg-green-100 text-green-700'
                      : patient.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {patient.status === 'good' ? 'Good' : patient.status === 'warning' ? 'Warning' : 'Critical'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
