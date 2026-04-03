import { Bell, Check, AlertCircle, Info, Clock, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'System Alert: User Issue',
      message: 'John Doe missed dose of Aspirin (500mg). Scheduled for 2:00 PM',
      time: '30 minutes ago',
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      read: false,
      patient: 'John Doe'
    },
    {
      id: 2,
      type: 'success',
      title: 'Compliance Update: Emma Johnson',
      message: 'Emma Johnson successfully completed her medication schedule today',
      time: '2 hours ago',
      icon: Check,
      color: 'from-green-500 to-emerald-500',
      read: false,
      patient: 'Emma Johnson'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Critical Alert: Robert Wilson',
      message: 'Robert Wilson low adherence rate (60%) this week. System recommendation: Contact patient.',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      read: false,
      patient: 'Robert Wilson'
    },
    {
      id: 4,
      type: 'info',
      title: 'System Notification: Backup Complete',
      message: 'Daily database backup completed successfully at 02:00 AM',
      time: '2 days ago',
      icon: Info,
      color: 'from-blue-500 to-cyan-500',
      read: true,
      patient: 'System'
    },
    {
      id: 5,
      type: 'success',
      title: 'Performance: System Health',
      message: 'System uptime: 99.9% | All services operational | API response time: 145ms',
      time: '3 days ago',
      icon: Check,
      color: 'from-green-500 to-emerald-500',
      read: true,
      patient: 'System'
    },
    {
      id: 6,
      type: 'alert',
      title: 'Security Alert: Login Attempt',
      message: 'Multiple failed login attempts detected. Review security logs?',
      time: '4 days ago',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      read: true,
      patient: 'Security'
    }
  ])

  const [filter, setFilter] = useState('all')

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read
    if (filter === 'alert') return notif.type === 'alert'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">System alerts and admin notifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Notifications</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{notifications.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Bell size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{unreadCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-600 animate-pulse">
              <Bell size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Alerts</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{notifications.filter(n => n.type === 'alert').length}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'unread', 'alert'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-[#6366F1] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : 'Critical'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notif) => {
          const Icon = notif.icon
          return (
            <div
              key={notif.id}
              className={`flex gap-4 p-5 rounded-xl border transition-all ${
                notif.read
                  ? 'bg-gray-50 border-gray-100'
                  : 'bg-white border-indigo-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br ${notif.color} flex items-center justify-center text-white`}>
                <Icon size={24} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`font-semibold text-gray-900 ${notif.read ? 'text-gray-600' : 'font-bold'}`}>
                    {notif.title}
                  </h3>
                  {!notif.read && (
                    <div className="w-3 h-3 bg-[#6366F1] rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">{notif.message}</p>
                <p className="text-xs text-gray-500">{notif.time}</p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex gap-2">
                {!notif.read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="p-2 text-gray-600 hover:bg-white hover:rounded-lg transition"
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredNotifications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Bell className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-gray-600 font-medium">No notifications</p>
          <p className="text-gray-500 text-sm mt-1">All caught up!</p>
        </div>
      )}
    </div>
  )
}
