import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Card from '../components/Card'
import Button from '../components/Button'

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [patients] = React.useState([
    {
      id: 1,
      name: 'John Doe',
      condition: 'Diabetes Type 2',
      adherence: 85,
      medications: 3,
      lastCheck: '2 hours ago'
    },
    {
      id: 2,
      name: 'Jane Smith',
      condition: 'Hypertension',
      adherence: 72,
      medications: 2,
      lastCheck: '1 day ago'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      condition: 'Asthma',
      adherence: 65,
      medications: 2,
      lastCheck: '3 hours ago'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      condition: 'COPD',
      adherence: 78,
      medications: 4,
      lastCheck: '30 mins ago'
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-dark">
            👋 Welcome, Dr. {user?.name || 'Doctor'}!
          </h1>
          <p className="text-gray-600 mt-2">Monitor your patients' medication adherence</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2"></div>
            <p className="text-gray-600 text-sm">Total Patients</p>
            <p className="text-3xl font-bold text-primary-blue">4</p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-gray-600 text-sm">Low Adherence</p>
            <p className="text-3xl font-bold text-red-500">1</p>
          </Card>

          <Card className="text-center">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-2"></div>
            <p className="text-gray-600 text-sm">Avg Adherence</p>
            <p className="text-3xl font-bold text-green-500">75%</p>
          </Card>

          <Card className="text-center">
            <div className="text-4xl mb-2">🚨</div>
            <p className="text-gray-600 text-sm">Alerts</p>
            <p className="text-3xl font-bold text-yellow-500">2</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-8 mb-8">
          <h3 className="text-xl font-bold text-primary-dark mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/alerts">
              <Button variant="primary" className="w-full">
                🚨 View Alerts
              </Button>
            </Link>
            <Button variant="secondary" className="w-full">
              ➕ Add Patient
            </Button>
            <Button variant="secondary" className="w-full">
              Reports
            </Button>
          </div>
        </Card>

        {/* Patients List */}
        <h2 className="text-2xl font-bold text-primary-dark mb-6">My Patients</h2>
        <div className="grid gap-6">
          {patients.map((patient) => (
            <Link key={patient.id} to={`/patient/${patient.id}`}>
              <Card className="hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary-dark">{patient.name}</h3>
                    <p className="text-gray-600">{patient.condition}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      patient.adherence >= 80
                        ? 'text-green-500'
                        : patient.adherence >= 70
                          ? 'text-yellow-500'
                          : 'text-red-500'
                    }`}>
                      {patient.adherence}%
                    </div>
                    <p className="text-xs text-gray-500">Adherence</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className={`h-3 rounded-full ${
                      patient.adherence >= 80
                        ? 'bg-green-500'
                        : patient.adherence >= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${patient.adherence}%` }}
                  />
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>{patient.medications} medications</span>
                  <span>Last check: {patient.lastCheck}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
