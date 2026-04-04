import { Bell, Check, AlertCircle, Info, Clock, Trash2, CheckCheck } from 'lucide-react'
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
  const [selectedNotification, setSelectedNotification] = useState(null)

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

  // Notification Detail Modal Component
  const NotificationDetailModal = ({ notification, onClose }) => {
    if (!notification) return null
    
    const Icon = notification.icon

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in duration-200">
          {/* Header - Simple and Clean */}
          <div className="bg-gradient-to-br from-[#2F5B8C] to-[#3E6FA3] p-6 text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-xl font-bold">{notification.title}</h2>
                <p className="text-blue-100 text-sm mt-1">{notification.time}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content - Clean Layout */}
          <div className="p-6 space-y-4">
            {/* Patient Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs uppercase tracking-wider font-semibold text-blue-600 mb-2">Patient</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-semibold text-gray-900">{notification.patient}</p>
                </div>
              </div>
            </div>

            {/* Message Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-600 mb-2">Message</p>
              <p className="text-gray-900 text-sm leading-relaxed font-medium">{notification.message}</p>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {notification.read ? (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <CheckCheck size={14} />
                  Read
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <AlertCircle size={14} />
                  Unread
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {!notification.read && (
                <button
                  onClick={() => {
                    handleMarkAsRead(notification.id)
                    onClose()
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#2F5B8C] hover:bg-[#264a73] text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => {
                  handleDelete(notification.id)
                  onClose()
                }}
                className="flex-1 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
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
                onClick={() => setSelectedNotification(notif)}
                className={`rounded-xl p-6 border-2 transition-all cursor-pointer hover:shadow-md ${
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
                  <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal 
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  )
}
