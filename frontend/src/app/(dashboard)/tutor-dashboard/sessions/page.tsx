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
  name: string;
  gradeLevel?: string;
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
  
  // Reference data state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [gradeLevels, setGradeLevels] = useState<GradeLevel[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingReference, setLoadingReference] = useState(false);
  
  // New session dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState<SessionFormData>({
    childId: 0,
    subjectId: 0,
    title: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
    notes: ''
  });

  // Fetch all sessions when component mounts
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // Use getAllSessions to get all sessions including past ones
        const allSessions = await TutorDashboardService.getAllSessions();
        setSessions(allSessions);
        setFilteredSessions(allSessions);
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
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // Get authentication headers
        const token = localStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        // Fetch subjects
        const subjectsResponse = await axios.get(
          `${API_URL}/users/tutors/reference/subjects`,
          { headers }
        );
        setSubjects(subjectsResponse.data || []);
        
        // Fetch grade levels
        const gradeLevelsResponse = await axios.get(
          `${API_URL}/users/tutors/reference/grade-levels`,
          { headers }
        );
        setGradeLevels(gradeLevelsResponse.data || []);
        
        // Fetch students (assuming there's an endpoint for this)
        try {
          const studentsResponse = await axios.get(
            `${API_URL}/users/tutors/students`,
            { headers }
          );
          setStudents(studentsResponse.data || []);
        } catch (studentErr) {
          console.error('Error fetching students:', studentErr);
          // Continue with empty students array
          setStudents([
            { id: 1, name: 'Emma Johnson', gradeLevel: '5th Grade' },
            { id: 2, name: 'James Smith', gradeLevel: '8th Grade' },
            { id: 3, name: 'Sophia Williams', gradeLevel: '3rd Grade' }
          ]);
        }
        
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
      setFilteredSessions(sessions.filter(session => session.status === statusFilter));
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
      const updatedSessions = await TutorDashboardService.getAllSessions();
      setSessions(updatedSessions);
      
      // Re-apply filter if needed
      if (statusFilter === 'all') {
        setFilteredSessions(updatedSessions);
      } else {
        setFilteredSessions(updatedSessions.filter(session => session.status === statusFilter));
      }
      
      // Show success message
      console.log(`Session ${sessionId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating session status:', error);
      setError('Failed to update session status. Please try again.');
    }
  };

  // Handle session creation
  const handleCreateSession = async () => {
    try {
      // Validate form
      if (!newSession.childId || !newSession.subjectId || !newSession.title || !newSession.startTime || !newSession.endTime) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Create session via API
      const token = localStorage.getItem('token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.post(
        `${API_URL}/tutors/sessions`,
        {
          ...newSession,
          childId: Number(newSession.childId),
          subjectId: Number(newSession.subjectId)
        },
        { headers }
      );
      
      // Close dialog and refresh sessions
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
      
      // Refresh session list
      const updatedSessions = await TutorDashboardService.getAllSessions();
      setSessions(updatedSessions);
      
      // Re-apply any filters
      if (statusFilter === 'all') {
        setFilteredSessions(updatedSessions);
      } else {
        setFilteredSessions(updatedSessions.filter(session => session.status === statusFilter));
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
              <Button className="bg-amber-600 hover:bg-amber-700 mr-2">
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
                          <Calendar className="h-4 w-4 text-amber-600" />
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
                            onClick={() => handleStatusUpdate(session.sessionId, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleStatusUpdate(session.sessionId, 'cancelled')}
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
                            onClick={() => handleStatusUpdate(session.sessionId, 'in_progress')}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            Start Session
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(session.sessionId, 'cancelled')}
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
                          onClick={() => handleStatusUpdate(session.sessionId, 'completed')}
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
                onClick={() => setCreateDialogOpen(true)}
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
