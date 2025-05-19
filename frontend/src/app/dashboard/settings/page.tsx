'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SettingsContent } from '@/components/dashboard/settings-content'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-600">Manage your account settings and preferences</p>
        <SettingsContent />
      </div>
    </DashboardLayout>
  )
}
