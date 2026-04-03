import Navbar from '../components/Navbar'
import Card from '../components/Card'
import CircleProgress from '../components/CircleProgress'

export default function Adherence() {
  const monthlyData = [
    { month: 'January', adherence: 65 },
    { month: 'February', adherence: 72 },
    { month: 'March', adherence: 78 },
    { month: 'April', adherence: 85 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-bg to-white-text">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-primary-dark mb-2">📊 Adherence Dashboard</h1>
        <p className="text-gray-600 mb-8">Track your medication compliance</p>

        {/* Current Month */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="flex flex-col items-center justify-center p-12">
            <CircleProgress percentage={85} size={180} title="This Month" />
            <p className="mt-6 text-center text-gray-600">
              Excellent! You're maintaining great medication adherence.
            </p>
          </Card>

          <Card className="p-8">
            <h3 className="text-2xl font-bold text-primary-dark mb-8">Performance</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-semibold">Current Streak</span>
                  <span className="text-2xl font-bold text-primary-blue">🔥 18 Days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary-blue h-3 rounded-full"
                    style={{ width: '90%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-semibold">Doses Taken</span>
                  <span className="text-2xl font-bold text-green-500">68/80</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: '85%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-semibold">Missed Doses</span>
                  <span className="text-2xl font-bold text-red-500">12/80</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{ width: '15%' }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-dark mb-8">Monthly Trend</h2>
          <div className="space-y-6">
            {monthlyData.map((data) => (
              <div key={data.month}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-700">{data.month}</span>
                  <span className="font-bold text-primary-blue">{data.adherence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-primary-blue to-primary-dark h-4 rounded-full transition-all"
                    style={{ width: `${data.adherence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-8 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300">
          <h3 className="text-2xl font-bold text-yellow-800 mb-4">💡 Tips to Improve</h3>
          <ul className="space-y-3">
            <li className="flex gap-3 text-yellow-900">
              <span className="text-xl">✓</span>
              <span>Set phone reminders for your medication times</span>
            </li>
            <li className="flex gap-3 text-yellow-900">
              <span className="text-xl">✓</span>
              <span>Use a pill organizer to prepare your weekly doses</span>
            </li>
            <li className="flex gap-3 text-yellow-900">
              <span className="text-xl">✓</span>
              <span>Take medications at the same time every day</span>
            </li>
            <li className="flex gap-3 text-yellow-900">
              <span className="text-xl">✓</span>
              <span>Share your progress with your doctor or caregiver</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
