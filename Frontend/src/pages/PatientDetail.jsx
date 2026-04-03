import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'
import CircleProgress from '../components/CircleProgress'

export default function PatientDetail() {
  const { patientId } = useParams()
  const navigate = useNavigate()

  // Mock patient data
  const patient = {
    id: patientId,
    name: 'John Doe',
    age: 45,
    condition: 'Diabetes Type 2',
    adherence: 85,
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', taken: 34, missed: 2 },
      { name: 'Insulin', dosage: '20 units', frequency: 'Daily', taken: 23, missed: 1 },
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', taken: 23, missed: 0 }
    ]
  }

  const missedDoses = [
    { date: '2024-03-28', medicine: 'Metformin', time: '2:00 PM' },
    { date: '2024-03-25', medicine: 'Insulin', time: '8:00 AM' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={() => navigate('/doctor-dashboard')}
          className="mb-8"
        >
          ← Back to Dashboard
        </Button>

        {/* Patient Header */}
        <Card className="p-12 mb-8 bg-gradient-to-r from-primary-blue to-primary-dark text-white">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-4xl mb-4">👤</div>
              <h1 className="text-4xl font-bold mb-2">{patient.name}</h1>
              <p className="text-lg opacity-90">
                Age: {patient.age} | Condition: {patient.condition}
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-2">{patient.adherence}%</div>
              <p className="text-lg">Overall Adherence</p>
            </div>
          </div>
        </Card>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Adherence Circle */}
          <Card className="flex flex-col items-center justify-center p-8">
            <CircleProgress percentage={patient.adherence} size={150} title="This Month" />
          </Card>

          {/* Quick Actions */}
          <Card className="p-8">
            <h3 className="text-xl font-bold text-primary-dark mb-6">Patient Actions</h3>
            <div className="space-y-3">
              <Button variant="primary" className="w-full">
                📞 Send Message
              </Button>
              <Button variant="primary" className="w-full">
                🔔 Send Reminder
              </Button>
              <Button variant="secondary" className="w-full">
                📋 Edit Prescription
              </Button>
            </div>
          </Card>
        </div>

        {/* Medications */}
        <h2 className="text-2xl font-bold text-primary-dark mb-6">Current Medications</h2>
        <div className="grid gap-6 mb-8">
          {patient.medications.map((med, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary-dark">{med.name}</h3>
                  <p className="text-gray-600">{med.dosage} - {med.frequency}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Doses Taken</p>
                  <p className="text-2xl font-bold text-green-500">{med.taken}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Missed</p>
                  <p className="text-2xl font-bold text-red-500">{med.missed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compliance</p>
                  <p className="text-2xl font-bold text-primary-blue">
                    {Math.round((med.taken / (med.taken + med.missed)) * 100)}%
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Missed Doses */}
        {missedDoses.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-6">⚠️ Missed Doses</h2>
            <div className="space-y-4 mb-8">
              {missedDoses.map((dose, idx) => (
                <Card key={idx} className="p-6 border-l-4 border-red-500 bg-red-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-red-700">{dose.medicine}</h4>
                      <p className="text-gray-600">{dose.time}</p>
                      <p className="text-sm text-gray-500 mt-2">Date: {dose.date}</p>
                    </div>
                    <Button variant="primary" className="text-sm">
                      Contact Patient
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Trend Graph (Placeholder) */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-primary-dark mb-6">Adherence Trend</h2>
          <div className="h-64 flex items-end justify-between gap-2 p-4 bg-gray-50 rounded-clay">
            {[65, 70, 72, 75, 78, 80, 82, 85].map((value, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-gradient-to-t from-primary-blue to-primary-dark rounded-t-clay transition-all"
                  style={{ height: `${value * 2}px` }}
                />
                <p className="text-xs mt-2 text-gray-600">{value}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
