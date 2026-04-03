// Push Notification Service for Medication Reminders
// Handles browser notification permissions and display

class PushNotificationService {
  constructor() {
    this.permission = 'default'
    this.supported = 'Notification' in window && 'serviceWorker' in navigator
  }

  // Check if browser supports notifications
  isSupported() {
    return this.supported
  }

  // Request permission from user
  async requestPermission() {
    if (!this.isSupported()) {
      console.log('Push notifications not supported')
      return false
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  // Get current permission status
  getPermission() {
    if (!this.isSupported()) return 'unsupported'
    return Notification.permission
  }

  // Show a notification
  async showNotification(title, options = {}) {
    if (!this.isSupported()) {
      console.log('Push notifications not supported')
      return false
    }

    if (this.getPermission() !== 'granted') {
      console.log('Notification permission not granted')
      return false
    }

    const defaultOptions = {
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'medication-reminder',
      requireInteraction: true,
      actions: [
        { action: 'taken', title: '✓ Taken' },
        { action: 'skip', title: 'Skip' }
      ],
      data: {}
    }

    const mergedOptions = { ...defaultOptions, ...options }

    try {
      // Try to use service worker for better reliability
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, mergedOptions)
        })
      } else {
        // Fallback to basic notification
        new Notification(title, mergedOptions)
      }
      return true
    } catch (error) {
      console.error('Error showing notification:', error)
      // Fallback
      try {
        new Notification(title, mergedOptions)
        return true
      } catch (e) {
        console.error('Fallback notification failed:', e)
        return false
      }
    }
  }

  // Show medication reminder
  showMedicationReminder(medicationName, dosage, time) {
    return this.showNotification(
      `💊 Time for ${medicationName}`,
      {
        body: `Take ${dosage} at ${time}`,
        tag: `med-${medicationName}-${time}`,
        data: {
          type: 'medication_reminder',
          medicationName,
          dosage,
          time
        }
      }
    )
  }

  // Show missed dose alert
  showMissedDoseAlert(medicationName, scheduledTime) {
    return this.showNotification(
      `⚠️ Missed: ${medicationName}`,
      {
        body: `You missed your dose scheduled for ${scheduledTime}`,
        tag: `missed-${medicationName}`,
        requireInteraction: true,
        data: {
          type: 'missed_dose',
          medicationName,
          scheduledTime
        }
      }
    )
  }

  // Show caregiver alert
  showCaregiverAlert(patientName, medicationName, time) {
    return this.showNotification(
      `🚨 ${patientName} missed medication`,
      {
        body: `${medicationName} was not taken at ${time}`,
        tag: `caregiver-alert-${patientName}`,
        requireInteraction: true,
        data: {
          type: 'caregiver_alert',
          patientName,
          medicationName,
          time
        }
      }
    )
  }

  // Schedule notification (using setTimeout - for demo)
  scheduleNotification(title, options, delayMs) {
    setTimeout(() => {
      this.showNotification(title, options)
    }, delayMs)
  }

  // Close all notifications
  async closeAll() {
    if (!this.isSupported()) return

    try {
      const registration = await navigator.serviceWorker.ready
      const notifications = await registration.getNotifications()
      notifications.forEach(notification => notification.close())
    } catch (error) {
      console.error('Error closing notifications:', error)
    }
  }
}

// Create singleton instance
export const pushNotifications = new PushNotificationService()

// React hook for easy integration
export function usePushNotifications() {
  const requestPermission = () => pushNotifications.requestPermission()
  const showReminder = (med, dosage, time) => 
    pushNotifications.showMedicationReminder(med, dosage, time)
  const showMissed = (med, time) => 
    pushNotifications.showMissedDoseAlert(med, time)
  
  return {
    supported: pushNotifications.isSupported(),
    permission: pushNotifications.getPermission(),
    requestPermission,
    showReminder,
    showMissed
  }
}

export default pushNotifications
