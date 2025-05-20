"use client"

import type React from "react"
import { Clock } from "lucide-react"

interface Child {
  id: number
  name: string
  age: number
  grade: string
  progress: number
  nextSession?: string
}

interface ChildrenOverviewProps {
  data: { children: Child[] }
  loading: boolean
  onViewDetails: (childId: number) => void
}

const ChildrenOverview: React.FC<ChildrenOverviewProps> = ({ data, loading, onViewDetails }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
        <h2 className="text-lg font-semibold mb-1">Children Overview</h2>
        <p className="text-xs text-gray-500 mb-5">Progress and upcoming sessions</p>

        <div className="animate-pulse space-y-8">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1.5"></div>
                  <div className="h-3 bg-gray-100 rounded w-32"></div>
                </div>
                <div className="h-3 bg-gray-100 rounded w-20"></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs">Overall Progress</span>
                  <span className="text-xs">0%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full w-full"></div>
                <div className="h-3.5 bg-gray-100 rounded w-40 mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
      <h2 className="text-lg font-semibold">Children Overview</h2>
      <p className="text-xs text-gray-500 mb-5">Progress and upcoming sessions</p>

      <div className="space-y-8">
        {data.children.map((child) => (
          <div key={child.id}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-semibold">
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{child.name}</h3>
                  <p className="text-xs text-gray-500">
                    {child.age} years • {child.grade}
                  </p>
                </div>
              </div>
              <button
                className="text-xs text-gray-600 hover:text-amber-600 transition-colors font-medium"
                onClick={() => onViewDetails(child.id)}
              >
                View Details
              </button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-600">Overall Progress</span>
                <span className="font-medium">{child.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${child.progress}%` }}
                ></div>
              </div>
            </div>

            {child.nextSession && (
              <div className="mt-3 flex items-center text-xs text-gray-600 bg-amber-50 p-2 rounded-md">
                <Clock className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                <span>Next Session: {child.nextSession}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChildrenOverview
