/**
 * API Service Layer
 * Centralized HTTP client for all backend API calls
 * Handles authentication, error handling, and request/response interceptors
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class ApiService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1`
  }

  // Get stored auth token
  getToken() {
    return localStorage.getItem('token')
  }

  // Get stored refresh token
  getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }

  // Store tokens
  setTokens(token, refreshToken) {
    localStorage.setItem('token', token)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  // Clear tokens (logout)
  clearTokens() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  // Get auth headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (includeAuth) {
      const token = this.getToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  // Core request method
  async request(endpoint, options = {}) {
    const { method = 'GET', body, includeAuth = true, isFormData = false } = options

    const url = `${this.baseURL}${endpoint}`

    const config = {
      method,
      headers: isFormData ? {} : this.getHeaders(includeAuth),
    }

    if (isFormData && includeAuth) {
      const token = this.getToken()
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body)
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      // Handle 401 Unauthorized - try to refresh token (only for authenticated requests)
      if (response.status === 401 && includeAuth) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry original request
          return this.request(endpoint, options)
        } else {
          this.clearTokens()
          window.location.href = '/login'
          throw new Error('Session expired. Please login again.')
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // Refresh token
  async refreshToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      const data = await response.json()

      if (response.ok && data.data?.accessToken) {
        this.setTokens(data.data.accessToken, data.data.refreshToken)
        return true
      }
      return false
    } catch (error) {
      console.error('Token refresh failed:', error)
      return false
    }
  }

  // ============ AUTH APIs ============

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
      includeAuth: false,
    })

    if (data.data?.accessToken) {
      this.setTokens(data.data.accessToken, data.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.data.user))
    }

    return data
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: userData,
      includeAuth: false,
    })

    return data
  }

  async logout() {
    const refreshToken = this.getRefreshToken()
    if (refreshToken) {
      try {
        await this.request('/auth/logout', {
          method: 'POST',
          body: { refreshToken },
        })
      } catch (error) {
        console.error('Logout API error:', error)
      }
    }
    this.clearTokens()
  }

  async getCurrentUser() {
    return this.request('/auth/me')
  }

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      includeAuth: false,
    })
  }

  async resetPassword(token, password) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      includeAuth: false,
    })
  }

  async verifyEmail(token) {
    return this.request(`/auth/verify-email/${token}`, {
      method: 'GET',
      includeAuth: false,
    })
  }

  // ============ MEDICATION APIs ============

  async getMedications(isActive = true) {
    return this.request(`/medications?isActive=${isActive}`)
  }

  async getMedication(id) {
    return this.request(`/medications/${id}`)
  }

  async createMedication(medicationData) {
    return this.request('/medications', {
      method: 'POST',
      body: medicationData,
    })
  }

  async updateMedication(id, medicationData) {
    return this.request(`/medications/${id}`, {
      method: 'PUT',
      body: medicationData,
    })
  }

  async deleteMedication(id) {
    return this.request(`/medications/${id}`, {
      method: 'DELETE',
    })
  }

  async getTodaySchedule() {
    return this.request('/medications/today')
  }

  async getWeeklySchedule() {
    return this.request('/medications/weekly')
  }

  // ============ DOSE APIs ============

  async logDose(doseData) {
    return this.request('/doses/log', {
      method: 'POST',
      body: doseData,
    })
  }

  async skipDose(doseScheduleId, reason) {
    return this.request('/doses/skip', {
      method: 'POST',
      body: { doseScheduleId, reason },
    })
  }

  async getDoseHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/doses/history?${queryString}`)
  }

  async getMissedDoses(startDate, endDate) {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    return this.request(`/doses/missed?${params.toString()}`)
  }

  async getPendingDoses() {
    return this.request('/doses/pending')
  }

  // ============ ADHERENCE APIs ============

  async getAdherenceScore(period = 30) {
    return this.request(`/adherence/score?period=${period}`)
  }

  async getDailyAdherence(date) {
    return this.request(`/adherence/daily?date=${date}`)
  }

  async getStreak() {
    return this.request('/adherence/streak')
  }

  async getAdherenceRange(startDate, endDate) {
    return this.request(`/adherence/range?startDate=${startDate}&endDate=${endDate}`)
  }

  // ============ CAREGIVER APIs ============

  async getMyPatients() {
    return this.request('/caregivers/patients')
  }

  async getPatientDetail(patientId) {
    return this.request(`/caregivers/patients/${patientId}`)
  }

  async getPatientMedications(patientId) {
    return this.request(`/caregivers/patients/${patientId}/medications`)
  }

  async getPatientAdherence(patientId, period = 30) {
    return this.request(`/caregivers/patients/${patientId}/adherence?period=${period}`)
  }

  async getPatientDoseHistory(patientId, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/caregivers/patients/${patientId}/doses?${queryString}`)
  }

  async sendLinkRequest(patientEmail) {
    return this.request('/caregivers/link', {
      method: 'POST',
      body: { patientEmail },
    })
  }

  async respondToLinkRequest(linkId, accept) {
    return this.request('/caregivers/link/respond', {
      method: 'POST',
      body: { linkId, accept },
    })
  }

  async getPendingLinkRequests() {
    return this.request('/caregivers/link/pending')
  }

  async getCaregiverAlerts() {
    return this.request('/caregivers/alerts')
  }

  async markAlertRead(alertId) {
    return this.request(`/caregivers/alerts/${alertId}/read`, {
      method: 'PATCH',
    })
  }

  async unlinkPatient(patientId) {
    return this.request(`/caregivers/patients/${patientId}`, {
      method: 'DELETE',
    })
  }

  // ============ REPORT APIs ============

  async getWeeklyReport(weekStart) {
    const params = weekStart ? `?weekStart=${weekStart}` : ''
    return this.request(`/reports/weekly${params}`)
  }

  async getReportHistory() {
    return this.request('/reports/history')
  }

  async emailWeeklyReport() {
    return this.request('/reports/email', {
      method: 'POST',
    })
  }

  async getPatientReport(patientId, weekStart) {
    const params = weekStart ? `?weekStart=${weekStart}` : ''
    return this.request(`/reports/patient/${patientId}/weekly${params}`)
  }

  // ============ NOTIFICATION APIs ============

  async getNotifications() {
    return this.request('/notifications')
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count')
  }

  async markNotificationsAsRead(ids = []) {
    return this.request('/notifications/read', {
      method: 'PATCH',
      body: { ids },
    })
  }

  async deleteNotification(id) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  // ============ USER APIs ============

  async getUserProfile() {
    return this.request('/users/profile')
  }

  async updateUserProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: profileData,
    })
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('/users/change-password', {
      method: 'PUT',
      body: { currentPassword, newPassword },
    })
  }
}

// Create and export singleton instance
export const api = new ApiService()

// Export individual methods for convenience
export const {
  login,
  register,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMedications,
  createMedication,
  updateMedication,
  deleteMedication,
  getTodaySchedule,
  getWeeklySchedule,
  logDose,
  skipDose,
  getDoseHistory,
  getMissedDoses,
  getPendingDoses,
  getAdherenceScore,
  getStreak,
  getMyPatients,
  getPatientDetail,
  getCaregiverAlerts,
  getWeeklyReport,
  getNotifications,
  getUserProfile,
  updateUserProfile,
} = api

export default api
