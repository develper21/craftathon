import { useState, useEffect } from 'react'

export default function Notification({
  message,
  type = 'info',
  duration = 3000,
  onClose = null,
}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor =
    type === 'success'
      ? 'bg-green-100 border-green-300'
      : type === 'error'
        ? 'bg-red-100 border-red-300'
        : 'bg-blue-100 border-blue-300'

  const textColor =
    type === 'success'
      ? 'text-green-700'
      : type === 'error'
        ? 'text-red-700'
        : 'text-blue-700'

  return (
    <div className={`fixed top-4 right-4 px-6 py-4 rounded-clay border-2 ${bgColor} shadow-clay z-50 max-w-sm`}>
      <p className={`${textColor} font-semibold`}>{message}</p>
    </div>
  )
}
