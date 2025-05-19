"use client"

import { useState } from "react"
import { format, addDays, startOfWeek } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar, Clock, BookOpen } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Types for sessions
interface Session {
  id: number
  childName: string
  childId: number
  tutorName: string
  tutorId: number
  tutorPhoto?: string
  subject: string
  date: string // ISO date string
  startTime: string
  endTime: string
  status: "upcoming" | "completed" | "cancelled"
}

interface ChildOption {
  id: number
  name: string
}

export function SessionManagement() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState<string>("all")
  const [children, setChildren] = useState<ChildOption[]>([])
  
  // Mock data for initial development
  useState(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock data for children options
      const mockChildren = [
        { id: 1, name: "Emma Smith" },
        { id: 2, name: "Jack Smith" }
      ]
      
      // Mock data for sessions
      const mockSessions = [
        {
          id: 1,
          childName: "Emma Smith",
          childId: 1,
          tutorName: "Mr. Johnson",
          tutorId: 101,
          tutorPhoto: "",
          subject: "Mathematics",
          date: new Date().toISOString(),
          startTime: "16:00",
          endTime: "17:00",
          status: "upcoming"
        },
        {
          id: 2,
          childName: "Jack Smith",
          childId: 2,
          tutorName: "Ms. Williams",
          tutorId: 102,
          tutorPhoto: "",
          subject: "Science",
          date: addDays(new Date(), 2).toISOString(),
          startTime: "15:00",
          endTime: "16:00",
          status: "upcoming"
        },
        {
          id: 3,
          childName: "Emma Smith",
          childId: 1,
          tutorName: "Ms. Davis",
          tutorId: 103,
          tutorPhoto: "",
          subject: "English",
          date: addDays(new Date(), -3).toISOString(),
          startTime: "14:00",
          endTime: "15:00",
          status: "completed"
        }
      ] as Session[]
      
      setChildren(mockChildren)
      setSessions(mockSessions)
      setLoading(false)
    }, 1000)
  }, [])
  
  // Filter sessions based on selected child
  const filteredSessions = selectedChild === "all" 
    ? sessions 
    : sessions.filter(session => session.childId === parseInt(selectedChild))
  
  // Group sessions by status
  const upcomingSessions = filteredSessions.filter(session => session.status === "upcoming")
  const completedSessions = filteredSessions.filter(session => session.status === "completed")
  
  // Get week dates for weekly calendar
  const getWeekDates = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i))
  }
  
  const weekDates = getWeekDates()
  
  // Navigate through weeks
  const previousWeek = () => setCurrentDate(addDays(currentDate, -7))
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7))
  
  // Format date for display
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "EEEE, MMMM d, yyyy")
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-[300px]">Loading sessions...</div>
  }
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Session Calendar</CardTitle>
              <CardDescription>View and manage upcoming tutoring sessions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select child" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Children</SelectItem>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id.toString()}>
                      {child.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => {}} variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50">
                Schedule New Session
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekly calendar navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button onClick={previousWeek} variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-lg font-medium">
              {format(weekDates[0], "MMM d")} - {format(weekDates[6], "MMM d, yyyy")}
            </div>
            <Button onClick={nextWeek} variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Weekly calendar */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDates.map((date) => (
              <div 
                key={date.toString()} 
                className={`text-center p-2 rounded-lg ${
                  format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") 
                    ? "bg-amber-100" 
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {format(date, "EEE")}
                </div>
                <div className="text-sm font-medium">
                  {format(date, "d")}
                </div>
              </div>
            ))}
          </div>
          
          {/* Upcoming sessions list */}
          <div>
            <h3 className="text-md font-medium mb-3">Upcoming Sessions</h3>
            {upcomingSessions.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming sessions scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={session.tutorPhoto} alt={session.tutorName} />
                          <AvatarFallback>{session.tutorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{session.tutorName}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{session.subject}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-amber-600 text-amber-600">
                        {selectedChild === "all" && `${session.childName} • `}
                        {session.startTime} - {session.endTime}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatSessionDate(session.date)}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Cancel</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Session history */}
          {completedSessions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-md font-medium mb-3">Session History</h3>
              <div className="space-y-3">
                {completedSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{session.tutorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{session.tutorName}</h4>
                          <span className="text-xs text-muted-foreground">• {session.subject}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {selectedChild === "all" && `${session.childName} • `}
                          {formatSessionDate(session.date)} • {session.startTime} - {session.endTime}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
