import { useState } from 'react'
import Navbar from '../components/Navbar'
import Card from '../components/Card'

export default function Schedule() {
  const [medications] = useState([
    {
      id: 1,
      name: 'Aspirin',
      dosage: '100mg',
      time: '8:00 AM',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      color: 'bg-blue-100'
    },
    {
      id: 2,
      name: 'Metformin',
      dosage: '500mg',
      time: '2:00 PM',
      days: ['Mon', 'Wed', 'Fri'],
      color: 'bg-green-100'
    },
    {
      id: 3,
      name: 'Vitamin D',
      dosage: '1000IU',
      time: '6:00 PM',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      color: 'bg-yellow-100'
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">📅 Medicine Schedule</h1>
        <p className="text-gray-600 mb-8">Your complete medication timetable</p>

        <div className="space-y-6">
          {medications.map((med) => (
            <Card key={med.id} className={med.color}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-primary-dark">{med.name}</h3>
                  <p className="text-gray-600">{med.dosage}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-blue">{med.time}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {med.days.map((day) => (
                  <span
                    key={day}
                    className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-primary-dark border-2 border-primary-blue"
                  >
                    {day}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Weekly View */}
        <Card className="mt-12 p-8">
          <h2 className="text-2xl font-bold text-primary-dark mb-6">Weekly Overview</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary-blue">
                  <th className="text-left py-3 px-4 font-bold text-primary-dark">Time</th>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <th
                      key={day}
                      className="text-center py-3 px-4 font-bold text-primary-dark"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['8:00 AM', '2:00 PM', '6:00 PM'].map((time) => (
                  <tr key={time} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-4 px-4 font-semibold text-gray-700">{time}</td>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                      <td key={day} className="text-center py-4 px-4">
                        <div className="w-8 h-8 mx-auto bg-green-100 rounded-clay text-green-700 flex items-center justify-center text-sm">
                          ✓
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
