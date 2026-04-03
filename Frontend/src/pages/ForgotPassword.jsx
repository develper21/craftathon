import { useState } from 'react'
import { Link } from 'react-router-dom'
import Notification from '../components/Notification'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [notification, setNotification] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setNotification({ message: 'Please enter your email', type: 'error' })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSent(true)
        setNotification({ message: 'Reset link sent to your email', type: 'success' })
      } else {
        setNotification({ message: data.message || 'Failed to send reset link', type: 'error' })
      }
    } catch (error) {
      setNotification({ message: 'Network error. Please try again.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link to="/" className="mb-12 flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 bg-[#2F5B8C] rounded-lg flex items-center justify-center text-white font-bold">
          M
        </div>
        <span className="text-xl font-bold text-[#2F5B8C]">MediTrack</span>
      </Link>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Forgot Password Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {!isSent ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Forgot Password?</h2>
              <p className="text-[#6B7280]">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F5B8C] focus:border-transparent"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#2F5B8C] hover:bg-[#264a73] disabled:bg-gray-400 text-white font-medium rounded-xl transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Check Your Email</h2>
            <p className="text-[#6B7280] mb-6">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <Link
              to="/login"
              className="inline-block py-3 px-6 bg-[#2F5B8C] hover:bg-[#264a73] text-white font-medium rounded-xl transition-colors"
            >
              Back to Login
            </Link>
          </div>
        )}

        {/* Back to Login */}
        {!isSent && (
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#2F5B8C] hover:text-[#264a73] font-medium text-sm">
              ← Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
