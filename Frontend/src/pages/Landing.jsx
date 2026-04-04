import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Logo from '../components/Logo'

export default function Landing() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && user) {
      const userRole = user.role?.toUpperCase()
      if (userRole === 'CAREGIVER' || userRole === 'DOCTOR') {
        navigate('/caregiver/dashboard', { replace: true })
      } else if (userRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else if (userRole === 'PATIENT') {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isAuthenticated, isLoading, user, navigate])

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]"><div className="text-gray-600">Loading...</div></div>
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />

      {/* Hero Section - Two Column Layout */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2F5B8C] to-[#3E6FA3] pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <div className="relative z-10">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-sm font-semibold text-white/90">
                  Trusted by healthcare professionals
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-tight">
                Never Miss Your Medicine Again
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed font-light">
                Intelligent medication reminders combined with real-time caregiver alerts. Transform adherence into habit.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/signup">
                  <button className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#3E6FA3] to-[#22C55E] text-white font-semibold rounded-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    Get Started
                  </button>
                </Link>
                <Link to="/login">
                  <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#2F5B8C] font-semibold rounded-lg border-2 border-white hover:bg-white/90 transition-all duration-300">
                    Sign In
                  </button>
                </Link>
              </div>

              {/* Key Points */}
              <div className="flex flex-col sm:flex-row gap-6 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#22C55E] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#22C55E] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#22C55E] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Column - Professional Image/Mockup */}
            <div className="hidden lg:block relative">
              <div className="relative">
                {/* Floating Effect Background */}
                <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl" />
                
                {/* Main Image Container */}
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-float">
                  {/* Healthcare Dashboard Mockup - Professional Abstract Image */}
                  <svg viewBox="0 0 500 600" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                    {/* Background */}
                    <rect width="500" height="600" fill="#F9FAFB" />
                    
                    {/* Header Bar */}
                    <rect width="500" height="60" fill="#2F5B8C" />
                    <text x="30" y="40" fontSize="20" fontWeight="bold" fill="white">MediTrack Dashboard</text>
                    
                    {/* Main Content Area */}
                    <rect x="30" y="90" width="440" height="480" fill="white" stroke="#E5E7EB" strokeWidth="2" rx="8" />
                    
                    {/* Title */}
                    <text x="50" y="130" fontSize="18" fontWeight="bold" fill="#2F5B8C">Your Medications</text>
                    
                    {/* Medication Cards */}
                    {/* Card 1 */}
                    <rect x="50" y="155" width="180" height="100" fill="#EAEFF5" stroke="#3E6FA3" strokeWidth="2" rx="8" />
                    <circle cx="75" cy="180" r="15" fill="#3E6FA3" />
                    <text x="100" y="185" fontSize="13" fontWeight="bold" fill="#2F5B8C">Aspirin</text>
                    <text x="100" y="203" fontSize="11" fill="#666">2x Daily</text>
                    <circle cx="160" cy="245" r="20" opacity="0.2" strokeWidth="3" stroke="#22C55E" fill="none" />
                    <text x="165" y="250" fontSize="12" fontWeight="bold" fill="#22C55E">Done</text>
                    
                    {/* Card 2 */}
                    <rect x="270" y="155" width="180" height="100" fill="#EAEFF5" stroke="#3E6FA3" strokeWidth="2" rx="8" />
                    <circle cx="295" cy="180" r="15" fill="#3E6FA3" />
                    <text x="320" y="185" fontSize="13" fontWeight="bold" fill="#2F5B8C">Metformin</text>
                    <text x="320" y="203" fontSize="11" fill="#666">Morning</text>
                    <circle cx="340" cy="245" r="20" opacity="0.3" strokeWidth="3" stroke="#F97316" fill="none" />
                    <text x="335" y="250" fontSize="11" fontWeight="bold" fill="#F97316">Pending</text>
                    
                    {/* Progress Section */}
                    <text x="50" y="295" fontSize="16" fontWeight="bold" fill="#2F5B8C">Weekly Progress</text>
                    
                    {/* Progress Bars */}
                    <rect x="50" y="320" width="400" height="8" fill="#E5E7EB" rx="4" />
                    <rect x="50" y="320" width="280" height="8" fill="#22C55E" rx="4" />
                    <text x="50" y="350" fontSize="13" fontWeight="bold" fill="#2F5B8C">Adherence Rate: 87%</text>
                    
                    {/* Stats */}
                    <rect x="50" y="380" width="130" height="70" fill="#EAEFF5" stroke="#3E6FA3" strokeWidth="1" rx="6" />
                    <text x="70" y="400" fontSize="12" fontWeight="bold" fill="#666">Taken</text>
                    <text x="85" y="425" fontSize="28" fontWeight="bold" fill="#22C55E">21</text>
                    
                    <rect x="210" y="380" width="130" height="70" fill="#EAEFF5" stroke="#3E6FA3" strokeWidth="1" rx="6" />
                    <text x="230" y="400" fontSize="12" fontWeight="bold" fill="#666">Missed</text>
                    <text x="250" y="425" fontSize="28" fontWeight="bold" fill="#EF4444">3</text>
                    
                    <rect x="370" y="380" width="80" height="70" fill="#EAEFF5" stroke="#3E6FA3" strokeWidth="1" rx="6" />
                    <text x="380" y="400" fontSize="12" fontWeight="bold" fill="#666">Streak</text>
                    <text x="393" y="425" fontSize="28" fontWeight="bold" fill="#3E6FA3">8</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Comprehensive Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything needed to improve medication adherence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-12 h-12 text-[#2F5B8C]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Medication Pill with Bell */}
                    <g>
                      {/* Rounded pill shape */}
                      <rect x="6" y="10" width="12" height="8" rx="4" ry="4" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5"/>
                      
                      {/* Bell notification */}
                      <path d="M14 6C14 4.9 14.9 4 16 4C17.1 4 18 4.9 18 6H14Z" fill="currentColor"/>
                      <path d="M15 7V6C15 5.45 15.45 5 16 5C16.55 5 17 5.45 17 6V7H15Z" fill="currentColor"/>
                      <circle cx="16" cy="8" r="4" fill="#22C55E" stroke="white" strokeWidth="1.5"/>
                      <path d="M15.5 7.5L16.5 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      
                      {/* Dot on pill */}
                      <circle cx="12" cy="13" r="0.8" fill="currentColor"/>
                      <circle cx="9" cy="13" r="0.8" fill="currentColor"/>
                    </g>
                  </svg>
                ),
                title: 'Smart Reminders',
                description: 'Personalized medication reminders at optimal times. Customizable alerts through SMS, push, or email.'
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-[#2F5B8C]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Analytics Chart */}
                    <g>
                      {/* Grid background */}
                      <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.05" stroke="currentColor" strokeWidth="1"/>
                      
                      {/* Y-axis bars */}
                      <rect x="5" y="14" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.4"/>
                      <rect x="9.5" y="10" width="2.5" height="9" rx="1" fill="currentColor" opacity="0.6"/>
                      <rect x="14" y="7" width="2.5" height="12" rx="1" fill="currentColor"/>
                      <rect x="18.5" y="9" width="2.5" height="10" rx="1" fill="#22C55E"/>
                      
                      {/* Trending line */}
                      <polyline points="6 13 11 8 16 6 20 8" stroke="#22C55E" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      
                      {/* Up arrow */}
                      <path d="M7 13L7 5M3 9L7 5L11 9" stroke="#22C55E" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </g>
                  </svg>
                ),
                title: 'Progress Tracking',
                description: 'Visual adherence analytics with detailed compliance charts. Monitor trends over weeks and months.'
              },
              {
                icon: (
                  <svg className="w-12 h-12 text-[#2F5B8C]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Notification Bell with pulse */}
                    <g>
                      {/* Bell shape */}
                      <path d="M12 2C10.3 2 9 3.3 9 5H15C15 3.3 13.7 2 12 2Z" fill="currentColor" opacity="0.3"/>
                      <path d="M19 9C19 14 21 16 21 16H3C3 16 5 14 5 9C5 6.24 6.5 4 9 3.5V2C9 1.45 9.45 1 10 1C10.55 1 11 1.45 11 2V3.5C13.5 4 15 6.24 15 9V14H19V9Z" fill="currentColor"/>
                      <circle cx="12" cy="20" r="1" fill="currentColor"/>
                      <path d="M10.5 19H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      
                      {/* Pulse circles indicating alert */}
                      <circle cx="12" cy="9" r="3" fill="#FF6B6B" opacity="0.8"/>
                      <circle cx="12" cy="9" r="5" fill="none" stroke="#FF6B6B" strokeWidth="1" opacity="0.5"/>
                      <circle cx="12" cy="9" r="7" fill="none" stroke="#FF6B6B" strokeWidth="0.5" opacity="0.3"/>
                    </g>
                  </svg>
                ),
                title: 'Caregiver Alerts',
                description: 'Real-time notifications when doses are missed. Immediate alerts for caregivers and healthcare providers.'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-[#EAEFF5] rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-[#3E6FA3] group"
              >
                <div className="mb-4 group-hover:scale-110 transition-transform duration-300 inline-block p-3 bg-white rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#2F5B8C] mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Proven & Trusted
            </h2>
            <p className="text-lg text-gray-600">
              By healthcare institutions and thousands of patients worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '85%',
                label: 'Adherence Improvement',
                description: 'Average increase in medication compliance in 3 months'
              },
              {
                number: '50K+',
                label: 'Active Users',
                description: 'Patients and caregivers using MediTrack daily'
              },
              {
                number: '99.9%',
                label: 'Uptime',
                description: 'Enterprise-grade reliability and availability'
              }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="text-4xl font-bold text-[#22C55E] mb-2">
                  {stat.number}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">
                  {stat.label}
                </h3>
                <p className="text-gray-600 text-sm">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple Setup Process
            </h2>
            <p className="text-lg text-gray-600">
              Get started in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Sign Up', desc: 'Create your account' },
              { num: '02', title: 'Add Medications', desc: 'Enter your medicines' },
              { num: '03', title: 'Set Schedule', desc: 'Choose reminder times' },
              { num: '04', title: 'Get Started', desc: 'Receive reminders' }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-[#3E6FA3] mb-3">{step.num}</div>
                <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 bg-gradient-to-r from-[#2F5B8C] to-[#3E6FA3]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Improve Your Health?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Start your journey to better medication adherence today. Join thousands of satisfied patients.
          </p>
          <Link to="/signup">
            <button className="px-8 py-3.5 bg-[#22C55E] text-white font-semibold rounded-lg hover:bg-[#1ea852] transition-all duration-300 hover:shadow-lg">
              Create Your Account
            </button>
          </Link>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-r from-[#1A3A52] to-[#1E4460] text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Left Section - Logo & Description */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Logo size="default" showText={false} />
                <span className="text-xl font-bold text-white">MediTrack</span>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed">
                Helping patients stay on track with their medications. Transforming adherence into habit.
              </p>
            </div>

            {/* Middle Section - Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-[#22C55E] rounded-full"></span>
                Quick Links
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-blue-100 hover:text-[#22C55E] font-medium transition duration-200 text-sm">
                    → Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-blue-100 hover:text-[#22C55E] font-medium transition duration-200 text-sm">
                    → Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="text-blue-100 hover:text-[#22C55E] font-medium transition duration-200 text-sm">
                    → Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Middle-Right Section - Resources */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-[#22C55E] rounded-full"></span>
                Resources
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-blue-100 hover:text-[#22C55E] font-medium transition duration-200 text-sm">
                    → Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-[#22C55E] font-medium transition duration-200 text-sm">
                    → Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-100 hover:text-[#22C55E] font-medium transition duration-200 text-sm">
                    → HIPAA Compliance
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Section - Contact/Social */}
            <div>
              <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-[#22C55E] rounded-full"></span>
                Connect
              </h4>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/15 hover:bg-[#22C55E] flex items-center justify-center transition-all duration-200 hover:scale-110" title="Email">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/15 hover:bg-[#22C55E] flex items-center justify-center transition-all duration-200 hover:scale-110" title="Phone">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.823.907a15.99 15.99 0 006.097 6.097l.907-1.823a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2.57c-8.835 0-16-7.165-16-16V3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/20 my-8" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-blue-200">
            <p>
              &copy; 2026 MediTrack. All rights reserved.
            </p>
            <p className="mt-4 md:mt-0 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#22C55E] rounded-full inline-block"></span>
              FDA-registered medical software committed to improving patient health outcomes.
            </p>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-[#22C55E] via-white to-[#22C55E] mt-8 opacity-60" />
      </footer>

      {/* Custom CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
