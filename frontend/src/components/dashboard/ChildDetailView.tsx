"use client"

import React, { useState, useEffect } from 'react'
import { ChildDto, ChildService } from '@/services/child.service'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  BookOpen, 
  CalendarDays, 
  Clock, 
  Edit, 
  GraduationCap,
  LineChart, 
  ListTodo, 
  BarChart, 
  User
} from "lucide-react"

// Mock data for subjects and sessions - in a real app, this would come from API
const mockSubjects = [
  { id: 1, name: 'Mathematics', progress: 75, sessions: 12 },
  { id: 2, name: 'Science', progress: 68, sessions: 8 },
  { id: 3, name: 'English', progress: 82, sessions: 10 },
];

const mockSessions = [
  { 
    id: 1, 
    date: '2025-05-22T15:30:00', 
    subject: 'Mathematics', 
    tutor: 'Mr. Johnson',
    duration: 60,
    status: 'upcoming'
  },
  { 
    id: 2, 
    date: '2025-05-25T14:00:00', 
    subject: 'Science', 
    tutor: 'Ms. Williams',
    duration: 60,
    status: 'upcoming'
  },
  { 
    id: 3, 
    date: '2025-05-18T16:30:00', 
    subject: 'English', 
    tutor: 'Mrs. Thompson',
    duration: 60,
    status: 'completed'
  },
];

interface ChildDetailViewProps {
  child: ChildDto;
  onBack: () => void;
}

const ChildDetailView: React.FC<ChildDetailViewProps> = ({ child, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatSessionDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    // Check if the date is tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    // Default format for other dates
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  const getSessionStatusColor = (status: string): string => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold">Child Profile</h2>
      </div>
      
      <Card className="border-none shadow-md">
        <CardHeader className="pb-0">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-amber-100">
              <AvatarImage src={child.photo || undefined} alt={`${child.firstName} ${child.lastName}`} />
              <AvatarFallback className="bg-amber-100 text-amber-800 text-2xl">
                {getInitials(child.firstName, child.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">{child.firstName} {child.lastName}</CardTitle>
              <CardDescription className="text-base flex flex-wrap items-center gap-2">
                <span>{ChildService.calculateAge(child.dateOfBirth)} years old</span>
                <span className="text-gray-400">•</span>
                <span>{ChildService.getGradeName(child.gradeLevelId)}</span>
                <span className="text-gray-400">•</span>
                <span>Username: {child.username}</span>
              </CardDescription>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Schedule Session
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-amber-500" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Total Progress</span>
                    <span className="font-medium">{child.overallProgress || 0}%</span>
                  </div>
                  <Progress value={child.overallProgress || 0} className="h-2.5" />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">3</div>
                      <div className="text-sm text-gray-600">Subjects</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">12</div>
                      <div className="text-sm text-gray-600">Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">8h</div>
                      <div className="text-sm text-gray-600">Total Hours</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-600">2</div>
                      <div className="text-sm text-gray-600">Upcoming</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-amber-500" />
                      Recent Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockSubjects.slice(0, 3).map(subject => (
                        <div key={subject.id}>
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{subject.name}</span>
                            <span>{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-amber-500" />
                      Upcoming Sessions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockSessions
                        .filter(session => session.status === 'upcoming')
                        .slice(0, 3)
                        .map(session => (
                          <div key={session.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-md">
                            <div className="bg-amber-100 p-2 rounded-full">
                              <Clock className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <div className="font-medium">{session.subject}</div>
                              <div className="text-sm text-gray-600">
                                {formatSessionDate(session.date)} • {session.tutor}
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {mockSessions.filter(session => session.status === 'upcoming').length === 0 && (
                        <div className="text-center py-3 text-gray-500">
                          No upcoming sessions
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subject Progress</CardTitle>
                  <CardDescription>
                    Track progress across all subjects your child is studying
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {mockSubjects.map(subject => (
                      <div key={subject.id} className="rounded-md border p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <Badge variant="outline">{subject.sessions} Sessions</Badge>
                        </div>
                        
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2.5 mb-4" />
                        
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm">View Details</Button>
                          <Button variant="default" size="sm">Schedule Session</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sessions" className="space-y-6 pt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">All Sessions</h3>
                <Button variant="outline" size="sm">Schedule New Session</Button>
              </div>
              
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past Sessions</TabsTrigger>
                  <TabsTrigger value="all">All Sessions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="pt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {mockSessions
                          .filter(session => session.status === 'upcoming')
                          .map(session => (
                            <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="bg-amber-100 p-2 rounded-full">
                                  <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{session.subject}</div>
                                  <div className="text-sm text-gray-600">
                                    {formatSessionDate(session.date)} • {session.duration} min
                                  </div>
                                  <div className="text-sm text-gray-500">Tutor: {session.tutor}</div>
                                </div>
                              </div>
                              <Badge className={getSessionStatusColor(session.status)}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </Badge>
                            </div>
                          ))}
                        
                        {mockSessions.filter(session => session.status === 'upcoming').length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            No upcoming sessions scheduled
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="past" className="pt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {mockSessions
                          .filter(session => session.status === 'completed')
                          .map(session => (
                            <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                              <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-2 rounded-full">
                                  <Clock className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{session.subject}</div>
                                  <div className="text-sm text-gray-600">
                                    {formatSessionDate(session.date)} • {session.duration} min
                                  </div>
                                  <div className="text-sm text-gray-500">Tutor: {session.tutor}</div>
                                </div>
                              </div>
                              <Badge className={getSessionStatusColor(session.status)}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </Badge>
                            </div>
                          ))}
                        
                        {mockSessions.filter(session => session.status === 'completed').length === 0 && (
                          <div className="text-center py-6 text-gray-500">
                            No past sessions found
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="all" className="pt-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {mockSessions.map(session => (
                          <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-full ${
                                session.status === 'completed' ? 'bg-green-100' : 'bg-amber-100'
                              }`}>
                                <Clock className={`h-5 w-5 ${
                                  session.status === 'completed' ? 'text-green-600' : 'text-amber-600'
                                }`} />
                              </div>
                              <div>
                                <div className="font-medium">{session.subject}</div>
                                <div className="text-sm text-gray-600">
                                  {formatSessionDate(session.date)} • {session.duration} min
                                </div>
                                <div className="text-sm text-gray-500">Tutor: {session.tutor}</div>
                              </div>
                            </div>
                            <Badge className={getSessionStatusColor(session.status)}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-amber-500" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <dt className="text-sm text-gray-500">First Name</dt>
                      <dd className="text-base font-medium">{child.firstName}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm text-gray-500">Last Name</dt>
                      <dd className="text-base font-medium">{child.lastName}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm text-gray-500">Username</dt>
                      <dd className="text-base font-medium">{child.username}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm text-gray-500">Date of Birth</dt>
                      <dd className="text-base font-medium">{formatDate(child.dateOfBirth)}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm text-gray-500">Age</dt>
                      <dd className="text-base font-medium">{ChildService.calculateAge(child.dateOfBirth)} years</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm text-gray-500">Grade Level</dt>
                      <dd className="text-base font-medium">{ChildService.getGradeName(child.gradeLevelId)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-amber-500" />
                    Educational Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-4">
                    This section will display educational preferences, learning style, and academic information for your child.
                  </p>
                  
                  <Button variant="outline">Edit Educational Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChildDetailView;
