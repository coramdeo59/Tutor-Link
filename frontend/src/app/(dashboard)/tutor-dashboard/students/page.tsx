"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { ArrowLeft, User, Search, GraduationCap, Calendar, Clock, MailIcon, PhoneIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from 'axios';

// Define interfaces for student data
interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  grade: string;
  subjects: string[];
  sessions: number;
  lastSession?: string;
  nextSession?: string;
  parentName?: string;
}

export default function TutorStudents() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch students data when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // Get tutor's students
        const response = await axios.get(
          `${API_URL}/users/tutors/students`,
          { headers: getAuthHeaders() }
        );
        
        setStudents(response.data || []);
        setFilteredStudents(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError('Failed to load students data. Please try again later.');
        setLoading(false);
      }
    };

    fetchStudents();
  }, [API_URL]);

  // Apply search filter when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStudents(students);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(query) || 
      student.grade.toLowerCase().includes(query) ||
      student.subjects.some(subject => subject.toLowerCase().includes(query)) ||
      (student.email && student.email.toLowerCase().includes(query))
    );
    
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled';
    
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return dateString;
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
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-gray-600">Manage all your students in one place</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search by name, grade, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <Tabs defaultValue="grid" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-32 mb-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="border overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>{student.name}</CardTitle>
                      <User className="text-gray-400 h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{student.grade}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span>Next: {formatDate(student.nextSession)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{student.sessions} sessions total</span>
                      </div>
                      
                      <div className="pt-2">
                        <div className="text-xs font-medium text-gray-500 mb-1">Subjects</div>
                        <div className="flex flex-wrap gap-1">
                          {student.subjects.map((subject, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tutor-dashboard/students/${student.id}`}>
                            View Profile
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100">
                          Schedule Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No students match your search criteria.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Students List</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b pb-4">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-64 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : filteredStudents.length > 0 ? (
                <div className="divide-y">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1 mb-3 md:mb-0">
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-500">{student.grade}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.subjects.map((subject, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end md:space-y-1">
                        {student.email && (
                          <div className="flex items-center text-sm space-x-2">
                            <MailIcon className="h-4 w-4 text-gray-500" />
                            <span>{student.email}</span>
                          </div>
                        )}
                        
                        {student.phone && (
                          <div className="flex items-center text-sm space-x-2">
                            <PhoneIcon className="h-4 w-4 text-gray-500" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>Next: {formatDate(student.nextSession)}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-3 md:mt-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/tutor-dashboard/students/${student.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                        >
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6">
                  <p className="text-gray-500">No students match your search criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
