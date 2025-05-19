'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PaymentCenterContent } from '@/components/dashboard/payment-center-content'

export default function PaymentCenterPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Payment Center</h1>
        <p className="text-slate-600">Manage your payments, invoices, and payment methods</p>
        <PaymentCenterContent />
      </div>
    </DashboardLayout>
  )
}
