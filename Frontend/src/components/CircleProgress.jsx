export default function CircleProgress({ percentage = 0, size = 150, title = 'Adherence' }) {
  const circumference = 2 * Math.PI * (size / 2 - 10)
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 10}
            fill="none"
            stroke="#0066FC"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-primary-blue">{percentage}%</span>
          <span className="text-xs text-gray-500">{title}</span>
        </div>
      </div>
    </div>
  )
}
