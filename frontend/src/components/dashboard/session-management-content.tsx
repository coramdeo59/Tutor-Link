"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, Clock, BookOpen } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for initial development - dates based on May 19, 2025
const weekDays = [
  { day: "Mon", date: 19 },
  { day: "Tue", date: 20 },
  { day: "Wed", date: 21 },
  { day: "Thu", date: 22 },
  { day: "Fri", date: 23 },
  { day: "Sat", date: 24 },
  { day: "Sun", date: 25 },
]

const upcomingSessions = [
  {
    id: 1,
    tutorName: "Mr. Johnson",
    tutorInitials: "MJ",
    childName: "Emma Smith",
    subject: "Mathematics",
    date: "Monday, May 19, 2025",
    startTime: "16:00",
    endTime: "17:00",
  },
  {
    id: 2,
    tutorName: "Ms. Williams",
    tutorInitials: "MW",
    childName: "Jack Smith",
    subject: "Science",
    date: "Wednesday, May 21, 2025",
    startTime: "15:00",
    endTime: "16:00",
  },
]

const sessionHistory = [
  {
    id: 3,
    tutorName: "Ms. Davis",
    tutorInitials: "MD",
    childName: "Emma Smith",
    subject: "English",
    date: "Friday, May 16, 2025",
    startTime: "14:00",
    endTime: "15:00",
  },
]

export function SessionManagementContent() {
  const [selectedChild, setSelectedChild] = useState<string>("all")
  
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
                  <SelectItem value="1">Emma Smith</SelectItem>
                  <SelectItem value="2">Jack Smith</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50">
                Schedule New Session
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekly calendar navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-lg font-medium">
              May 19 - May 25, 2025
            </div>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Weekly calendar */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDays.map((day) => (
              <div 
                key={day.day} 
                className={`text-center p-2 rounded-lg ${
                  day.day === "Mon" 
                    ? "bg-amber-100" 
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {day.day}
                </div>
                <div className="text-sm font-medium">
                  {day.date}
                </div>
              </div>
            ))}
          </div>
          
          {/* Upcoming sessions list */}
          <div>
            <h3 className="text-md font-medium mb-3">Upcoming Sessions</h3>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-amber-100 text-amber-700">{session.tutorInitials}</AvatarFallback>
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
                      {session.childName} • {session.startTime} - {session.endTime}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{session.date}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Cancel</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Session history */}
          <div className="mt-8">
            <h3 className="text-md font-medium mb-3">Session History</h3>
            <div className="space-y-3">
              {sessionHistory.map((session) => (
                <div key={session.id} className="border rounded-lg p-3 bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200">{session.tutorInitials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{session.tutorName}</h4>
                        <span className="text-xs text-muted-foreground">• {session.subject}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.childName} • {session.date} • {session.startTime} - {session.endTime}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
