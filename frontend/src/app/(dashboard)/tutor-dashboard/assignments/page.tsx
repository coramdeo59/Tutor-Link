"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutorDashboardService, Assignment } from '@/services/tutor-dashboard.service';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, Plus, Filter, Eye, Edit, Trash2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TutorAssignments() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Fetch all assignments when component mounts
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const allAssignments = await TutorDashboardService.getRecentAssignments(100); // Get more assignments for management view
        setAssignments(allAssignments);
        setFilteredAssignments(allAssignments);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again later.');
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    let filtered = assignments;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === statusFilter);
    }
    
    // Apply search filter if there's a query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.title.toLowerCase().includes(query) || 
        assignment.description.toLowerCase().includes(query) ||
        (assignment.childName && assignment.childName.toLowerCase().includes(query))
      );
    }
    
    setFilteredAssignments(filtered);
  }, [statusFilter, searchQuery, assignments]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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

  // State for quick assignment form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    childId: 0,
    title: '',
    description: '',
    subjectId: 0,
    dueDate: '',
    notes: ''
  });
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<{id: number; name: string}[]>([]);
  const [studentLoading, setStudentLoading] = useState(false);

  // Fetch available students for assignment
  const fetchAvailableStudents = async () => {
    try {
      setStudentLoading(true);
      // Get students from the API
      const availableStudents = await TutorDashboardService.getAvailableStudents();
      
      // Log the raw student data to understand its structure
      console.log('Raw student data:', availableStudents);
      
      // Format students to ensure they have the correct structure
      const formattedStudents = availableStudents.map(student => ({
        id: student.childId || student.id, // Use childId if available, fall back to id
        childId: student.childId || student.id,
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        name: student.name || student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        gradeLevel: student.gradeLevelName || student.gradeLevel || ''
      }));
      
      console.log('Formatted students:', formattedStudents);
      setStudents(formattedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setStudentLoading(false);
    }
  };

  // Fetch subjects for the dropdown from reference data API
  const fetchSubjects = async () => {
    try {
      // Format token for the request
      const token = getFormattedToken();
      if (!token) {
        console.error('No authentication token found when fetching subjects');
        // Fall back to static data if no token
        setSubjects([
          { id: 1, name: 'Math' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'English' },
          { id: 4, name: 'History' }
        ]);
        return;
      }
      
      // Use the reference data endpoint from our previous implementation
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.get(
        `${API_URL}/users/tutors/reference/subjects`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Subjects from reference data:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setSubjects(response.data);
      } else {
        // Fall back to static data if response format is unexpected
        console.warn('Unexpected format from subject reference API, using static data');
        setSubjects([
          { id: 1, name: 'Math' },
          { id: 2, name: 'Science' },
          { id: 3, name: 'English' },
          { id: 4, name: 'History' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Fall back to static data on error
      setSubjects([
        { id: 1, name: 'Math' },
        { id: 2, name: 'Science' },
        { id: 3, name: 'English' },
        { id: 4, name: 'History' }
      ]);
    }
  };

  // Helper function for consistent token formatting - applying our previous fix for JWT issues
  const getFormattedToken = () => {
    // Try multiple storage locations (from memory)
    const token = 
      localStorage.getItem('token') || 
      localStorage.getItem('accessToken') || 
      sessionStorage.getItem('token') || 
      sessionStorage.getItem('accessToken');
    
    if (!token) {
      console.error('No authentication token found');
      return '';
    }
    
    // Ensure consistent Bearer prefix
    return token.startsWith('Bearer ') ? token : `Bearer ${token.trim()}`;
  };

  // Create a new assignment using our quick assign endpoint
  const handleCreateAssignment = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate form
      if (!newAssignment.childId || !newAssignment.title || !newAssignment.subjectId || !newAssignment.dueDate) {
        setError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Verify authentication - check token and format it correctly
      const token = getFormattedToken();
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      // Ensure token is stored consistently for future requests
      localStorage.setItem('token', token);
      localStorage.setItem('accessToken', token);
      
      console.log('Creating assignment with data:', newAssignment);
      
      // Call the service method to create the assignment
      const result = await TutorDashboardService.quickAssignHomework({
        ...newAssignment,
        childId: Number(newAssignment.childId),
        subjectId: Number(newAssignment.subjectId)
      });

      console.log('Assignment created successfully:', result);
      
      // Close dialog and reset form
      setCreateDialogOpen(false);
      setNewAssignment({
        childId: 0,
        title: '',
        description: '',
        subjectId: 0,
        dueDate: '',
        notes: ''
      });
      
      // Refresh the assignments list
      const refreshedAssignments = await TutorDashboardService.getRecentAssignments(100);
      setAssignments(refreshedAssignments);
      setFilteredAssignments(refreshedAssignments);
      
    } catch (error) {
      console.error('Error creating assignment:', error);
      
      // Better error handling for authentication issues
      if (error.response && error.response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response && error.response.data && error.response.data.message) {
        setError(`Error: ${error.response.data.message}`);
      } else {
        setError('Failed to create assignment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-gray-600">Create and manage assignments for your students</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  // Load students and subjects when opening dialog
                  fetchAvailableStudents();
                  fetchSubjects();
                  // Clear any previous errors
                  setError(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Quick Assignment</DialogTitle>
                <DialogDescription>
                  Quickly assign homework to a student with minimal details required.
                </DialogDescription>
              </DialogHeader>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                  <p>{error}</p>
                </div>
              )}
              
              <div className="grid gap-4 py-4">
                {/* Student selection */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="student" className="text-right font-medium">
                    Student *
                  </label>
                  <div className="col-span-3">
                    <Select 
                      value={newAssignment.childId ? newAssignment.childId.toString() : ""}
                      onValueChange={(value) => setNewAssignment({...newAssignment, childId: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentLoading ? (
                          <SelectItem value="loading" disabled>Loading students...</SelectItem>
                        ) : students.length === 0 ? (
                          <SelectItem value="none" disabled>No students available</SelectItem>
                        ) : (
                          students.map(student => {
                            // Make sure we have a valid ID and display name
                            const displayId = student.childId || student.id;
                            const displayName = student.name || student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim();
                            
                            // Only render items with valid IDs
                            if (displayId) {
                              return (
                                <SelectItem key={displayId} value={displayId.toString()}>
                                  {displayName || `Student ${displayId}`}
                                  {student.gradeLevel ? ` (${student.gradeLevel})` : ''}
                                </SelectItem>
                              );
                            }
                            return null;
                          }).filter(Boolean)
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Title */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="title" className="text-right font-medium">
                    Title *
                  </label>
                  <Input 
                    id="title" 
                    placeholder="Assignment title" 
                    className="col-span-3" 
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  />
                </div>
                
                {/* Subject selection */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="subject" className="text-right font-medium">
                    Subject *
                  </label>
                  <div className="col-span-3">
                    <Select 
                      value={newAssignment.subjectId ? newAssignment.subjectId.toString() : ""}
                      onValueChange={(value) => setNewAssignment({...newAssignment, subjectId: parseInt(value)})}
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
                
                {/* Due Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="dueDate" className="text-right font-medium">
                    Due Date *
                  </label>
                  <Input 
                    id="dueDate" 
                    type="date" 
                    className="col-span-3"
                    value={newAssignment.dueDate}
                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                  />
                </div>
                
                {/* Description */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right font-medium">
                    Description *
                  </label>
                  <Input 
                    id="description" 
                    placeholder="Brief description of the assignment" 
                    className="col-span-3"
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  />
                </div>
                
                {/* Notes */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="notes" className="text-right font-medium">
                    Notes
                  </label>
                  <Input 
                    id="notes" 
                    placeholder="Additional notes or instructions (optional)" 
                    className="col-span-3"
                    value={newAssignment.notes || ''}
                    onChange={(e) => setNewAssignment({...newAssignment, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleCreateAssignment} 
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Assign Homework'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="late">Late</SelectItem>
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
          <CardTitle>Your Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="mb-4">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.assignmentId} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Student: {assignment.childName || 'Unknown'}</p>
                      <p className="text-gray-600 line-clamp-2">{assignment.description}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Due: {formatDate(assignment.dueDate)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 mt-4 md:mt-0">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/tutor-dashboard/assignments/${assignment.assignmentId}`}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No assignments found matching the selected filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
