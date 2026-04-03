import { useState } from 'react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'

export default function Alerts() {
  const [alerts] = useState([
    {
      id: 1,
      type: 'missed',
      severity: 'high',
      patient: 'Mike Johnson',
      medicine: 'Asthma Inhaler',
      time: '2:00 PM',
      date: 'Today',
      message: 'Missed medication dose'
    },
    {
      id: 2,
      type: 'lowAdherence',
      severity: 'medium',
      patient: 'Jane Smith',
      adherence: '65%',
      date: 'Today',
      message: 'Low adherence rate this week'
    },
    {
      id: 3,
      type: 'missed',
      severity: 'high',
      patient: 'Sarah Williams',
      medicine: 'COPD Medication',
      time: '8:00 AM',
      date: 'Yesterday',
      message: 'Missed morning dose'
    },
    {
      id: 4,
      type: 'warning',
      severity: 'medium',
      patient: 'John Doe',
      message: '3 days without check-in',
      date: '2 days ago'
    }
  ])

  const [filter, setFilter] = useState('all')

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter)

  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'bg-red-100 border-red-300'
    if (severity === 'medium') return 'bg-yellow-100 border-yellow-300'
    return 'bg-blue-100 border-blue-300'
  }

  const getSeverityBadge = (severity) => {
    if (severity === 'high') return 'bg-red-500 text-white'
    if (severity === 'medium') return 'bg-yellow-500 text-white'
    return 'bg-blue-500 text-white'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">🚨 Patient Alerts</h1>
        <p className="text-gray-600 mb-8">Real-time notifications about your patients</p>

        {/* Filter Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            className="text-sm"
          >
            All ({alerts.length})
          </Button>
          <Button
            variant={filter === 'high' ? 'primary' : 'secondary'}
            onClick={() => setFilter('high')}
            className="text-sm"
          >
            🔴 High ({alerts.filter(a => a.severity === 'high').length})
          </Button>
          <Button
            variant={filter === 'medium' ? 'primary' : 'secondary'}
            onClick={() => setFilter('medium')}
            className="text-sm"
          >
            🟡 Medium ({alerts.filter(a => a.severity === 'medium').length})
          </Button>
        </div>

        {/* Alerts List */}
        {filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`p-6 border-l-4 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(
                          alert.severity
                        )}`}
                      >
                        {alert.severity === 'high'
                          ? '🔴 HIGH'
                          : alert.severity === 'medium'
                            ? '🟡 MEDIUM'
                            : '🔵 INFO'}
                      </span>
                      <span className="text-gray-500 text-sm">{alert.date}</span>
                    </div>

                    <h3 className="text-lg font-bold text-primary-dark mb-1">
                      {alert.patient}
                    </h3>
                    <p className="text-gray-700 font-semibold mb-1">{alert.message}</p>

                    {alert.medicine && (
                      <p className="text-gray-600 text-sm">
                        💊 {alert.medicine} at {alert.time}
                      </p>
                    )}

                    {alert.adherence && (
                      <p className="text-gray-600 text-sm">
                        📊 Current adherence: {alert.adherence}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="primary" className="text-sm">
                      Contact
                    </Button>
                    <Button variant="secondary" className="text-sm">
                      Dismiss
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-primary-dark mb-2">All Clear!</h3>
            <p className="text-gray-600">
              No new alerts for your patients. Great adherence!
            </p>
          </Card>
        )}

        {/* Alert Statistics */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-primary-dark mb-6">Alert Summary</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <div className="text-4xl mb-2">🔴</div>
              <p className="text-gray-600 text-sm">High Priority</p>
              <p className="text-3xl font-bold text-red-500">
                {alerts.filter(a => a.severity === 'high').length}
              </p>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-2">🟡</div>
              <p className="text-gray-600 text-sm">Medium Priority</p>
              <p className="text-3xl font-bold text-yellow-500">
                {alerts.filter(a => a.severity === 'medium').length}
              </p>
            </Card>

            <Card className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600 text-sm">Total Alerts</p>
              <p className="text-3xl font-bold text-primary-blue">{alerts.length}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
