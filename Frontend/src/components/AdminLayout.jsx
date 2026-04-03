import { useNavigate, useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, AlertCircle, BarChart3, Settings, LogOut, Bell } from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/alerts', label: 'Alerts', icon: AlertCircle },
    { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/admin/settings', label: 'Settings', icon: Settings }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#111827] to-[#0F172A] text-white fixed left-0 top-0 h-screen flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#6366F1] rounded-lg flex items-center justify-center font-bold text-sm">
              MA
            </div>
            <div>
              <h1 className="text-base font-bold">MediCare</h1>
              <p className="text-xs text-indigo-300">Admin</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-[#6366F1] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
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
            <div className="w-10 h-10 rounded-full bg-[#6366F1] flex items-center justify-center font-bold text-sm text-white shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-indigo-300 truncate">{user?.email || 'admin@example.com'}</p>
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
            <h2 className="text-lg font-semibold text-gray-900">Welcome back, Admin</h2>
            <p className="text-sm text-gray-600">System administration and monitoring</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Notification Icon */}
            <button
              onClick={() => navigate('/admin/notifications')}
              className="relative p-2.5 text-gray-600 hover:text-[#6366F1] hover:bg-indigo-50 rounded-xl transition-all duration-200 cursor-pointer"
            >
              <Bell size={24} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-pulse" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200" />

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-600">Administrator</p>
              </div>
              <button
                onClick={() => navigate('/admin/profile')}
                className="w-10 h-10 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-semibold hover:opacity-90 hover:shadow-lg transition-all text-sm cursor-pointer"
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content - Using Outlet for nested routes */}
        <div className="flex-1 overflow-auto pt-8 pb-8 px-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
