import React, { createContext, useState, useContext, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const savedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (savedUser && token) {
        try {
          setUser(JSON.parse(savedUser))
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Failed to load user from localStorage:', error)
          api.clearTokens()
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // Login with API
  const login = async (email, password) => {
    try {
      const response = await api.login(email, password)
      
      if (response.success && response.data?.user) {
        const userData = response.data.user
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('user', JSON.stringify(userData))
        return { success: true, user: userData }
      }
      
      return { success: false, message: response.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error.message || 'Network error during login' }
    }
  }

  // Register with API
  const register = async (userData) => {
    try {
      const response = await api.register(userData)
      
      if (response.success) {
        return { success: true, message: response.message || 'Registration successful' }
      }
      
      return { success: false, message: response.message || 'Registration failed' }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: error.message || 'Network error during registration' }
    }
  }

  // Logout
  const logout = async () => {
    // Clear local storage immediately
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    
    // Call logout API in background (non-blocking)
    api.logout().catch(() => { })
    
    // Redirect to login immediately
    window.location.href = '/login'
  }

  // Update user data (for profile updates)
  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
