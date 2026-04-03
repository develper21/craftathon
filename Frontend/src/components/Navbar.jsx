import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-90 transition duration-200">
            <Logo size="default" showText={true} />
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-6">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-gray-600 font-medium">
                  Welcome, <span className="text-[#2F5B8C] font-semibold">{user.name}</span>
                </span>
                <Link
                  to="/profile"
                  className="text-gray-700 hover:text-[#2F5B8C] font-medium transition duration-200"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] rounded-lg hover:shadow-md transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-[#2F5B8C] hover:text-[#3E6FA3] font-semibold transition duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] rounded-lg hover:shadow-md transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
