'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== 'undefined') {
      if (!loading && isAuthenticated && user) {
        // Redirect based on user type
        if (user.role === 'TUTOR') {
          router.push('/tutor-dashboard')
        } else if (user.role === 'PARENT') {
          router.push('/parent-dashboard')
        } else if (user.role === 'CHILD') {
          router.push('/child-dashboard')
        } else {
          // Default dashboard
          router.push('/parent-dashboard')
        }
      } else if (!loading && !isAuthenticated) {
        router.push('/auth/login')
      }
    }
  }, [router, user, isAuthenticated, loading])

  // Return a loading state or null - this won't be visible long as we redirect quickly
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading your dashboard...</h2>
        <div className="animate-pulse text-blue-500">Please wait</div>
      </div>
    </div>
  )
}