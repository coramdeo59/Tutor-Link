"use client"

import { useState } from "react"
import { 
  User, 
  Bell, 
  Lock, 
  HelpCircle, 
  Mail, 
  Phone, 
  Upload,
  Save,
  Edit
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState("profile")
  
  // Mock user data
  const user = {
    firstName: "Amanda",
    lastName: "Smith",
    email: "amanda.smith@example.com",
    phone: "(555) 123-4567",
    photo: "",
    location: "Chicago, IL",
    preferredCommunication: "email", // email, phone, both
    bio: "Parent of two wonderful children who are eager to learn and excel in their studies."
  }
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('')
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photo} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xl">
                    {getInitials(`${user.firstName} ${user.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Profile Photo</h3>
                  <p className="text-sm text-muted-foreground">
                    Your profile photo will be visible to tutors and admins
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="mt-2">
                      <Upload className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <Button variant="outline" size="sm" className="mt-2 text-red-600 hover:text-red-700">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Basic Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user.firstName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user.lastName} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={user.email} type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue={user.phone} type="tel" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue={user.location} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    defaultValue={user.bio} 
                    placeholder="Tell tutors a little about yourself and your children's learning needs"
                    className="h-24"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-amber-600 hover:bg-amber-700">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Preferences</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="preferredCommunication">Preferred Communication Method</Label>
                  <Select defaultValue={user.preferredCommunication}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred communication" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="both">Both Email and Phone</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be used as the primary way tutors and administrators contact you
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select defaultValue="america_chicago">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america_chicago">America/Chicago (Central Time)</SelectItem>
                      <SelectItem value="america_new_york">America/New York (Eastern Time)</SelectItem>
                      <SelectItem value="america_los_angeles">America/Los Angeles (Pacific Time)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for scheduling sessions and displaying times
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-red-600">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  Delete Account
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-amber-600 hover:bg-amber-700">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Session Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Session Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming tutoring sessions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Session Changes</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when a tutor reschedules or cancels a session
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <h3 className="text-sm font-medium">Payment Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Payment Receipts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive receipts for payments made
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Invoice Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded when you have outstanding invoices
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <h3 className="text-sm font-medium">System Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Announcements</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive announcements about new features and updates
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing communications and special offers
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto bg-amber-600 hover:bg-amber-700">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Change Password</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Password must be at least 8 characters and include a number and special character
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                
                <Button className="mt-2">Update Password</Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Login Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  These are the devices that are currently logged into your account.
                </p>
                
                <div className="rounded-md border p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">Chicago, IL • May 19, 2025 11:42 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>
                  </div>
                </div>
                
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Log Out of All Other Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
