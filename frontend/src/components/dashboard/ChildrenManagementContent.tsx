"use client"

import React, { useState, useEffect } from 'react'
import { ChildService, ChildDto } from '@/services/child.service'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  CalendarDays, 
  ChevronDown, 
  Edit, 
  MoreHorizontal, 
  Plus, 
  Trash2, 
  TrendingUp, 
  User 
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import ChildDetailView from './ChildDetailView'
import ChildProgressView from './ChildProgressView'

interface ChildrenManagementContentProps {
  parentId: string | undefined;
}

const ChildrenManagementContent: React.FC<ChildrenManagementContentProps> = ({ parentId }) => {
  const [children, setChildren] = useState<ChildDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<ChildDto | null>(null);
  const [showDetail, setShowDetail] = useState<boolean>(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ChildService.getChildren();
        setChildren(data);
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [parentId]);

  const handleViewDetails = (child: ChildDto) => {
    setSelectedChild(child);
    setShowDetail(true);
  };

  const handleCloseDetails = () => {
    setShowDetail(false);
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <Skeleton className="h-3 w-full mb-3" />
              <Skeleton className="h-4 w-2/3 mb-2" />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error loading children</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (children.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardHeader>
          <CardTitle>No Children Added Yet</CardTitle>
          <CardDescription>
            Get started by adding your first child to manage their tutoring journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="mt-4" variant="default">
            <Plus className="mr-2 h-4 w-4" /> Add Your First Child
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showDetail && selectedChild) {
    return <ChildProgressView childId={Number(selectedChild.childId)} onBack={handleCloseDetails} />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {children.map((child) => (
            <Card key={child.childId} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12 border-2 border-amber-100">
                  <AvatarImage src={child.photo || undefined} alt={`${child.firstName} ${child.lastName}`} />
                  <AvatarFallback className="bg-amber-100 text-amber-800">
                    {getInitials(child.firstName, child.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <CardTitle className="text-base">{child.firstName} {child.lastName}</CardTitle>
                  <CardDescription>
                    {ChildService.calculateAge(child.dateOfBirth)} years • {ChildService.getGradeName(child.gradeLevelId)}
                  </CardDescription>
                </div>
                
                <div className="ml-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(child)}>
                        <User className="mr-2 h-4 w-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CalendarDays className="mr-2 h-4 w-4" /> View Sessions
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Child
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <div className="mb-3">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{child.overallProgress || 0}%</span>
                  </div>
                  <Progress value={child.overallProgress || 0} className="h-2" />
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4 text-amber-500" />
                  <span>Next session: Tomorrow at 3:30 PM (Placeholder)</span>
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-2 pt-0">
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => handleViewDetails(child)}
                >
                  View Details
                </Button>
                <Button variant="outline" className="flex-1">
                  Schedule Session
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Card key={child.childId} className="overflow-hidden">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto border-4 border-amber-100">
                  <AvatarImage src={child.photo || undefined} alt={`${child.firstName} ${child.lastName}`} />
                  <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
                    {getInitials(child.firstName, child.lastName)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-2">{child.firstName} {child.lastName}</CardTitle>
                <CardDescription>
                  {ChildService.calculateAge(child.dateOfBirth)} years • {ChildService.getGradeName(child.gradeLevelId)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <h4 className="text-sm text-muted-foreground">Age</h4>
                    <p className="font-medium">{ChildService.calculateAge(child.dateOfBirth)} years</p>
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm text-muted-foreground">Grade</h4>
                    <p className="font-medium">{ChildService.getGradeName(child.gradeLevelId)}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Overall Progress</span>
                    <span className="font-medium">{child.overallProgress || 0}%</span>
                  </div>
                  <Progress value={child.overallProgress || 0} className="h-2" />
                </div>
              </CardContent>
              
              <CardFooter className="flex gap-2">
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => handleViewDetails(child)}
                >
                  View Details
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" /> Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CalendarDays className="mr-2 h-4 w-4" /> View Sessions
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Remove Child
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChildrenManagementContent;
