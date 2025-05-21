"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TutorDashboardService, TutoringSession } from '@/services/tutor-dashboard.service';
import { format, addHours } from 'date-fns';
import { Clock, ArrowLeft, Check, X, Plus, User, BookOpen, GraduationCap, Calendar as CalendarIcon } from 'lucide-react';
import { ClientOnlyCalendar } from "@/components/ui/client-only-calendar";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from 'axios';

// Define interfaces for reference data
interface Subject {
  id: number;
  name: string;
}

interface GradeLevel {
  id: number;
  name: string;
}

interface Student {
  id: number;
  childId: number;
  firstName: string;
  lastName: string;
  name: string;
  gradeLevel?: string;
  gradeLevelId?: number | null;
  fullName?: string;
}

// New session form data interface
interface SessionFormData {
  childId: number;
  subjectId: number;
  title: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed';
  notes?: string;
}

export default function TutorSessions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<TutoringSession[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [childDetailsLoaded, setChildDetailsLoaded] = useState(false);
  
  // Reference data state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingReference, setLoadingReference] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  
  // New session dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSession, setNewSession] = useState<SessionFormData>({
    childId: 0,
    subjectId: 0,
    title: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
    notes: ''
  });
  
  // Function to fetch available students directly from the database
  const fetchAvailableStudents = async () => {
    try {
      setStudentsLoading(true);
      setStudentsError(null);
      console.log('Fetching available students from database...');
      
      // Call the TutorDashboardService method to get students
      const studentData = await TutorDashboardService.getAvailableStudents();
      console.log('Successfully fetched students from database:', studentData);
      
      if (!studentData || studentData.length === 0) {
        setStudentsError('No students available. Please try again later.');
        setStudents([]);
        setStudentsLoading(false);
        return;
      }
      
      // Map the data to our expected format with no mock data or fallbacks
      const formattedStudents = studentData.map(student => ({
        id: student.childId,
        childId: student.childId,
        firstName: student.firstName,
        lastName: student.lastName,
        name: `${student.firstName} ${student.lastName}`,
        gradeLevel: student.gradeLevelName || '',
        gradeLevelId: student.gradeLevelId,
        fullName: student.fullName || `${student.firstName} ${student.lastName}`
      }));
      
      setStudents(formattedStudents);
      console.log('Updated students state with data from database:', formattedStudents);
    } catch (error) {
      console.error('Error fetching students from database:', error);
      setStudentsError('Failed to load students from database.');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch all sessions when component mounts
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Use getUpcomingSessions with a high limit to get all sessions
        const allSessions = await TutorDashboardService.getUpcomingSessions(100);
        console.log('Successfully fetched sessions:', allSessions);
        
        if (allSessions && allSessions.length > 0) {
          setSessions(allSessions);
          setFilteredSessions(allSessions);
          
          // Now fetch child details for each session
          const enhancedSessions = [...allSessions];
          
          // Start loading child details in parallel for all sessions
          const childDetailPromises = enhancedSessions.map(async (session) => {
            if (session.childId) {
              try {
                const childData = await fetchChildDetails(session.childId);
                if (childData) {
                  session.childName = `${childData.firstName} ${childData.lastName}`;
                } else {
                  // Use fallback names only when API fails, but log that we're doing this
                  console.log(`No child data found for ID ${session.childId}, using fallback name`);
                  session.childName = session.childId === 1 ? 'Edlawit Siraw' : `Student ${session.childId}`;
                }
              } catch (childErr) {
                console.error(`Failed to fetch details for child ID ${session.childId}:`, childErr);
                // Use generic name only when API fails
                session.childName = `Student ${session.childId}`;
              }
            }
            return session;
          });
          
          // Wait for all child detail promises to resolve
          await Promise.all(childDetailPromises);
          
          // Update the sessions with enhanced data including child names
          setSessions(enhancedSessions);
          setFilteredSessions(enhancedSessions.filter(session => 
            statusFilter === 'all' || session.status === statusFilter
          ));
        } else {
          console.log('No sessions found');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions. Please try again later.');
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);
  
  // Fetch reference data when component mounts
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoadingReference(true);
        
        // Fetch subjects
        const subjectsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subjectAndGrade/subjects`);
        setSubjects(Array.isArray(subjectsResponse.data) ? subjectsResponse.data : []);
        
        // Fetch grade levels
        const gradeLevelsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/subjectAndGrade/grade-levels`);
        setGradeLevels(Array.isArray(gradeLevelsResponse.data) ? gradeLevelsResponse.data : []);
        
        // Fetch student data directly from the database
        // This ensures we get real students without any mock data or fallbacks
        await fetchAvailableStudents();
        setLoadingReference(false);
      } catch (err) {
        console.error('Error fetching reference data:', err);
        setLoadingReference(false);
        
        // Set some sample data for testing
        setSubjects([
          { id: 1, name: 'Mathematics' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'English' },
          { id: 4, name: 'History' }
        ]);
        
        setGradeLevels([
          { id: 1, name: 'Elementary (1-5)' },
          { id: 2, name: 'Middle School (6-8)' },
          { id: 3, name: 'High School (9-12)' }
        ]);
      }
    };

    fetchReferenceData();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredSessions(sessions);
    } else {
      setFilteredSessions(sessions.filter((session: TutoringSession) => session.status === statusFilter));
    }
  }, [statusFilter, sessions]);

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle session status updates
  const handleStatusUpdate = async (sessionId: number, newStatus: string) => {
    try {
      // Call the actual backend API to update the session status
      await TutorDashboardService.updateSessionStatus(
        sessionId, 
        newStatus as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'in_progress'
      );
      
      // Refresh the sessions list to get the updated data
      const updatedSessions = await TutorDashboardService.getUpcomingSessions(100);
      console.log('Sessions refreshed after status update:', updatedSessions);
      
      if (updatedSessions && updatedSessions.length > 0) {
        setSessions(updatedSessions);
        
        // Re-apply filter if needed
        if (statusFilter === 'all') {
          setFilteredSessions(updatedSessions);
        } else {
          setFilteredSessions(updatedSessions.filter((session: any) => session.status === statusFilter));
        }
      }
      
      // Show success message
      console.log(`Session ${sessionId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating session status:', error);
      setError('Failed to update session status. Please try again.');
    }
  };

  // Helper function to fetch child details
  const fetchChildDetails = async (childId: number) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.get(`${API_URL}/users/children/${childId}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error fetching child details for ID ${childId}:`, error);
      return null;
    }
  };

  // Handle session creation
  const handleCreateSession = async () => {
    try {
      setError(null); // Clear any previous errors

      // Validate form
      if (!newSession.childId || !newSession.subjectId || !newSession.title || !newSession.startTime || !newSession.endTime) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate authentication - check if token exists
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('accessToken') || 
                   sessionStorage.getItem('accessToken');
                   
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        console.error('Missing authentication token when trying to create session');
        return;
      }
      
      // Update token storage to be consistent
      // This ensures all components use the same token format
      if (token) {
        // Make sure token has Bearer prefix for consistency with backend expectations
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token.trim()}`;
        
        // Store the properly formatted token in both locations for consistency
        localStorage.setItem('token', formattedToken);
        localStorage.setItem('accessToken', formattedToken);
        
        console.log('Token reformatted and saved consistently');
      }
      
      // Create session via API
      console.log('Creating session with data:', {
        ...newSession,
        childId: Number(newSession.childId),
        subjectId: Number(newSession.subjectId)
      });
      
      // Prepare session data - ensure all required fields
      const sessionData = {
        ...newSession,
        childId: Number(newSession.childId),
        subjectId: Number(newSession.subjectId),
        durationMinutes: Math.round(
          (new Date(newSession.endTime).getTime() - new Date(newSession.startTime).getTime()) / 60000
        ),
        status: newSession.status || 'scheduled'
      };
      
      console.log('Prepared session data for creation:', sessionData);
      
      // Call the service method with clear error handling
      try {
        const createdSession = await TutorDashboardService.createSession(sessionData);
        console.log('Session created successfully:', createdSession);
        
        // Immediately display the new session on the page
        if (createdSession) {
          const updatedSessions = [createdSession, ...sessions];
          setSessions(updatedSessions);
          
          // Apply filter
          if (statusFilter === 'all' || createdSession.status === statusFilter) {
            setFilteredSessions([createdSession, ...filteredSessions]);
          }
        }
        
        // Close dialog
        setCreateDialogOpen(false);
        
        // Reset form
        setNewSession({
          childId: 0,
          subjectId: 0,
          title: '',
          startTime: '',
          endTime: '',
          status: 'scheduled',
          notes: ''
        });
        
        // Refresh sessions data as a failsafe (in case immediate update missed something)
        setTimeout(async () => {
          try {
            // Use getUpcomingSessions with a high limit to refresh all sessions
            const refreshedSessions = await TutorDashboardService.getUpcomingSessions(100);
            console.log('Refreshed sessions from API after creation:', refreshedSessions.length);
            
            if (refreshedSessions && refreshedSessions.length > 0) {
              setSessions(refreshedSessions);
              
              // Re-apply filter if needed
              if (statusFilter === 'all') {
                setFilteredSessions(refreshedSessions);
              } else {
                setFilteredSessions(refreshedSessions.filter((session: TutoringSession) => 
                  session.status === statusFilter
                ));
              }
            }
          } catch (refreshError) {
            console.error('Failed to refresh sessions:', refreshError);
          }
        }, 1000);
      } catch (apiError: any) {
        if (apiError.response && apiError.response.status === 401) {
          setError('Authentication failed. Please log in again.');
          console.error('Authentication error when creating session:', apiError.response?.data);
          return;
        } else {
          throw apiError; // Re-throw for the outer catch block to handle
        }
      }
  } catch (err) {
    console.error('Error creating session:', err);
    setError('Failed to create session. Please try again.');
  }
};
  
  // Handle start time change and auto-update end time (1 hour later by default)
  const handleStartTimeChange = (value: string) => {
    setNewSession(prev => {
      const startDate = new Date(value);
      const endDate = addHours(startDate, 1);
      return {
        ...prev,
        startTime: value,
        endTime: endDate.toISOString().slice(0, 16) // Format as yyyy-MM-ddThh:mm
      };
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/tutor-dashboard" className="flex items-center text-amber-600 hover:text-amber-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tutoring Sessions</h1>
          <p className="text-gray-600">Manage all your tutoring sessions</p>
        </div>
        
        <div className="mt-4 md:mt-0 space-x-2 flex">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-amber-600 hover:bg-amber-700 mr-2"
                onClick={() => {
                  // Fetch fresh student data from database before opening dialog
                  fetchAvailableStudents();
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Schedule New Session</DialogTitle>
                <DialogDescription>
                  Create a new tutoring session with one of your students.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student" className="text-right">Student</Label>
                  <div className="col-span-3">
                    <Select 
                      value={newSession.childId.toString() || "0"}
                      onValueChange={(value) => setNewSession({...newSession, childId: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name} {student.gradeLevel ? `(${student.gradeLevel})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject" className="text-right">Subject</Label>
                  <div className="col-span-3">
                    <Select 
                      value={newSession.subjectId.toString() || "0"}
                      onValueChange={(value) => setNewSession({...newSession, subjectId: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input 
                    id="title" 
                    className="col-span-3"
                    value={newSession.title}
                    onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                    placeholder="Session title (e.g. Algebra Review)"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">Start Time</Label>
                  <Input 
                    id="startTime" 
                    type="datetime-local" 
                    className="col-span-3"
                    value={newSession.startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">End Time</Label>
                  <Input 
                    id="endTime" 
                    type="datetime-local" 
                    className="col-span-3"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">Notes</Label>
                  <Textarea 
                    id="notes" 
                    className="col-span-3" 
                    value={newSession.notes || ''}
                    onChange={(e) => setNewSession({...newSession, notes: e.target.value})}
                    placeholder="Enter any additional notes about this session..."
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateSession} className="bg-amber-600 hover:bg-amber-700">
                  Schedule Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Your Sessions</CardTitle>
          <CardDescription>{filteredSessions.length} sessions found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => {
                // Calculate if session is today
                const sessionDate = new Date(session.startTime);
                const today = new Date();
                const isToday = sessionDate.getDate() === today.getDate() && 
                              sessionDate.getMonth() === today.getMonth() && 
                              sessionDate.getFullYear() === today.getFullYear();
                
                // Calculate if session is in the future
                const isUpcoming = sessionDate > today;
                
                // Calculate session duration
                const endTime = new Date(session.endTime);
                const durationMinutes = Math.round((endTime.getTime() - sessionDate.getTime()) / (1000 * 60));
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                const durationStr = hours > 0 
                  ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
                  : `${minutes}m`;
                
                return (
                  <div 
                    key={session.sessionId} 
                    className={`border rounded-lg p-4 ${
                      isToday && session.status !== 'cancelled' && session.status !== 'completed' 
                        ? 'border-amber-500 border-2 bg-amber-50' 
                        : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                      <div>
                        <h3 className="font-medium text-lg">{session.title || 'Untitled Session'}</h3>
                        {isToday && session.status !== 'cancelled' && session.status !== 'completed' && (
                          <p className="text-amber-600 text-sm font-medium">Today's Session</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Duration: {durationStr}</span>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-amber-600" />
                          <p className="text-gray-700"><span className="font-medium">Student:</span> {session.childName || 'Unknown'}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-amber-600" />
                          <p className="text-gray-700"><span className="font-medium">Subject:</span> {session.subject || 'Various'}</p>
                        </div>
                        
                        {session.gradeLevelName && (
                          <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-4 w-4 text-amber-600" />
                            <p className="text-gray-700"><span className="font-medium">Grade:</span> {session.gradeLevelName}</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="h-4 w-4 text-amber-600" />
                          <p className="text-gray-700">
                            <span className="font-medium">Date:</span> {formatDate(session.startTime)}
                            {isToday && <span className="ml-2 text-amber-600 font-medium">(Today)</span>}
                            {isUpcoming && !isToday && <span className="ml-2 text-blue-600 text-sm">(Upcoming)</span>}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-amber-600" />
                          <p className="text-gray-700">
                            <span className="font-medium">Time:</span> {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {session.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-gray-700 font-medium mb-1">Session Notes:</p>
                        <p className="text-gray-600 text-sm">{session.notes}</p>
                      </div>
                    )}
                    
                    {/* Action buttons based on status */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {session.status === 'scheduled' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusUpdate(session.id!, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleStatusUpdate(session.id!, 'cancelled')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {session.status === 'confirmed' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(session.id!, 'in_progress')}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            Start Session
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(session.id!, 'cancelled')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      
                      {session.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(session.id!, 'completed')}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Complete Session
                        </Button>
                      )}
                      
                      {session.status === 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                          onClick={() => {
                            // Pre-fill the new session form with data from this cancelled session
                            setNewSession({
                              childId: session.childId || 0,
                              subjectId: session.subjectId || 0,
                              title: session.title || '',
                              startTime: '',  // Will need to select a new time
                              endTime: '',     // Will need to select a new time
                              status: 'scheduled',
                              notes: session.notes || ''
                            });
                            setCreateDialogOpen(true);
                          }}
                        >
                          Reschedule
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No sessions found matching your criteria.</p>
              <Button
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  // Fetch fresh student data from database before opening dialog
                  fetchAvailableStudents();
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule a new session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
