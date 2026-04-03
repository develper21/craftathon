import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import Notification from '../components/Notification'

export default function AddMedication() {
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [time, setTime] = useState('09:00')
  const [notification, setNotification] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!medicineName || !dosage || !time) {
      setNotification({
        message: 'Please fill all fields',
        type: 'error'
      })
      return
    }

    setNotification({
      message: 'Medication added successfully!',
      type: 'success'
    })

    setTimeout(() => {
      navigate('/dashboard')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <Card>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary-dark">💊 Add New Medication</h1>
            <p className="text-gray-600 mt-2">Keep track of your medicines</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Medicine Name"
              type="text"
              placeholder="e.g., Aspirin"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              required
            />

            <Input
              label="Dosage"
              type="text"
              placeholder="e.g., 100mg"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="clay-input"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="twicedaily">Twice Daily</option>
                <option value="asneeded">As Needed</option>
              </select>
            </div>

            <Input
              label="Time to Take"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Button type="submit" variant="primary" className="text-lg">
                Add Medication
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="text-lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}
