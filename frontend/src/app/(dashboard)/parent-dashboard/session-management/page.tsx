"use client"

import React from 'react'
import { useAuth } from "@/hooks/useAuth"
import { Calendar, Clock } from 'lucide-react'

export default function SessionManagementPage() {
  const { loading } = useAuth();
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Session Management</h1>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md">
          Schedule New Session
        </button>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex gap-2 mb-4">
          <button className="px-4 py-2 border-b-2 border-amber-500 text-amber-700 font-medium">
            Upcoming Sessions
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Past Sessions
          </button>
        </div>
        
        {loading ? (
          <div className="animate-pulse p-4">Loading session data...</div>
        ) : (
          <div className="divide-y">
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-md text-amber-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-medium">Mathematics with Mr. Johnson</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={14} />
                    <span>Thursday, May 22, 2025 • 4:00 PM - 5:00 PM</span>
                  </div>
                </div>
              </div>
              <div>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Reschedule
                </button>
              </div>
            </div>
            
            <div className="py-4 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-md text-amber-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-medium">English with Ms. Davis</h3>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Clock size={14} />
                    <span>Monday, May 26, 2025 • 3:30 PM - 4:30 PM</span>
                  </div>
                </div>
              </div>
              <div>
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
