"use client"

import React, { useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import ChildrenManagementContent from '@/components/dashboard/ChildrenManagementContent'
import AddChildForm from '@/components/dashboard/AddChildForm'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function ChildrenManagementPage() {
  const { user, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Use this to force re-fetch of children data
  
  const handleAddChildSuccess = () => {
    setIsDialogOpen(false);
    toast.success("Child added successfully");
    setRefreshKey(prev => prev + 1); // Trigger a refresh of the children list
  };
  
  const handleCancel = () => {
    setIsDialogOpen(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Children Management</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600">
              <Plus className="mr-2 h-4 w-4" /> Add Child
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add a New Child</DialogTitle>
              <DialogDescription>
                Add a new child to manage their tutoring journey. Fill out the form below with your child's information.
              </DialogDescription>
            </DialogHeader>
            
            {user?.id && (
              <AddChildForm 
                parentId={String(user.id)} 
                onSuccess={handleAddChildSuccess} 
                onCancel={handleCancel} 
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {loading ? (
        <div className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
          <div className="h-8 w-1/3 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
        </div>
      ) : (
        <ChildrenManagementContent key={refreshKey} parentId={user?.id ? String(user.id) : undefined} />
      )}
    </div>
  )
}
