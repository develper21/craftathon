import { useNavigate, useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, AlertCircle, BarChart3, User, LogOut, Bell } from 'lucide-react'

export default function CaregiverLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/caregiver/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/caregiver/patients', label: 'Patients', icon: Users },
    { path: '/caregiver/alerts', label: 'Alerts', icon: AlertCircle },
    { path: '/caregiver/reports', label: 'Reports', icon: BarChart3 },
    { path: '/caregiver/profile', label: 'Profile', icon: User }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#1E3A5F] to-[#1A2F45] text-white fixed left-0 top-0 h-screen flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
              M
            </div>
            <div>
              <h1 className="text-base font-bold">MediCare</h1>
              <p className="text-xs text-teal-200">Caregiver</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-[#14B8A6] text-white shadow-lg'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-white/10 mx-4" />

        {/* User Profile Section */}
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 mb-3 hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F5B8C] to-[#3E6FA3] flex items-center justify-center font-bold text-sm text-white shadow-md">
              {(user?.name || user?.firstName)?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">
                {user?.name || user?.firstName || 'Caregiver'}
              </p>
              <p className="text-xs text-teal-200 truncate">{user?.email || 'caregiver@example.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Welcome back, {user?.name || user?.firstName || 'Caregiver'}</h2>
            <p className="text-sm text-gray-600">Manage your patients and monitor their adherence</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Notification Icon */}
            <button 
              onClick={() => navigate('/caregiver/notifications')}
              className="relative p-2.5 text-gray-600 hover:text-[#14B8A6] hover:bg-teal-50 rounded-xl transition-all duration-200 cursor-pointer">
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-pulse" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200" />

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || user?.firstName || 'Caregiver'}</p>
                <p className="text-xs text-gray-600">Caregiver</p>
              </div>
              <button
                onClick={() => navigate('/caregiver/profile')}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2F5B8C] to-[#3E6FA3] text-white flex items-center justify-center font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 cursor-pointer text-sm"
              >
                {(user?.name || user?.firstName)?.charAt(0).toUpperCase() || 'C'}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content - Using Outlet for nested routes */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
