import { TrendingUp, Users, Pill, Target } from 'lucide-react'

export default function AdminAnalytics() {
  const adherenceData = [
    { name: 'John Doe', adherence: 92, color: 'bg-[#22C55E]' },
    { name: 'Emma Johnson', adherence: 78, color: 'bg-[#F59E0B]' },
    { name: 'Robert Wilson', adherence: 65, color: 'bg-[#EF4444]' },
    { name: 'Michael Brown', adherence: 88, color: 'bg-[#22C55E]' },
    { name: 'Sarah Smith', adherence: 95, color: 'bg-[#22C55E]' },
    { name: 'Lisa Anderson', adherence: 71, color: 'bg-[#F59E0B]' },
    { name: 'James Martin', adherence: 84, color: 'bg-[#22C55E]' },
    { name: 'Mary Davis', adherence: 79, color: 'bg-[#F59E0B]' }
  ]

  const systemMetrics = [
    {
      label: 'Average Adherence',
      value: '83',
      unit: '%',
      icon: Target,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Total Doses Tracked',
      value: '2,847',
      unit: '',
      icon: Pill,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'Success Rate',
      value: '84',
      unit: '%',
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600'
    },
    {
      label: 'Active Sessions',
      value: '342',
      unit: '',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600'
    }
  ]

  const weeklyData = [
    { day: 'Mon', adherence: 82, doses: 145 },
    { day: 'Tue', adherence: 85, doses: 158 },
    { day: 'Wed', adherence: 79, doses: 142 },
    { day: 'Thu', adherence: 88, doses: 169 },
    { day: 'Fri', adherence: 90, doses: 175 },
    { day: 'Sat', adherence: 81, doses: 156 },
    { day: 'Sun', adherence: 83, doses: 151 }
  ]

  const maxValue = 100
  const maxDoses = Math.max(...weeklyData.map(d => d.doses))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Metrics</h1>
        <p className="text-gray-600 mt-2">System performance and adherence analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon
          return (
            <div key={metric.label} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
                    <span className="text-gray-500 text-sm ml-1">{metric.unit}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly Adherence Trends */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Adherence Trend</h2>
        
        <div className="flex items-end justify-between h-64 gap-3">
          {weeklyData.map((data) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gray-100 rounded-t-lg relative overflow-hidden" style={{ height: '180px' }}>
                <div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-[#6366F1] to-[#818CF8] rounded-t-lg transition-all"
                  style={{ height: `${(data.adherence / maxValue) * 100}%` }}
                />
              </div>
              <p className="text-sm font-semibold text-gray-700">{data.day}</p>
              <p className="text-xs text-gray-500">{data.adherence}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Adherence Breakdown */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Adherence Breakdown</h2>
        
        <div className="space-y-4">
          {adherenceData.map((patient) => (
            <div key={patient.name} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-gray-900">{patient.name}</p>
                  <span className="text-sm font-semibold text-gray-700">{patient.adherence}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full ${patient.color} rounded-full transition-all`}
                    style={{ width: `${patient.adherence}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">Daily Active Users</p>
          <p className="text-3xl font-bold text-gray-900">284</p>
          <p className="text-sm text-gray-500 mt-2">+12% from last week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">Avg Session Duration</p>
          <p className="text-3xl font-bold text-gray-900">18m</p>
          <p className="text-sm text-gray-500 mt-2">Across all users</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-600 mb-3">Mobile vs Web</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Mobile</span>
              <span className="font-semibold text-gray-900">68%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Web</span>
              <span className="font-semibold text-gray-900">32%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medication Adherence by Category */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Adherence by Medication Type</h2>
        
        <div className="space-y-4">
          {[
            { name: 'Blood Pressure Medications', adherence: 91, total: 256 },
            { name: 'Diabetes Medications', adherence: 85, total: 189 },
            { name: 'Heart Disease Medications', adherence: 88, total: 142 },
            { name: 'Thyroid Medications', adherence: 94, total: 98 },
            { name: 'Arthritis Medications', adherence: 79, total: 76 }
          ].map((med) => (
            <div key={med.name} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-1">{med.name}</p>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full"
                    style={{ width: `${med.adherence}%` }}
                  />
                </div>
              </div>
              <div className="ml-4 text-right">
                <p className="text-sm font-semibold text-gray-900">{med.adherence}%</p>
                <p className="text-xs text-gray-500">{med.total} tracked</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
