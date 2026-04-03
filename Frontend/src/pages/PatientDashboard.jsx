import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import CircleProgress from '../components/CircleProgress'
import Notification from '../components/Notification'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [medications] = useState([
    { id: 1, name: 'Aspirin', dosage: '100mg', nextDose: '2:00 PM', taken: false },
    { id: 2, name: 'Metformin', dosage: '500mg', nextDose: '6:00 PM', taken: true },
    { id: 3, name: 'Lisinopril', dosage: '10mg', nextDose: '8:00 AM', taken: true },
  ])
  const [notification, setNotification] = useState(null)

  const handleMarkAsTaken = (id) => {
    setNotification({
      message: `Medication marked as taken ✓`,
      type: 'success'
    })
  }

  const handleSkip = (id) => {
    setNotification({
      message: `Dose skipped. Please contact your doctor if needed.`,
      type: 'error'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-dark">
            👋 Hello, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">Today's medication schedule</p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Adherence */}
          <Card className="flex flex-col items-center justify-center p-8">
            <CircleProgress percentage={78} size={150} title="This Month" />
            <p className="mt-4 text-center text-gray-600 text-sm">
              Great job! You're on track with your medication
            </p>
          </Card>

          {/* Quick Stats */}
          <Card className="p-8">
            <h3 className="text-lg font-bold text-primary-dark mb-6">Today</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Medications:</span>
                <span className="text-2xl font-bold text-primary-blue">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Taken:</span>
                <span className="text-2xl font-bold text-green-500">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Remaining:</span>
                <span className="text-2xl font-bold text-yellow-500">1</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-8">
            <h3 className="text-lg font-bold text-primary-dark mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/add-medication" className="block">
                <Button variant="primary" className="w-full">
                  + Add Medication
                </Button>
              </Link>
              <Link to="/schedule" className="block">
                <Button variant="secondary" className="w-full">
                  📅 View Schedule
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Today's Medications */}
        <h2 className="text-2xl font-bold text-primary-dark mb-6">Today's Medications</h2>
        <div className="space-y-4">
          {medications.map((med) => (
            <Card key={med.id} className="flex justify-between items-center p-6">
              <div>
                <h4 className="text-lg font-bold text-primary-dark">{med.name}</h4>
                <p className="text-gray-600">{med.dosage}</p>
                <p className="text-sm text-primary-blue font-semibold mt-2">
                  Next: {med.nextDose}
                </p>
              </div>
              <div className="flex gap-3">
                {med.taken ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-clay text-green-700 font-semibold">
                    ✓ Taken
                  </div>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => handleMarkAsTaken(med.id)}
                      className="text-sm"
                    >
                      ✓ Take Now
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleSkip(med.id)}
                      className="text-sm"
                    >
                      Skip
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Adherence Streak */}
        <Card className="mt-8 p-8 text-center bg-gradient-to-r from-primary-blue to-primary-dark text-white">
          <h3 className="text-2xl font-bold mb-2">🔥 Current Streak</h3>
          <p className="text-4xl font-bold">15 Days</p>
          <p className="mt-2 opacity-90">Keep going! You're doing amazing.</p>
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
