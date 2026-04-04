import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Topbar({ title = 'Dashboard', subtitle = '' }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="fixed top-0 right-0 left-64 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between shadow-md z-40">
      {/* Left - Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500 mt-0.5">{subtitle || 'Welcome back to your medication dashboard'}</p>
      </div>

      {/* Right - Notifications & User */}
      <div className="flex items-center gap-8">
        {/* Notification Icon */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2.5 text-gray-600 hover:text-[#2F5B8C] hover:bg-blue-50 rounded-xl transition-all duration-200 group cursor-pointer">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#22C55E] rounded-full animate-pulse" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{user?.name || user?.firstName || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase() || 'Patient'}</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F5B8C] to-[#3E6FA3] flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
            {user?.name?.charAt(0).toUpperCase() || user?.firstName?.charAt(0).toUpperCase() || 'U'}
          </button>
        </div>
      </div>
    </div>
  )
}
