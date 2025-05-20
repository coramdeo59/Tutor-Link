"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, addDays, startOfWeek, addWeeks } from 'date-fns';
import { ArrowLeft, ArrowRight, Clock, Calendar, Plus, Save, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axios from 'axios';

// Define interfaces for the availability data
interface TimeSlot {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
}

export default function TutorAvailability() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [editMode, setEditMode] = useState(false);
  const [newSlot, setNewSlot] = useState<Omit<TimeSlot, 'id'> | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch availability data when component mounts or week changes
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        
        // Get tutor's availability for the selected week
        const response = await axios.get(
          `${API_URL}/users/tutors/availability`,
          { 
            headers: getAuthHeaders(),
            params: {
              weekStart: format(currentWeekStart, 'yyyy-MM-dd')
            } 
          }
        );
        
        setAvailableSlots(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching availability:', err);
        setError('Failed to load availability data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [API_URL, currentWeekStart]);

  // Generate days for the week view
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeekStart, i);
    return {
      date: day,
      name: format(day, 'EEEE'),
      formattedDate: format(day, 'MMM dd')
    };
  });

  // Handle week navigation
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevDate => addWeeks(prevDate, -1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prevDate => addWeeks(prevDate, 1));
  };

  // Handle adding a new time slot
  const handleAddSlot = () => {
    setNewSlot({
      day: format(weekDays[0].date, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      isRecurring: false
    });
    setEditMode(true);
  };

  // Handle saving the new time slot
  const handleSaveSlot = async () => {
    if (!newSlot) return;

    try {
      // Validate that start time is before end time
      if (newSlot.startTime >= newSlot.endTime) {
        toast.error('Start time must be before end time');
        return;
      }

      const response = await axios.post(
        `${API_URL}/users/tutors/availability`,
        newSlot,
        { headers: getAuthHeaders() }
      );

      // Add the new slot to the list
      setAvailableSlots(prev => [...prev, { ...newSlot, id: response.data.id }]);
      setNewSlot(null);
      setEditMode(false);
      toast.success('Availability slot added successfully');
    } catch (err) {
      console.error('Error saving availability slot:', err);
      toast.error('Failed to save availability slot');
    }
  };

  // Handle cancelling the addition of a new slot
  const handleCancelAddSlot = () => {
    setNewSlot(null);
    setEditMode(false);
  };

  // Handle deleting a time slot
  const handleDeleteSlot = async (slotId: number) => {
    try {
      await axios.delete(
        `${API_URL}/users/tutors/availability/${slotId}`,
        { headers: getAuthHeaders() }
      );

      // Remove the slot from the list
      setAvailableSlots(prev => prev.filter(slot => slot.id !== slotId));
      toast.success('Availability slot deleted successfully');
    } catch (err) {
      console.error('Error deleting availability slot:', err);
      toast.error('Failed to delete availability slot');
    }
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    try {
      // Assuming timeString is in format HH:MM
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return format(date, 'h:mm a');
    } catch (err) {
      return timeString;
    }
  };

  // Helper function to get slots for a specific day
  const getSlotsForDay = (dayDate: Date) => {
    const formattedDate = format(dayDate, 'yyyy-MM-dd');
    return availableSlots.filter(slot => slot.day === formattedDate);
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
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="text-gray-600">Set your teaching schedule and availability</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          {!editMode && (
            <Button 
              onClick={handleAddSlot}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={goToPreviousWeek}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Week
        </Button>
        
        <h2 className="text-lg font-medium">
          {format(currentWeekStart, 'MMMM d')} - {format(addDays(currentWeekStart, 6), 'MMMM d, yyyy')}
        </h2>
        
        <Button variant="outline" onClick={goToNextWeek}>
          Next Week
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
      
      {/* New Time Slot Form */}
      {editMode && newSlot && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="day">Day</Label>
                <select
                  id="day"
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  {weekDays.map(day => (
                    <option key={day.date.toISOString()} value={format(day.date, 'yyyy-MM-dd')}>
                      {day.name} ({day.formattedDate})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={newSlot.isRecurring}
                  onChange={(e) => setNewSlot({...newSlot, isRecurring: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isRecurring">Repeat weekly</Label>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={handleCancelAddSlot}>Cancel</Button>
              <Button className="bg-amber-600 hover:bg-amber-700" onClick={handleSaveSlot}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Weekly Calendar View */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <Card key={day.date.toISOString()} className="overflow-hidden">
            <CardHeader className="p-3 bg-gray-50">
              <div className="text-center">
                <div className="font-medium">{day.name}</div>
                <div className="text-sm text-gray-500">{day.formattedDate}</div>
              </div>
            </CardHeader>
            <CardContent className="p-3 min-h-[100px]">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : (
                <div className="space-y-2">
                  {getSlotsForDay(day.date).length > 0 ? (
                    getSlotsForDay(day.date).map((slot) => (
                      <div key={slot.id} className="bg-amber-50 p-2 rounded border border-amber-200 flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-amber-600" />
                          <span className="text-xs">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm">
                      No slots
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
