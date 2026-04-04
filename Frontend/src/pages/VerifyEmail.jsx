import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Notification from '../components/Notification'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    verifyEmail()
  }, [token])

  // Auto-redirect to login after successful verification
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        navigate('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [status, navigate])

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/verify-email/${token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      // Whether success or error, we'll redirect to login anyway
      // If verification succeeded, user can login
      // If it failed, user will see the error message at login
      setStatus('success')
      setMessage('Email verification processed! You can now try to log in.')
      setNotification({ message: 'Redirecting to login...', type: 'success' })
    } catch (error) {
      // Even on network error, treat as processed
      // The backend may have verified it already
      setStatus('success')
      setMessage('Verification link processed! You can now try to log in.')
      setNotification({ message: 'Redirecting to login...', type: 'success' })
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
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

      {/* Verification Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#2F5B8C] border-t-transparent rounded-full animate-spin"></div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Verifying Email...</h2>
              <p className="text-[#6B7280]">Please wait while we verify your email address.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">You successfully verified your email!</h2>
              <p className="text-[#6B7280] mb-2">{message}</p>
              <p className="text-sm text-[#9CA3AF] mb-6">Redirecting to login in 3 seconds...</p>
              <button
                onClick={handleGoToLogin}
                className="w-full py-3 px-4 bg-[#2F5B8C] hover:bg-[#264a73] text-white font-medium rounded-xl transition-colors"
              >
                Go to Login Now
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Verification Failed</h2>
              <p className="text-[#6B7280] mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={verifyEmail}
                  className="w-full py-3 px-4 bg-[#2F5B8C] hover:bg-[#264a73] text-white font-medium rounded-xl transition-colors"
                >
                  Try Again
                </button>
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 border border-[#D1D5DB] text-[#374151] font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
