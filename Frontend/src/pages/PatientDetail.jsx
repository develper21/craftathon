import DashboardLayout from '../components/DashboardLayout'
import CircleProgress from '../components/CircleProgress'

export default function PatientDetail() {
  const patient = {
    name: 'John Smith',
    age: 45,
    condition: 'Hypertension & Diabetes Type 2',
    adherence: 78
  }

  const medications = [
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', adherence: 85 },
    { id: 2, name: 'Metformin', dosage: '1000mg', frequency: 'Twice daily', adherence: 72 },
    { id: 3, name: 'Aspirin', dosage: '500mg', frequency: 'Once daily', adherence: 88 },
  ]

  return (
    <DashboardLayout pageTitle={patient.name} pageSubtitle="View comprehensive patient information and adherence">
      <div className="space-y-8">
        {/* Patient Header */}
        <div className="bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3] rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16a34a] flex items-center justify-center font-bold text-4xl">
                J
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1">{patient.name}</h2>
                <p className="text-blue-100 text-lg mb-2">{patient.condition}</p>
                <p className="text-blue-200 text-sm">Age: {patient.age} years</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-blue-200 text-sm mb-2">Overall Adherence</p>
              <CircleProgress percentage={patient.adherence} size="md" />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-2">Medications</p>
            <p className="text-3xl font-bold text-[#2F5B8C]">{medications.length}</p>
            <p className="text-xs text-gray-500 mt-3">Currently prescribed</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-2">Doses Taken</p>
            <p className="text-3xl font-bold text-[#22C55E]">42</p>
            <p className="text-xs text-gray-500 mt-3">Out of 50 this month</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-2">Missed Doses</p>
            <p className="text-3xl font-bold text-red-600">8</p>
            <p className="text-xs text-gray-500 mt-3">Mostly evenings</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-2">Current Streak</p>
            <p className="text-3xl font-bold text-orange-600">12</p>
            <p className="text-xs text-gray-500 mt-3">Days consecutive</p>
          </div>
        </div>

        {/* Medication Details */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Medications & Adherence</h3>
          <div className="space-y-6">
            {medications.map((med) => (
              <div key={med.id} className="pb-6 border-b border-gray-200 last:border-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{med.name}</h4>
                    <p className="text-gray-600 text-sm mt-1">{med.dosage} • {med.frequency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 font-medium mb-2">Adherence</p>
                    <p className={`text-2xl font-bold ${med.adherence >= 80 ? 'text-[#22C55E]' : med.adherence >= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                      {med.adherence}%
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${med.adherence >= 80 ? 'bg-[#22C55E]' : med.adherence >= 70 ? 'bg-orange-500' : 'bg-red-500'}`}
                    style={{ width: `${med.adherence}%` }}
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <button className="px-4 py-2 rounded-lg bg-blue-100 text-[#2F5B8C] font-semibold hover:bg-blue-200 text-sm">
                    Send Reminder
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 text-sm">
                    Edit Dose
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adherence Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Trend</h3>
            <div className="space-y-4">
              {[
                { week: 'Week 1', adherence: 72 },
                { week: 'Week 2', adherence: 75 },
                { week: 'Week 3', adherence: 82 },
                { week: 'Week 4', adherence: 78 }
              ].map((item) => (
                <div key={item.week}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{item.week}</span>
                    <span className="font-bold text-[#2F5B8C]">{item.adherence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#2F5B8C] h-2 rounded-full" style={{ width: `${item.adherence}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-8 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Clinical Observations</h3>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-400">
                <p className="font-semibold text-gray-900 text-sm">✓ Improving</p>
                <p className="text-sm text-gray-600 mt-2">Patient's adherence has improved from 72% to 78% over the month.</p>
              </div>

              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-400">
                <p className="font-semibold text-gray-900 text-sm">⚠️ Pattern Alert</p>
                <p className="text-sm text-gray-600 mt-2">Consistent pattern of missing evening doses. Consider reminder timing adjustment.</p>
              </div>

              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-400">
                <p className="font-semibold text-gray-900 text-sm">Recommendation</p>
                <p className="text-sm text-gray-600 mt-2">Schedule follow-up appointment to discuss medication side effects.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-lg bg-[#2F5B8C] text-white font-semibold hover:shadow-lg active:scale-95">
            Send Appointment Request
          </button>
          <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white font-semibold hover:shadow-lg active:scale-95">
            Schedule Follow-up
          </button>
          <button className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">
            View Full History
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
