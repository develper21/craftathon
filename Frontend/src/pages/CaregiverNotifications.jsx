import { Bell, Check, AlertCircle, Info, Clock, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function CaregiverNotifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'alert',
      title: 'Patient Alert: John Doe',
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
      title: 'Patient Update: Emma Johnson',
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
      title: 'Critical: Robert Wilson',
      message: 'Robert Wilson low adherence rate (60%) this week. Needs attention!',
      time: '1 day ago',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      read: true,
      patient: 'Robert Wilson'
    },
    {
      id: 4,
      type: 'info',
      title: 'Patient Info: Sarah Smith',
      message: 'Sarah Smith prescription expires in 7 days. Consider sending reminder.',
      time: '2 days ago',
      icon: Info,
      color: 'from-blue-500 to-cyan-500',
      read: true,
      patient: 'Sarah Smith'
    },
    {
      id: 5,
      type: 'success',
      title: 'Patient Achievement: Lisa Anderson',
      message: 'Lisa Anderson achieved 95% adherence this week. Great progress!',
      time: '3 days ago',
      icon: Check,
      color: 'from-green-500 to-emerald-500',
      read: true,
      patient: 'Lisa Anderson'
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
        <p className="text-gray-600 mt-2">Stay updated with patient alerts and activities</p>
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
              <p className="text-3xl font-bold text-[#EF4444] mt-2">{unreadCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-[#EF4444]">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{notifications.length - unreadCount}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <Check size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        {[
          { label: 'All', value: 'all' },
          { label: 'Unread', value: 'unread' },
          { label: 'Alerts', value: 'alert' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === option.value
                ? 'bg-[#14B8A6] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => {
            const Icon = notif.icon
            return (
              <div
                key={notif.id}
                className={`rounded-xl p-6 border-2 transition-all ${
                  notif.read
                    ? 'bg-white border-gray-100 hover:border-gray-300'
                    : 'bg-blue-50 border-[#14B8A6] hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-4 rounded-lg text-white flex-shrink-0 bg-gradient-to-br ${notif.color}`}
                  >
                    <Icon size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {notif.title}
                          </h3>
                          {!notif.read && (
                            <span className="px-2.5 py-0.5 bg-[#14B8A6] text-white text-xs font-semibold rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{notif.message}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">{notif.time}</span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {notif.patient}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="px-3 py-2 rounded-lg bg-[#14B8A6] text-white hover:bg-teal-700 transition text-sm font-medium"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-2 text-gray-600 hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Bell className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-gray-600 font-medium">No notifications</p>
            <p className="text-gray-500 text-sm mt-1">All caught up! You'll see new notifications here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
