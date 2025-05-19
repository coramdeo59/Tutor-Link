'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SessionManagementContent } from '@/components/dashboard/session-management-content'

export default function SessionManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Session Management</h1>
        <p className="text-slate-600">View and manage tutoring sessions for your children</p>
        <SessionManagementContent />
      </div>
    </DashboardLayout>
  )
}
