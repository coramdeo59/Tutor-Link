"use client";

import React, { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Menu, Bell } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - note the updated width to match screenshot */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-30 w-[140px] transform bg-white transition duration-300 ease-in-out lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <DashboardSidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
          <button
            className="p-1 text-gray-600 hover:text-amber-500 focus:outline-none lg:hidden"
            onClick={toggleSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="w-5 h-5" />
          </button>
          
          <div></div> {/* Empty div for spacing */}
          
          <div className="flex items-center gap-3">
            <button className="text-gray-500 hover:text-amber-500">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium">U</span>
            </div>
          </div>
        </header>
        
        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="ml-0 lg:ml-[140px] transition-all duration-300 p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}