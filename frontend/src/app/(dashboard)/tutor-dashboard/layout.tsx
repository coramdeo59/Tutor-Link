"use client";

import React, { useState } from 'react';
import TutorDashboardSidebar from '@/components/dashboard/TutorDashboardSidebar';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function TutorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - fixed position for both mobile and desktop */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <TutorDashboardSidebar />
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col w-full lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm">
            <button
              className="p-2 rounded-md text-gray-600 hover:text-amber-500 hover:bg-gray-100 focus:outline-none lg:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="text-xl font-bold text-amber-600">Tutor Dashboard</div>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-amber-500 relative">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold">
                  {user?.firstName?.[0] || 'T'}
                </div>
                <span className="text-sm font-medium hidden md:block">{user?.firstName || 'Tutor'}</span>
              </div>
            </div>
          </header>
          
          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
