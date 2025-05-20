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

  // This would create a new assignment in a real implementation
  const handleCreateAssignment = () => {
    console.log('Create assignment');
    setCreateDialogOpen(false);
    // Here would be the API call to create an assignment
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
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>
                  Fill out the form below to create a new assignment for your students.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="title" className="text-right font-medium">
                    Title
                  </label>
                  <Input id="title" placeholder="Assignment title" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="student" className="text-right font-medium">
                    Student
                  </label>
                  <Select>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student1">Student 1</SelectItem>
                      <SelectItem value="student2">Student 2</SelectItem>
                      <SelectItem value="student3">Student 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="description" className="text-right font-medium">
                    Description
                  </label>
                  <textarea 
                    id="description" 
                    placeholder="Assignment description" 
                    className="col-span-3 min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="dueDate" className="text-right font-medium">
                    Due Date
                  </label>
                  <Input id="dueDate" type="date" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateAssignment} className="bg-amber-600 hover:bg-amber-700">
                  Create Assignment
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
