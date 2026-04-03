export default function Logo({ size = 'default', showText = false }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-14 h-14'
  }

  const textSizeClasses = {
    small: 'text-sm',
    default: 'text-lg',
    large: 'text-2xl'
  }

  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 100 100"
        className={`${sizeClasses[size]} flex-shrink-0`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2F5B8C" />
            <stop offset="100%" stopColor="#3E6FA3" />
          </linearGradient>
        </defs>
        
        <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
        
        {/* Capsule/Pill Shape - Left */}
        <path
          d="M 35 35 L 45 35 Q 50 35 50 40 L 50 60 Q 50 65 45 65 L 35 65 Q 30 65 30 60 L 30 40 Q 30 35 35 35"
          fill="#FFFFFF"
          opacity="0.95"
        />
        
        {/* Capsule/Pill Shape - Right */}
        <path
          d="M 55 35 L 65 35 Q 70 35 70 40 L 70 60 Q 70 65 65 65 L 55 65 Q 50 65 50 60 L 50 40 Q 50 35 55 35"
          fill="#22C55E"
          opacity="0.95"
        />
        
        {/* Heartbeat Line */}
        <g stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20,50 28,50 32,42 36,58 40,50 48,50" opacity="0.8" />
        </g>

        {/* Checkmark - indicating adherence */}
        <g stroke="#22C55E" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 72 45 L 76 50 L 82 40" opacity="0.9" />
        </g>
      </svg>

      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-[#2F5B8C] whitespace-nowrap`}>
          MediTrack
        </span>
      )}
    </div>
  )
}
