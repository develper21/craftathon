import { Download, TrendingUp, Users, AlertCircle } from 'lucide-react'

export default function CaregiverReports() {
  const weeklyData = [
    { day: 'Mon', adherence: 78 },
    { day: 'Tue', adherence: 82 },
    { day: 'Wed', adherence: 75 },
    { day: 'Thu', adherence: 88 },
    { day: 'Fri', adherence: 85 },
    { day: 'Sat', adherence: 79 },
    { day: 'Sun', adherence: 81 }
  ]

  const complianceMetrics = [
    { label: 'On-Time Doses', value: 89, target: 95 },
    { label: 'Follow-up Appointments', value: 76, target: 90 },
    { label: 'Lab Test Completion', value: 92, target: 85 }
  ]

  const monthlyStats = [
    { month: 'October', patients: 10, adherence: 79, alerts: 8 },
    { month: 'November', patients: 12, adherence: 82, alerts: 6 },
    { month: 'December', patients: 12, adherence: 85, alerts: 5 },
    { month: 'January', patients: 12, adherence: 82, alerts: 7 }
  ]

  const maxAdherence = Math.max(...weeklyData.map((d) => d.adherence))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Track patient adherence and compliance metrics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-teal-700 transition font-medium">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Adherence</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">82%</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> +3% from last month
              </p>
            </div>
            <div className="p-3 bg-[#14B8A6] rounded-lg text-white">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Patients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              <p className="text-xs text-gray-600 mt-2">2 new this month</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-3xl font-bold text-[#EF4444] mt-2">3</p>
              <p className="text-xs text-gray-600 mt-2">This month</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg text-[#EF4444]">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Weekly Adherence Trend</h2>
        <div className="flex items-end gap-3 h-64 justify-between">
          {weeklyData.map((data) => (
            <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center">
                <div
                  className="w-full bg-[#14B8A6] rounded-t-lg transition hover:bg-teal-700"
                  style={{
                    height: `${(data.adherence / maxAdherence) * 200}px`,
                    minHeight: '4px'
                  }}
                ></div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900">{data.day}</p>
                <p className="text-xs text-gray-600">{data.adherence}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Compliance Metrics</h2>
        <div className="space-y-6">
          {complianceMetrics.map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900">{metric.label}</p>
                  <p className="text-xs text-gray-600 mt-1">Target: {metric.target}%</p>
                </div>
                <span className="text-lg font-bold text-gray-900">{metric.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-full rounded-full transition ${
                    metric.value >= metric.target ? 'bg-[#14B8A6]' : 'bg-[#F59E0B]'
                  }`}
                  style={{ width: `${metric.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Month</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Patients</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Avg Adherence</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Critical Alerts</th>
              </tr>
            </thead>
            <tbody>
              {monthlyStats.map((stat, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-900 font-medium">{stat.month}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{stat.patients}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-[#14B8A6] rounded-full"
                          style={{ width: `${stat.adherence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 min-w-12">{stat.adherence}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      {stat.alerts}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#14B8A6] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Export Your Report</h3>
            <p className="text-teal-100 mt-2">Generate custom reports for compliance and review</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium transition">
              PDF
            </button>
            <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-medium transition">
              CSV
            </button>
            <button className="px-4 py-2 bg-white hover:bg-gray-100 text-[#1E3A5F] rounded-lg font-medium transition">
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
