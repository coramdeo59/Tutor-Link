'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ChildrenManagementContent } from '@/components/dashboard/children-management-content'

export default function ChildrenManagementPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Children Management</h1>
        <p className="text-slate-600">View and manage your children's accounts and profiles</p>
        <ChildrenManagementContent />
      </div>
    </DashboardLayout>
  )
}
