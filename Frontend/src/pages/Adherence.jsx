import { useState, useEffect } from 'react'
import { Flame, Pill, Check, X, TrendingUp, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import CircleProgress from '../components/CircleProgress'
import { api } from '../services/api'
import Notification from '../components/Notification'

export default function Adherence() {
  const [adherenceData, setAdherenceData] = useState(null)
  const [streakData, setStreakData] = useState(null)
  const [doseHistory, setDoseHistory] = useState([])
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notification, setNotification] = useState(null)

  // Fetch adherence data on mount
  useEffect(() => {
    fetchAdherenceData()
  }, [])

  const fetchAdherenceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch adherence, streak, dose history, and medications in parallel
      const [adherenceRes, streakRes, historyRes, medsRes] = await Promise.all([
        api.getAdherenceScore(30).catch(() => ({ data: { adherenceScore: 0, taken: 0, scheduled: 0 } })),
        api.getStreak().catch(() => ({ data: { currentStreak: 0, longestStreak: 0 } })),
        api.getDoseHistory({ limit: 100 }).catch(() => ({ data: { logs: [] } })),
        api.getMedications().catch(() => ({ data: { medications: [] } }))
      ])

      setAdherenceData(adherenceRes.data)
      setStreakData(streakRes.data)
      setDoseHistory(historyRes.data?.logs || [])
      setMedications(medsRes.data?.medications || [])
    } catch (err) {
      console.error('Error fetching adherence data:', err)
      setError('Failed to load adherence data')
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats from real data
  const adherenceRate = Math.round(adherenceData?.adherenceScore || 0)
  const currentStreak = streakData?.currentStreak || 0
  const takenDoses = adherenceData?.taken || 0
  const scheduledDoses = adherenceData?.scheduled || 1
  const missedDoses = Math.max(0, scheduledDoses - takenDoses)

  // Calculate medication-wise adherence
  const getMedicationAdherence = () => {
    const medStats = {}
    
    // Initialize stats for each medication
    medications.forEach(med => {
      medStats[med.name] = { taken: 0, scheduled: 0, id: med.id }
    })

    // Count doses from history
    doseHistory.forEach(log => {
      const medName = log.medication?.name
      if (medName && medStats[medName]) {
        medStats[medName].scheduled++
        if (log.status === 'TAKEN' || log.status === 'LATE') {
          medStats[medName].taken++
        }
      }
    })

    // Transform to array with percentages
    return Object.entries(medStats)
      .map(([name, stats]) => ({
        name,
        adherence: stats.scheduled > 0 ? Math.round((stats.taken / stats.scheduled) * 100) : 0,
        doses: `${stats.taken}/${stats.scheduled}`,
        color: stats.taken / (stats.scheduled || 1) >= 0.9 ? 'from-[#22C55E]' : 
               stats.taken / (stats.scheduled || 1) >= 0.7 ? 'from-[#3E6FA3]' : 'from-[#EF4444]'
      }))
      .filter(med => med.adherence > 0)
      .slice(0, 6) // Limit to top 6
  }

  const medicationAdherence = getMedicationAdherence()

  // Calculate time-based adherence
  const getTimeBasedAdherence = () => {
    const timeStats = {
      morning: { taken: 0, scheduled: 0 },
      afternoon: { taken: 0, scheduled: 0 },
      evening: { taken: 0, scheduled: 0 }
    }

    doseHistory.forEach(log => {
      const hour = new Date(log.takenAt).getHours()
      let timeSlot = 'evening'
      if (hour < 12) timeSlot = 'morning'
      else if (hour < 17) timeSlot = 'afternoon'

      timeStats[timeSlot].scheduled++
      if (log.status === 'TAKEN' || log.status === 'LATE') {
        timeStats[timeSlot].taken++
      }
    })

    return [
      { label: 'Morning', emoji: '', percentage: Math.round((timeStats.morning.taken / (timeStats.morning.scheduled || 1)) * 100), color: 'from-blue-500 to-cyan-500' },
      { label: 'Afternoon', emoji: '', percentage: Math.round((timeStats.afternoon.taken / (timeStats.afternoon.scheduled || 1)) * 100), color: 'from-amber-500 to-orange-500' },
      { label: 'Evening', emoji: '', percentage: Math.round((timeStats.evening.taken / (timeStats.evening.scheduled || 1)) * 100), color: 'from-indigo-500 to-purple-500' }
    ]
  }

  const timeBasedAdherence = getTimeBasedAdherence()

  // Generate monthly trend (last 3 months)
  const getMonthlyTrend = () => {
    const months = []
    const now = new Date()
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: d.toLocaleString('default', { month: 'long' }),
        adherence: adherenceRate // Using current rate for demo - ideally fetch historical data
      })
    }
    return months
  }

  const monthlyTrend = getMonthlyTrend()

  const StatCard = ({ icon: Icon, label, value, subtext, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl shadow-md border border-gray-200/50 p-6 transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-white/30 backdrop-blur-sm">
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-white/80 text-sm font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/70 text-xs">{subtext}</p>
    </div>
  )

  if (loading) {
    return (
      <DashboardLayout pageTitle="Adherence Report" pageSubtitle="Monitor your medication compliance and progress">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-[#2F5B8C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout pageTitle="Adherence Report" pageSubtitle="Monitor your medication compliance and progress">
      {/* Notification */}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
          <button onClick={fetchAdherenceData} className="ml-4 underline">Retry</button>
        </div>
      )}

      <div className="space-y-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center transition-all duration-300 hover:shadow-lg">
            <div className="flex justify-center mb-4">
              <CircleProgress percentage={adherenceRate} size={100} />
            </div>
            <p className="text-gray-600 text-sm font-medium">Overall Adherence</p>
            <p className="text-3xl font-bold text-[#2F5B8C] mt-3">{adherenceRate}%</p>
            <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
          </div>

          <StatCard 
            icon={Flame}
            label="Current Streak"
            value={`${currentStreak}d`}
            subtext="Days in a row"
            gradient="from-orange-500 to-red-500"
          />

          <StatCard 
            icon={Check}
            label="Doses Taken"
            value={takenDoses}
            subtext={`Out of ${scheduledDoses} scheduled`}
            gradient="from-emerald-500 to-teal-500"
          />

          <StatCard 
            icon={X}
            label="Missed Doses"
            value={missedDoses}
            subtext="Keep improving!"
            gradient="from-red-500 to-pink-500"
          />
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3]">
              <TrendingUp className="text-white" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Monthly Trend</h3>
          </div>
          <div className="space-y-6">
            {monthlyTrend.map((item) => (
              <div key={item.month}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{item.month}</span>
                  <span className="font-bold text-[#2F5B8C] bg-blue-50 px-3 py-1 rounded-lg text-sm">{item.adherence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-sm">
                  <div 
                    className="bg-gradient-to-r from-[#2F5B8C] via-[#3E6FA3] to-[#22C55E] h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${item.adherence}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Time-based Adherence */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-8">Adherence by Time</h3>
            <div className="space-y-6">
              {timeBasedAdherence.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">{item.label}</span>
                    <span className={`font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
                    <div 
                      className={`bg-gradient-to-r ${item.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-br from-[#2F5B8C]/5 to-[#3E6FA3]/5 rounded-2xl shadow-md border border-[#3E6FA3]/20 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3]">
                <AlertCircle className="text-white" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Key Insights</h3>
            </div>
            <div className="space-y-4">
              {adherenceRate < 80 && (
                <div className="bg-white rounded-xl p-5 border-l-4 border-orange-500 shadow-sm hover:shadow-md transition-all">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Focus Area</p>
                  <p className="text-sm text-gray-600">Your adherence is below 80%. Try to establish a consistent routine with your medications.</p>
                </div>
              )}
              {currentStreak >= 7 && (
                <div className="bg-white rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-all">
                  <p className="font-semibold text-gray-900 text-sm mb-2">Great Streak!</p>
                  <p className="text-sm text-gray-600">You're on a {currentStreak}-day streak! Keep up the excellent work!</p>
                </div>
              )}
              <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-all">
                <p className="font-semibold text-gray-900 text-sm mb-2">Tip</p>
                <p className="text-sm text-gray-600">Enable push notifications to get timely reminders for your medications.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Medication Adherence */}
        {medicationAdherence.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3]">
                <Pill className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Medication-wise Adherence</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {medicationAdherence.map((med) => (
                <div key={med.name} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <h4 className="font-bold text-gray-900 mb-4">{med.name}</h4>
                  <div className="mb-4">
                    <p className={`text-4xl font-bold bg-gradient-to-r ${med.color} to-cyan-500 bg-clip-text text-transparent`}>
                      {med.adherence}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{med.doses} doses</p>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r ${med.color} to-cyan-500 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${med.adherence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
