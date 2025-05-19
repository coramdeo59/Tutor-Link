"use client"

import { ReactNode } from "react"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-white">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout