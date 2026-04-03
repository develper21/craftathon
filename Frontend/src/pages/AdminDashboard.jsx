import { Users, User, AlertCircle, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Users', value: '324', icon: Users, color: 'bg-blue-50', iconColor: 'text-[#3B82F6]' },
    { label: 'Total Patients', value: '215', icon: User, color: 'bg-green-50', iconColor: 'text-[#22C55E]' },
    { label: 'Total Caregivers', value: '89', icon: Users, color: 'bg-purple-50', iconColor: 'text-[#A855F7]' },
    { label: 'Active Alerts', value: '12', icon: AlertCircle, color: 'bg-red-50', iconColor: 'text-[#EF4444]' }
  ]

  const recentActivity = [
    { id: 1, action: 'New user registration', user: 'John Patient', time: '2 minutes ago', type: 'user' },
    { id: 2, action: 'Alert triggered', user: 'Emma Johnson', time: '15 minutes ago', type: 'alert' },
    { id: 3, action: 'User deactivated', user: 'Dr. Smith', time: '1 hour ago', type: 'deactivate' },
    { id: 4, action: 'New medication added', user: 'Michael Brown', time: '2 hours ago', type: 'medication' },
    { id: 5, action: 'System maintenance', user: 'Admin', time: '3 hours ago', type: 'system' }
  ]

  const systemMetrics = [
    { label: 'System Uptime', value: '99.8%', status: 'healthy' },
    { label: 'API Response Time', value: '145ms', status: 'healthy' },
    { label: 'Database Size', value: '2.4 GB', status: 'healthy' },
    { label: 'Active Sessions', value: '284', status: 'healthy' }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">System overview and key metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`${stat.color} rounded-xl p-6 border border-gray-100 shadow-sm`}>
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

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition">
                <div className="w-2 h-2 rounded-full mt-2" style={{
                  backgroundColor: activity.type === 'alert' ? '#EF4444' : 
                                  activity.type === 'deactivate' ? '#F59E0B' :
                                  activity.type === 'system' ? '#6366F1' : '#22C55E'
                }}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600 mt-1">{activity.user}</p>
                </div>
                <p className="text-xs text-gray-500 flex-shrink-0">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">System Health</h2>
          <div className="space-y-4">
            {systemMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                  <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#22C55E] w-full"></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 capitalize">{metric.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Users This Week</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">+24</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-[#3B82F6]">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved Alerts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">87%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-[#22C55E]">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Uptime</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">99.8%</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-[#A855F7]">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
