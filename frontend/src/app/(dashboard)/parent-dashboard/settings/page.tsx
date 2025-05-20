"use client"

import React from 'react'
import { useAuth } from "@/hooks/useAuth"
import { User, Bell, CreditCard, Shield, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="font-medium">Settings</h2>
            </div>
            <div className="divide-y">
              <button className="w-full flex items-center gap-3 p-4 text-left text-amber-700 bg-amber-50 hover:bg-amber-50">
                <User size={18} />
                <span>Account</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-gray-50">
                <Bell size={18} />
                <span>Notifications</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-gray-50">
                <CreditCard size={18} />
                <span>Billing</span>
              </button>
              <button className="w-full flex items-center gap-3 p-4 text-left text-gray-700 hover:bg-gray-50">
                <Shield size={18} />
                <span>Security</span>
              </button>
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-white rounded-lg shadow-sm hover:bg-red-50"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
        
        {/* Main Content */}
        <div className="col-span-1 md:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    defaultValue={user?.firstName + ' ' + user?.lastName || ''}
                    className="w-full p-2 border rounded-md"
                    placeholder="Your name"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || ''}
                    className="w-full p-2 border rounded-md"
                    placeholder="Your email"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    placeholder="Your phone number"
                  />
                </div>
                
                <button type="button" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md">
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
