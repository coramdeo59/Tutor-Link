"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { ArrowLeft, GraduationCap, Plus, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';

// Define interfaces for the subject data
interface Subject {
  id: number;
  name: string;
}

interface GradeLevel {
  id: number;
  name: string;
}

export default function TutorSubjects() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mySubjects, setMySubjects] = useState<Subject[]>([]);
  const [myGradeLevels, setMyGradeLevels] = useState<GradeLevel[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allGradeLevels, setAllGradeLevels] = useState<GradeLevel[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'subjects' | 'grades'>('subjects');
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // IDs of selected items

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch all reference data and tutor's selections when component mounts
  useEffect(() => {
    const fetchSubjectsAndGrades = async () => {
      try {
        setLoading(true);

        // Get all available subjects from reference data
        const subjectsResponse = await axios.get(
          `${API_URL}/users/tutors/reference/subjects`,
          { headers: getAuthHeaders() }
        );
        setAllSubjects(subjectsResponse.data);

        // Get all available grade levels from reference data
        const gradesResponse = await axios.get(
          `${API_URL}/users/tutors/reference/grade-levels`,
          { headers: getAuthHeaders() }
        );
        setAllGradeLevels(gradesResponse.data);

        // Get tutor's selected subjects
        const mySubjectsResponse = await axios.get(
          `${API_URL}/users/tutors/profile/me`,
          { headers: getAuthHeaders() }
        );
        
        // This assumes the API returns the tutor profile with subjects and grade levels
        // You may need to adjust this based on the actual API response structure
        if (mySubjectsResponse.data.subjects) {
          setMySubjects(mySubjectsResponse.data.subjects);
        }
        
        if (mySubjectsResponse.data.gradeLevels) {
          setMyGradeLevels(mySubjectsResponse.data.gradeLevels);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching subjects and grades:', err);
        setError('Failed to load subjects and grade levels. Please try again later.');
        setLoading(false);
      }
    };

    fetchSubjectsAndGrades();
  }, [API_URL]);

  // Handle opening the dialog with pre-selected items
  const handleOpenDialog = (type: 'subjects' | 'grades') => {
    setDialogType(type);
    
    // Pre-select items based on what the tutor already has
    if (type === 'subjects') {
      setSelectedItems(mySubjects.map(subject => subject.id));
    } else {
      setSelectedItems(myGradeLevels.map(grade => grade.id));
    }
    
    setDialogOpen(true);
  };

  // Handle item selection
  const handleItemToggle = (id: number) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Save the selected items
  const handleSaveSelections = async () => {
    try {
      if (dialogType === 'subjects') {
        await axios.post(
          `${API_URL}/users/tutors/select/subjects`,
          { subjectIds: selectedItems },
          { headers: getAuthHeaders() }
        );
        
        // Update the local state with the selected subjects
        const selectedSubjects = allSubjects.filter(subject => 
          selectedItems.includes(subject.id)
        );
        setMySubjects(selectedSubjects);
      } else {
        await axios.post(
          `${API_URL}/users/tutors/select/grade-levels`,
          { gradeLevelIds: selectedItems },
          { headers: getAuthHeaders() }
        );
        
        // Update the local state with the selected grade levels
        const selectedGrades = allGradeLevels.filter(grade => 
          selectedItems.includes(grade.id)
        );
        setMyGradeLevels(selectedGrades);
      }
      
      setDialogOpen(false);
    } catch (err) {
      console.error(`Error saving ${dialogType}:`, err);
      setError(`Failed to save ${dialogType}. Please try again later.`);
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
          <h1 className="text-2xl font-bold">Subjects & Grade Levels</h1>
          <p className="text-gray-600">Manage what you teach and the grade levels you cover</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subjects Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Subjects You Teach</CardTitle>
            <Button 
              size="sm" 
              onClick={() => handleOpenDialog('subjects')} 
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Edit Subjects
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : mySubjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {mySubjects.map(subject => (
                  <Badge key={subject.id} variant="secondary" className="px-3 py-1 text-sm">
                    {subject.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't selected any subjects yet. Click 'Edit Subjects' to add subjects you teach.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Grade Levels Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Grade Levels You Teach</CardTitle>
            <Button 
              size="sm" 
              onClick={() => handleOpenDialog('grades')} 
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Edit Grades
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : myGradeLevels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {myGradeLevels.map(grade => (
                  <Badge key={grade.id} variant="secondary" className="px-3 py-1 text-sm">
                    {grade.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">You haven't selected any grade levels yet. Click 'Edit Grades' to add grade levels you teach.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Selection Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'subjects' ? 'Select Subjects You Teach' : 'Select Grade Levels You Teach'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'subjects' 
                ? 'Check all subjects that you are qualified to teach.'
                : 'Check all grade levels that you are comfortable teaching.'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] p-4 border rounded-md">
            <div className="space-y-4">
              {(dialogType === 'subjects' ? allSubjects : allGradeLevels).map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`item-${item.id}`}
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                  />
                  <label htmlFor={`item-${item.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveSelections}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
