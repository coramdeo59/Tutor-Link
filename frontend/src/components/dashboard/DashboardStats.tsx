import type React from "react"
import { Users, BookOpen, CalendarDays, DollarSign } from "lucide-react"

interface Stats {
  children: {
    count: number
    names: string
  }
  tutors: {
    count: number
    description: string
  }
  sessions: {
    count: number
    description: string
  }
  spending: {
    formatted: string
    description: string
  }
}

interface DashboardStatsProps {
  stats: Stats
  isLoading: boolean
}

const StatsCard: React.FC<{
  value: string | number
  description: string
  icon: React.ReactNode
  iconColor: string
  className?: string
}> = ({ value, description, icon, iconColor, className }) => {
  return (
    <div className={`bg-white p-5 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center mb-4">
        <div className={`rounded-full p-2 ${iconColor} bg-opacity-20 mr-3`}>{icon}</div>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  )
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        value={stats.children.count}
        description={stats.children.names}
        icon={<Users className="w-5 h-5" />}
        iconColor="text-amber-500"
        className="border border-gray-100"
      />

      <StatsCard
        value={stats.tutors.count}
        description={stats.tutors.description}
        icon={<BookOpen className="w-5 h-5" />}
        iconColor="text-amber-500"
        className="border border-gray-100"
      />

      <StatsCard
        value={stats.sessions.count}
        description={stats.sessions.description}
        icon={<CalendarDays className="w-5 h-5" />}
        iconColor="text-amber-500"
        className="border border-gray-100"
      />

      <StatsCard
        value={stats.spending.formatted}
        description={stats.spending.description}
        icon={<DollarSign className="w-5 h-5" />}
        iconColor="text-amber-500"
        className="border border-gray-100"
      />
    </div>
  )
}

export default DashboardStats
