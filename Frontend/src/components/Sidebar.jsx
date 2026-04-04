import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
        </svg>
      ),
      roles: ['patient']
    },
    {
      name: 'Medications',
      path: '/add-medication',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      ),
      roles: ['patient']
    },
    {
      name: 'Schedule',
      path: '/schedule',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-5-7H7v5h7v-5z" />
        </svg>
      ),
      roles: ['patient']
    },
    {
      name: 'Adherence',
      path: '/adherence',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
        </svg>
      ),
      roles: ['patient']
    },
    {
      name: 'Report',
      path: '/adherence-report',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-5-7H7v5h7v-5z" />
        </svg>
      ),
      roles: ['patient']
    },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
      ),
      roles: ['doctor']
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
      roles: ['patient', 'doctor', 'caregiver']
    },
    {
      name: 'Dashboard',
      path: '/caregiver/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
        </svg>
      ),
      roles: ['caregiver']
    },
    {
      name: 'My Patients',
      path: '/caregiver/patients',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      ),
      roles: ['caregiver']
    },
    {
      name: 'Alerts',
      path: '/caregiver/alerts',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
      ),
      roles: ['caregiver']
    }
  ]

  const isActive = (path) => location.pathname === path

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role?.toLowerCase())
  )

  return (
    <div className="w-64 bg-gradient-to-b from-[#1A3A52] to-[#1E4460] text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10 sticky top-0">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity duration-200">
          <Logo size="default" showText={false} />
          <div>
            <span className="text-base font-bold tracking-tight">MediTrack</span>
            <p className="text-xs text-blue-200">Patient Health</p>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          (!item.roles || item.roles.includes(user?.role?.toLowerCase())) && (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-[#2F5B8C] text-white shadow-lg'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className="text-sm">{item.name}</span>
              {isActive(item.path) && (
                <div className="ml-auto w-2 h-2 rounded-full bg-[#22C55E] shadow-lg" />
              )}
            </Link>
          )
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-white/10 mx-4" />

      {/* User Profile Section */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3 hover:bg-white/10 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F5B8C] to-[#3E6FA3] flex items-center justify-center font-bold text-sm text-white shadow-md">
            {(user?.name || user?.firstName)?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white">{user?.name || user?.firstName || 'User'}</p>
            <p className="text-xs text-blue-200 truncate">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1).toLowerCase() || 'Patient'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
