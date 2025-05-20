"use client"

import React from 'react'
import { useAuth } from "@/hooks/useAuth"
import { CreditCard, Clock, AlertCircle } from 'lucide-react'

export default function PaymentCenterPage() {
  const { loading } = useAuth();
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payment Center</h1>
        <p className="text-gray-600 mt-1">Manage payments, view invoice history, and update payment methods</p>
      </div>
      
      {/* Upcoming Payment Card */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Payment</h2>
        
        {loading ? (
          <div className="animate-pulse p-4">Loading payment data...</div>
        ) : (
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="text-amber-600" size={18} />
                  <p className="text-amber-800 font-medium">Due on May 15, 2025</p>
                </div>
                <p className="mt-1 text-gray-600">8 tutoring sessions this month</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">$120</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-md font-medium">
                Pay Now
              </button>
              <p className="text-xs text-center mt-2 text-gray-500">Secured by Chapa Payment Gateway</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Transactions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        
        {loading ? (
          <div className="animate-pulse p-4">Loading transaction history...</div>
        ) : (
          <div className="divide-y">
            <div className="py-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Mr. Johnson (Mathematics)</h3>
                <p className="text-sm text-gray-500">May 5, 2025</p>
              </div>
              <div>
                <p className="font-semibold">$80</p>
              </div>
            </div>
            
            <div className="py-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Ms. Williams (Science)</h3>
                <p className="text-sm text-gray-500">May 3, 2025</p>
              </div>
              <div>
                <p className="font-semibold">$90</p>
              </div>
            </div>
            
            <div className="py-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Mr. Davis (English)</h3>
                <p className="text-sm text-gray-500">April 28, 2025</p>
              </div>
              <div>
                <p className="font-semibold">$80</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
