"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutorDashboardService, TutorStats, TutoringSession, Assignment, Feedback } from '@/services/tutor-dashboard.service';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';

export default function TutorDashboard() {
  const { user } = useAuth();
  
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TutorStats>({
    rating: 0,
    reviews: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    upcomingSessions: 0,
    totalHours: 0,
    completedSessions: 0,
    subjects: []
  });
  
  // State for different data types
  const [upcomingSessions, setUpcomingSessions] = useState<TutoringSession[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<Feedback[]>([]);
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [loadingDetail, setLoadingDetail] = useState({
    sessions: true,
    feedback: true,
    assignments: true
  });

  // Fetch dashboard data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Use the calculateTutorStats method that computes stats from real session data
        const tutorStats = await TutorDashboardService.calculateTutorStats();
        setStats(tutorStats);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch sessions, feedback, and assignments data
  useEffect(() => {
    const fetchDetailData = async () => {
      try {
        // Fetch upcoming sessions
        setLoadingDetail(prev => ({ ...prev, sessions: true }));
        const sessions = await TutorDashboardService.getUpcomingSessions();
        setUpcomingSessions(sessions);
        setLoadingDetail(prev => ({ ...prev, sessions: false }));

        // Fetch recent feedback
        setLoadingDetail(prev => ({ ...prev, feedback: true }));
        const feedback = await TutorDashboardService.getRecentFeedback();
        setRecentFeedback(feedback);
        setLoadingDetail(prev => ({ ...prev, feedback: false }));

        // Fetch recent assignments
        setLoadingDetail(prev => ({ ...prev, assignments: true }));
        const assignments = await TutorDashboardService.getRecentAssignments();
        setRecentAssignments(assignments);
        setLoadingDetail(prev => ({ ...prev, assignments: false }));
      } catch (err) {
        console.error('Error fetching detail data:', err);
        setLoadingDetail({
          sessions: false,
          feedback: false,
          assignments: false
        });
      }
    };

    fetchDetailData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (err) {
      return dateString;
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Tutor Dashboard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Welcome Banner */}
      <div className="bg-amber-100 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="font-medium text-lg">Welcome back, {user?.firstName || 'Tutor'}!</h2>
            <p className="text-sm text-gray-600">
              You have {loading ? '...' : stats.upcomingSessions} upcoming sessions this week
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" className="bg-amber-600 hover:bg-amber-700">
              Schedule Hours
            </Button>
            <Button variant="outline" className="bg-white" asChild>
              <Link href="/tutor-dashboard/sessions">View Sessions</Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-20 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.rating}/5</div>
                <p className="text-xs text-gray-500">From {stats.reviews} reviews</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-20 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">${stats.totalEarnings}</div>
                <p className="text-xs text-gray-500">${stats.monthlyEarnings} this month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-20 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.upcomingSessions} Upcoming</div>
                <p className="text-xs text-gray-500">{stats.completedSessions} completed</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-20 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats.totalHours} hrs</div>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">75% of your monthly goal</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 items-center justify-center" asChild>
          <Link href="/tutor-dashboard/assignments">
            <BookOpen className="h-6 w-6 mb-2 text-amber-600" />
            <span className="font-medium">Assignments</span>
            <span className="text-sm text-gray-500">Create & manage assignments</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 items-center justify-center" asChild>
          <Link href="/tutor-dashboard/sessions">
            <Calendar className="h-6 w-6 mb-2 text-amber-600" />
            <span className="font-medium">Sessions</span>
            <span className="text-sm text-gray-500">Manage tutoring sessions</span>
          </Link>
        </Button>
        
        <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 items-center justify-center" asChild>
          <Link href="/tutor-dashboard/students">
            <Users className="h-6 w-6 mb-2 text-amber-600" />
            <span className="font-medium">Students</span>
            <span className="text-sm text-gray-500">View & manage students</span>
          </Link>
        </Button>

        <Button variant="outline" className="p-6 h-auto flex flex-col gap-2 items-center justify-center" asChild>
          <Link href="/tutor-dashboard/availability">
            <Clock className="h-6 w-6 mb-2 text-amber-600" />
            <span className="font-medium">Availability</span>
            <span className="text-sm text-gray-500">Set your teaching hours</span>
          </Link>
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upcoming" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDetail.sessions ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.sessionId} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                        <h3 className="font-medium">{session.title}</h3>
                        <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                      </div>
                      <p className="text-gray-600">Student: {session.childName || 'Unknown'}</p>
                      <p className="text-gray-600">Subject: {session.subject || 'Various'}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(session.startTime)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No upcoming sessions scheduled.</p>
              )}

              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/tutor-dashboard/sessions">View All Sessions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDetail.assignments ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : recentAssignments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssignments.map((assignment) => (
                    <div key={assignment.assignmentId} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                        <h3 className="font-medium">{assignment.title}</h3>
                        <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                      </div>
                      <p className="text-gray-600">Student: {assignment.childName || 'Unknown'}</p>
                      <p className="text-gray-600 line-clamp-2">{assignment.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.dueDate)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No assignments found.</p>
              )}

              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/tutor-dashboard/assignments">View All Assignments</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingDetail.feedback ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              ) : recentFeedback.length > 0 ? (
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <div key={feedback.feedbackId} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                        <h3 className="font-medium">{feedback.title}</h3>
                        <Badge className="bg-gray-100 text-gray-800">{feedback.feedbackType}</Badge>
                      </div>
                      <p className="text-gray-600">From: {feedback.childName || 'Anonymous'}</p>
                      <p className="text-gray-600 line-clamp-2">{feedback.content}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        {formatDate(feedback.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No feedback received yet.</p>
              )}

              <div className="mt-4">
                <Button variant="outline" asChild>
                  <Link href="/tutor-dashboard/feedback">View All Feedback</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
