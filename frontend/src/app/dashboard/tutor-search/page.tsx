'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TutorSearchContent } from '@/components/dashboard/tutor-search-content'

export default function TutorSearchPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Tutor Search</h1>
        <p className="text-slate-600">Find the perfect tutor for your children</p>
        <TutorSearchContent />
      </div>
    </DashboardLayout>
  )
}
