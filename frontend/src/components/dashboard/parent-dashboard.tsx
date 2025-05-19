"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  CalendarIcon, 
  LucideUser, 
  Users2, 
  BookOpen,
  DollarSign,
  Clock,
  ArrowRight,
  ChevronDown
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { SessionManagement } from "./session-management"

// Types
interface Child {
  id: number
  name: string
  age: number
  grade: string
  progress: number
  nextSession?: {
    date: string
    time: string
    subject: string
  }
  photo?: string
}

interface Transaction {
  id: number
  tutorName: string
  subject: string
  amount: number
  date: string
}

interface Payment {
  id: number
  amount: number
  dueDate: string
}

export function ParentDashboard() {
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState<Child[]>([])
  const [activeSessionsCount, setActiveSessionsCount] = useState(0)
  const [activeTutorsCount, setActiveTutorsCount] = useState(0)
  const [monthlySpending, setMonthlySpending] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [upcomingPayment, setUpcomingPayment] = useState<Payment | null>(null)

  // Mock data for initial development
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock data
      const mockChildren = [
        {
          id: 1,
          name: "Emma Smith",
          age: 14,
          grade: "8th Grade",
          progress: 72,
          nextSession: {
            date: "Today",
            time: "4:00 PM",
            subject: "Mathematics"
          },
          photo: ""
        },
        {
          id: 2,
          name: "Jack Smith",
          age: 10,
          grade: "5th Grade",
          progress: 85,
          nextSession: {
            date: "Tomorrow",
            time: "3:30 PM",
            subject: "English"
          },
          photo: ""
        }
      ]

      const mockTransactions = [
        {
          id: 1,
          tutorName: "Mr. Johnson",
          subject: "Mathematics",
          amount: 80,
          date: "May 5"
        },
        {
          id: 2,
          tutorName: "Ms. Williams",
          subject: "Science",
          amount: 80,
          date: "May 3"
        },
        {
          id: 3,
          tutorName: "Mr. Davis",
          subject: "English",
          amount: 80,
          date: "Apr 28"
        }
      ]

      // Set state with mock data
      setChildren(mockChildren)
      setActiveTutorsCount(3)
      setActiveSessionsCount(5)
      setMonthlySpending(320)
      setRecentTransactions(mockTransactions)
      setUpcomingPayment({
        id: 1,
        amount: 120,
        dueDate: "May 15, 2025"
      })
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading dashboard...</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Parent Dashboard</h1>

      {/* Welcome section */}
      <div className="bg-amber-100 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-1">Welcome back, Mrs. Smith!</h2>
        <p className="text-slate-600">Your children have {activeSessionsCount} upcoming sessions this week</p>
        <div className="flex gap-4 mt-4">
          <Button className="bg-amber-600 hover:bg-amber-700">Find Tutors</Button>
          <Button variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">Schedule Session</Button>
        </div>
      </div>
      
      {/* Dashboard Overview Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        </div>
        
        {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Children</p>
                    <p className="text-3xl font-bold">{children.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {children.map(child => child.name.split(' ')[0]).join(' & ')}
                    </p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <Users2 className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Tutors</p>
                    <p className="text-3xl font-bold">{activeTutorsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Across 3 subjects
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Upcoming Sessions</p>
                    <p className="text-3xl font-bold">{activeSessionsCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Next: Today at 4 PM
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CalendarIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Spending</p>
                    <p className="text-3xl font-bold">${monthlySpending}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      8 sessions this month
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Children Overview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Children Overview</CardTitle>
                  <CardDescription>Progress and upcoming sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {children.map((child) => (
                      <div key={child.id} className="border-b pb-6 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={child.photo} alt={child.name} />
                              <AvatarFallback>{child.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{child.name}</h3>
                              <p className="text-sm text-muted-foreground">{child.age} years • {child.grade}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-xs">View Details</Button>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Progress</span>
                            <span>{child.progress}%</span>
                          </div>
                          <Progress value={child.progress} className="h-2" />
                        </div>
                        
                        {child.nextSession && (
                          <div className="flex items-center gap-2 text-sm mt-4 text-amber-700">
                            <Clock className="h-4 w-4" />
                            <span>Next Session: {child.nextSession.date}, {child.nextSession.time} - {child.nextSession.subject}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                  <CardDescription>Recent and upcoming payments</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingPayment && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium mb-2 flex justify-between">
                        <span>Upcoming Payment</span>
                        <span className="font-bold">${upcomingPayment.amount}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">Due on {upcomingPayment.dueDate}</p>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700">Pay Now</Button>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <p className="font-medium">{transaction.tutorName}</p>
                            <p className="text-xs text-muted-foreground">{transaction.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${transaction.amount}</p>
                            <p className="text-xs text-muted-foreground">{transaction.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
      
      {/* Session Management Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Session Management</h2>
        </div>
        <SessionManagement />
      </div>
    </div>
  )
}


export default ParentDashboard