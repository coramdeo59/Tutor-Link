"use client"

import { useState } from "react"
import { Edit, PlusCircle, Trash2, School } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Mock data for the children
const initialChildren = [
  {
    id: 1,
    name: "Emma Smith",
    age: 14,
    grade: "8th Grade",
    subjects: ["Mathematics", "Science", "English"],
    photo: "",
    username: "emma_smith",
    hasAccount: true
  },
  {
    id: 2,
    name: "Jack Smith",
    age: 10,
    grade: "5th Grade",
    subjects: ["Reading", "Mathematics"],
    photo: "",
    username: "jack_smith",
    hasAccount: true
  }
]

export function ChildrenManagementContent() {
  const [children, setChildren] = useState(initialChildren)
  const [isAddingChild, setIsAddingChild] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null)
  
  // Form state for adding a new child
  const [newChild, setNewChild] = useState({
    name: "",
    age: "",
    grade: "",
    username: "",
    password: ""
  })

  // Handler for adding a child
  const handleAddChild = () => {
    // In a real app, this would be an API call
    const newChildId = children.length + 1
    
    setChildren([
      ...children,
      {
        id: newChildId,
        name: newChild.name,
        age: parseInt(newChild.age),
        grade: newChild.grade,
        subjects: [],
        photo: "",
        username: newChild.username,
        hasAccount: true
      }
    ])
    
    // Reset form
    setNewChild({
      name: "",
      age: "",
      grade: "",
      username: "",
      password: ""
    })
    
    setIsAddingChild(false)
  }
  
  // Handler for deleting a child
  const handleDeleteChild = () => {
    if (selectedChildId) {
      setChildren(children.filter(child => child.id !== selectedChildId))
      setIsDeleting(false)
      setSelectedChildId(null)
    }
  }
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('')
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Your Children</h2>
          <p className="text-sm text-muted-foreground">Manage your children's accounts and profiles</p>
        </div>
        <Button 
          onClick={() => setIsAddingChild(true)}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>
      
      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={child.photo} alt={child.name} />
                    <AvatarFallback className="bg-amber-100 text-amber-700">{getInitials(child.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{child.name}</CardTitle>
                    <CardDescription>Age: {child.age} • {child.grade}</CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedChildId(child.id)
                      setIsDeleting(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Subjects</h3>
                  <div className="flex flex-wrap gap-2">
                    {child.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">{subject}</Badge>
                    ))}
                    {child.subjects.length === 0 && (
                      <p className="text-sm text-muted-foreground">No subjects added yet</p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Account</h3>
                  <div className="text-sm text-muted-foreground">
                    {child.hasAccount ? (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span>Account active • Username: {child.username}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                        <span>No account set up</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 py-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-2"
              >
                <School className="h-4 w-4" />
                View Learning Progress
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Add Child Form */}
      {isAddingChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Child</CardTitle>
              <CardDescription>Create a new account for your child</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">Full Name</Label>
                  <Input 
                    id="childName" 
                    value={newChild.name} 
                    onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                    placeholder="Enter child's full name" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Age</Label>
                    <Input 
                      id="childAge" 
                      type="number" 
                      value={newChild.age} 
                      onChange={(e) => setNewChild({...newChild, age: e.target.value})}
                      placeholder="Age" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childGrade">Grade</Label>
                    <Input 
                      id="childGrade" 
                      value={newChild.grade} 
                      onChange={(e) => setNewChild({...newChild, grade: e.target.value})}
                      placeholder="e.g. 5th Grade" 
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={newChild.username} 
                    onChange={(e) => setNewChild({...newChild, username: e.target.value})}
                    placeholder="Create a username for your child" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={newChild.password} 
                    onChange={(e) => setNewChild({...newChild, password: e.target.value})}
                    placeholder="Create a password" 
                  />
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsAddingChild(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddChild} className="bg-amber-600 hover:bg-amber-700">
                Add Child
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this child's account and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChild}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
