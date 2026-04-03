export default function Card({ children, className = '', onClick = null }) {
  return (
    <div
      className={`clay-card ${onClick ? 'cursor-pointer hover:shadow-lg transition-all' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
