"use client"

import React from 'react'
import { useAuth } from "@/hooks/useAuth"
import { Search } from 'lucide-react'

export default function TutorSearchPage() {
  const { loading } = useAuth();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Find Tutors</h1>
        <p className="text-gray-600 mt-1">Search for qualified tutors by subject, grade level, or availability</p>
      </div>
      
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 border rounded-md p-2 mb-4">
          <Search className="text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by subject, grade level, or tutor name"
            className="flex-1 outline-none"
          />
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-md text-sm">
            Search
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {loading ? (
            <div className="w-full animate-pulse p-4">Loading tutor data...</div>
          ) : (
            <div className="text-center text-gray-500 w-full py-8">
              <p>Enter search criteria to find tutors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
