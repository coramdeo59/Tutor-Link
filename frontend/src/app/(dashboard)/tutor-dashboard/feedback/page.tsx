"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutorDashboardService, Feedback } from '@/services/tutor-dashboard.service';
import { format } from 'date-fns';
import { Calendar, ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, Smile, Frown } from 'lucide-react';
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

export default function TutorFeedback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);

  // Fetch all feedback when component mounts
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const allFeedback = await TutorDashboardService.getRecentFeedback(100); // Get more feedback for management view
        setFeedback(allFeedback);
        setFilteredFeedback(allFeedback);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  // Apply filters when filter state changes
  useEffect(() => {
    let filtered = feedback;
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.feedbackType === typeFilter);
    }
    
    // Apply search filter if there's a query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.content.toLowerCase().includes(query) ||
        (item.childName && item.childName.toLowerCase().includes(query))
      );
    }
    
    setFilteredFeedback(filtered);
  }, [typeFilter, searchQuery, feedback]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (err) {
      return dateString;
    }
  };

  // Helper function to get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'question':
        return 'bg-blue-100 text-blue-800';
      case 'suggestion':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get feedback type icon
  const getFeedbackTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4" />;
      case 'question':
        return <MessageSquare className="h-4 w-4" />;
      case 'suggestion':
        return <Smile className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // This would send a reply to feedback in a real implementation
  const handleReplyToFeedback = () => {
    console.log('Reply to feedback', selectedFeedback?.feedbackId);
    setReplyDialogOpen(false);
    // Here would be the API call to save the reply
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
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-gray-600">View and respond to feedback from your students</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Feedback</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
              <SelectItem value="question">Question</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
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
          <CardTitle>Student Feedback</CardTitle>
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
          ) : filteredFeedback.length > 0 ? (
            <div className="space-y-4">
              {filteredFeedback.map((feedbackItem) => (
                <div key={feedbackItem.feedbackId} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-2">
                    <h3 className="font-medium">{feedbackItem.title}</h3>
                    <Badge className={getTypeBadgeColor(feedbackItem.feedbackType)}>
                      <span className="flex items-center gap-1">
                        {getFeedbackTypeIcon(feedbackItem.feedbackType)}
                        <span>{feedbackItem.feedbackType}</span>
                      </span>
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">From: {feedbackItem.childName || 'Anonymous'}</p>
                      <p className="text-gray-600">{feedbackItem.content}</p>
                      <div className="flex items-center gap-1 mt-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        Received: {formatDate(feedbackItem.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 mt-4 md:mt-0">
                      <Button 
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700"
                        onClick={() => {
                          setSelectedFeedback(feedbackItem);
                          setReplyDialogOpen(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" /> Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No feedback found matching the selected filters.</p>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Feedback</DialogTitle>
            <DialogDescription>
              Send a response to {selectedFeedback?.childName || 'this student'} regarding their feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <h4 className="font-medium mb-1">{selectedFeedback?.title}</h4>
              <p className="text-sm text-gray-600">{selectedFeedback?.content}</p>
            </div>
            <textarea 
              placeholder="Type your reply here..." 
              className="w-full min-h-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleReplyToFeedback} className="bg-amber-600 hover:bg-amber-700">
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
