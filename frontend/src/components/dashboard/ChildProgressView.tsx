"use client"

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  BookOpen, 
  Clock4, 
  BarChart4, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { 
  ChildProgress, 
  SubjectProgress, 
  SessionHistory, 
  UpcomingSessions,
  SessionStatus, 
  SessionQueryOptions 
} from '@/lib/types/progress'
import { ProgressService } from '@/services/progress.service'

interface ChildProgressViewProps {
  childId: number
  onBack: () => void
}

export default function ChildProgressView({ childId, onBack }: ChildProgressViewProps) {
  // Progress data state
  const [progressData, setProgressData] = useState<ChildProgress | null>(null)
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSessions | null>(null)
  const [sessionHistory, setSessionHistory] = useState<SessionHistory | null>(null)
  
  // Loading states
  const [loadingProgress, setLoadingProgress] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(true)
  
  // Error states
  const [progressError, setProgressError] = useState<string | null>(null)
  const [sessionsError, setSessionsError] = useState<string | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)
  
  // Session query options
  const [historyPage, setHistoryPage] = useState(1)
  const [historyFilter, setHistoryFilter] = useState<string>('all')
  
  // Fetch child progress data
  useEffect(() => {
    const fetchChildProgress = async () => {
      try {
        setLoadingProgress(true)
        const data = await ProgressService.getChildProgress(childId)
        setProgressData(data)
        setProgressError(null)
      } catch (error) {
        console.error('Error fetching child progress:', error)
        setProgressError('Failed to load progress data')
      } finally {
        setLoadingProgress(false)
      }
    }
    
    fetchChildProgress()
  }, [childId])
  
  // Fetch upcoming sessions
  useEffect(() => {
    const fetchUpcomingSessions = async () => {
      try {
        setLoadingSessions(true)
        const data = await ProgressService.getUpcomingSessions(childId)
        setUpcomingSessions(data)
        setSessionsError(null)
      } catch (error) {
        console.error('Error fetching upcoming sessions:', error)
        setSessionsError('Failed to load upcoming sessions')
      } finally {
        setLoadingSessions(false)
      }
    }
    
    fetchUpcomingSessions()
  }, [childId])
  
  // Fetch session history
  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        setLoadingHistory(true)
        
        // Build query options
        const options: SessionQueryOptions = { page: historyPage, pageSize: 5 }
        
        // Add status filter if not 'all'
        if (historyFilter !== 'all') {
          options.status = historyFilter as SessionStatus
        }
        
        const data = await ProgressService.getSessionHistory(childId, options)
        setSessionHistory(data)
        setHistoryError(null)
      } catch (error) {
        console.error('Error fetching session history:', error)
        setHistoryError('Failed to load session history')
      } finally {
        setLoadingHistory(false)
      }
    }
    
    fetchSessionHistory()
  }, [childId, historyPage, historyFilter])
  
  // Handle pagination
  const handlePreviousPage = () => {
    if (sessionHistory && historyPage > 1) {
      setHistoryPage(historyPage - 1)
    }
  }
  
  const handleNextPage = () => {
    if (sessionHistory && historyPage < sessionHistory.totalPages) {
      setHistoryPage(historyPage + 1)
    }
  }
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }
  
  // Progress data loading skeleton
  if (loadingProgress) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center mb-6">
          <div className="w-7 h-7 bg-gray-200 rounded-full mr-3"></div>
          <div className="h-5 bg-gray-200 rounded w-40"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        
        <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }
  
  // Error state
  if (progressError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{progressError}</p>
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Button>
      </div>
    )
  }
  
  return (
    <div>
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Button 
          onClick={onBack} 
          variant="ghost" 
          size="sm" 
          className="gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h2 className="text-xl font-semibold ml-2">
          {progressData?.subjectProgress[0]?.name?.split(' ')[0]}'s Progress
        </h2>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{progressData?.overallProgress || 0}%</span>
              <Progress value={progressData?.overallProgress || 0} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Sessions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{progressData?.totalSessions || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Hours Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{progressData?.totalHours || 0}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-amber-500 mr-2" />
              <span className="text-2xl font-bold">{progressData?.upcomingSessions || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Subjects and Sessions Tabs */}
      <Tabs defaultValue="subjects">
        <TabsList className="mb-4">
          <TabsTrigger value="subjects">Subject Progress</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        
        {/* Subject Progress Tab */}
        <TabsContent value="subjects">
          <h3 className="text-lg font-medium mb-4">Subject Progress</h3>
          
          {progressData?.subjectProgress.map((subject: SubjectProgress) => (
            <Card key={subject.subjectId} className="mb-4">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{subject.name}</h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {subject.sessionCount} sessions
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {subject.hoursSpent} hours
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900">
                    {subject.progress}%
                  </Badge>
                </div>
                
                <Progress value={subject.progress} className="h-2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Sessions</h3>
            
            <Select value={historyFilter} onValueChange={setHistoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="scheduled">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Upcoming Sessions */}
          {historyFilter === 'scheduled' && upcomingSessions?.upcomingSessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No upcoming sessions scheduled
            </div>
          )}
          
          {historyFilter === 'scheduled' && upcomingSessions?.upcomingSessions.map((session) => (
            <Card key={session.sessionId} className="mb-3">
              <CardContent className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{session.subject}</h4>
                    <div className="text-sm text-gray-500 mt-1">
                      <div className="flex items-center">
                        <Clock4 className="h-3.5 w-3.5 mr-1.5" />
                        {formatDate(session.startTime)} ({session.durationMinutes} mins)
                      </div>
                      <div className="mt-1">with {session.tutorName}</div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Session History */}
          {(historyFilter !== 'scheduled' || historyFilter === 'all') && (
            <>
              {loadingHistory ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <>
                  {historyError ? (
                    <div className="text-center py-6 text-red-500">{historyError}</div>
                  ) : (
                    <>
                      {sessionHistory?.sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No session history found
                        </div>
                      ) : (
                        <>
                          {sessionHistory?.sessions.map((session) => (
                            <Card key={session.sessionId} className="mb-3">
                              <CardContent className="py-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h4 className="font-medium">{session.subject}</h4>
                                    <div className="text-sm text-gray-500 mt-1">
                                      <div className="flex items-center">
                                        <Clock4 className="h-3.5 w-3.5 mr-1.5" />
                                        {formatDate(session.startTime)} ({session.durationMinutes} mins)
                                      </div>
                                      <div className="mt-1">with {session.tutorName}</div>
                                    </div>
                                  </div>
                                  <Badge className={
                                    session.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : session.status === 'scheduled' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-red-100 text-red-800'
                                  }>
                                    {session.status === 'completed' ? 'Completed' : 
                                     session.status === 'scheduled' ? 'Upcoming' : 'Cancelled'}
                                  </Badge>
                                </div>
                                
                                {session.notes && (
                                  <div className="mt-3 text-sm bg-gray-50 p-2 rounded-md text-gray-700">
                                    {session.notes}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                          
                          {/* Pagination */}
                          {sessionHistory && sessionHistory.totalPages > 1 && (
                            <div className="flex justify-between items-center mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={historyPage === 1}
                                className="gap-1"
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              
                              <span className="text-sm text-gray-500">
                                Page {historyPage} of {sessionHistory.totalPages}
                              </span>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={historyPage === sessionHistory.totalPages}
                                className="gap-1"
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
