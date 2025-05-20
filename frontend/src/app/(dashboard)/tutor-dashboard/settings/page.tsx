"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Lock, CreditCard, User, Mail, Bell, Save } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

interface TutorProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  yearsOfExperience: number;
  hourlyRate: number;
  qualifications: string;
  avatarUrl?: string;
}

interface PaymentSettings {
  paymentMethod: string;
  accountNumber: string;
  accountHolderName: string;
  bankName?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  newSessionAlert: boolean;
  assignmentSubmissions: boolean;
  feedbackReceived: boolean;
  paymentReceipts: boolean;
}

export default function TutorSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<TutorProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    yearsOfExperience: 0,
    hourlyRate: 0,
    qualifications: ''
  });
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    paymentMethod: 'bank_transfer',
    accountNumber: '',
    accountHolderName: '',
    bankName: ''
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    newSessionAlert: true,
    assignmentSubmissions: true,
    feedbackReceived: true,
    paymentReceipts: true
  });
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch tutor profile and settings when component mounts
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setLoading(true);
        
        // Get tutor profile
        const profileResponse = await axios.get(
          `${API_URL}/users/tutors/profile/me`,
          { headers: getAuthHeaders() }
        );
        
        if (profileResponse.data) {
          setProfile({
            firstName: profileResponse.data.firstName || '',
            lastName: profileResponse.data.lastName || '',
            email: profileResponse.data.email || '',
            phone: profileResponse.data.phone || '',
            bio: profileResponse.data.bio || '',
            yearsOfExperience: profileResponse.data.yearsOfExperience || 0,
            hourlyRate: profileResponse.data.hourlyRate || 0,
            qualifications: profileResponse.data.qualifications || ''
          });
        }
        
        // Get payment settings (in a real app, you'd have separate endpoints for these)
        const paymentResponse = await axios.get(
          `${API_URL}/users/tutors/payment-settings`,
          { headers: getAuthHeaders() }
        ).catch(() => ({ data: null })); // Gracefully handle if this endpoint doesn't exist
        
        if (paymentResponse.data) {
          setPaymentSettings(paymentResponse.data);
        }
        
        // Get notification settings
        const notificationResponse = await axios.get(
          `${API_URL}/users/tutors/notification-settings`,
          { headers: getAuthHeaders() }
        ).catch(() => ({ data: null })); // Gracefully handle if this endpoint doesn't exist
        
        if (notificationResponse.data) {
          setNotificationSettings(notificationResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tutor data:', err);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [API_URL]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.put(
        `${API_URL}/users/tutors/profile/me`,
        profile,
        { headers: getAuthHeaders() }
      );
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    }
  };

  // Handle payment settings update
  const handlePaymentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.put(
        `${API_URL}/users/tutors/payment-settings`,
        paymentSettings,
        { headers: getAuthHeaders() }
      );
      
      toast.success('Payment settings updated successfully');
    } catch (err) {
      console.error('Error updating payment settings:', err);
      toast.error('Failed to update payment settings');
    }
  };

  // Handle notification settings update
  const handleNotificationUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await axios.put(
        `${API_URL}/users/tutors/notification-settings`,
        notificationSettings,
        { headers: getAuthHeaders() }
      );
      
      toast.success('Notification settings updated successfully');
    } catch (err) {
      console.error('Error updating notification settings:', err);
      toast.error('Failed to update notification settings');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/tutor-dashboard" className="flex items-center text-amber-600 hover:text-amber-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <Tabs defaultValue="profile" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile details. This information will be visible to parents and students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell parents and students about yourself, your teaching style, and experience."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        min="0"
                        value={profile.yearsOfExperience}
                        onChange={(e) => setProfile({...profile, yearsOfExperience: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={profile.hourlyRate}
                        onChange={(e) => setProfile({...profile, hourlyRate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Textarea
                      id="qualifications"
                      value={profile.qualifications}
                      onChange={(e) => setProfile({...profile, qualifications: e.target.value})}
                      placeholder="List your degrees, certifications, and other qualifications."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Manage your payment details for receiving tutoring payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form onSubmit={handlePaymentUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <select
                      id="paymentMethod"
                      value={paymentSettings.paymentMethod}
                      onChange={(e) => setPaymentSettings({...paymentSettings, paymentMethod: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                    </select>
                  </div>
                  
                  {paymentSettings.paymentMethod === 'bank_transfer' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                        <Input
                          id="accountHolderName"
                          value={paymentSettings.accountHolderName}
                          onChange={(e) => setPaymentSettings({...paymentSettings, accountHolderName: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={paymentSettings.accountNumber}
                          onChange={(e) => setPaymentSettings({...paymentSettings, accountNumber: e.target.value})}
                          required
                          type="password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={paymentSettings.bankName || ''}
                          onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                  
                  {/* Add PayPal and Stripe specific fields here */}
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Payment Settings
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <form onSubmit={handleNotificationUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, emailNotifications: checked})
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label htmlFor="smsNotifications" className="font-medium">SMS Notifications</Label>
                        <p className="text-sm text-gray-500">Receive text messages for important updates</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, smsNotifications: checked})
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label htmlFor="newSessionAlert" className="font-medium">New Session Alerts</Label>
                        <p className="text-sm text-gray-500">Get notified when a new session is scheduled</p>
                      </div>
                      <Switch
                        id="newSessionAlert"
                        checked={notificationSettings.newSessionAlert}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, newSessionAlert: checked})
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label htmlFor="assignmentSubmissions" className="font-medium">Assignment Submissions</Label>
                        <p className="text-sm text-gray-500">Get notified when a student submits an assignment</p>
                      </div>
                      <Switch
                        id="assignmentSubmissions"
                        checked={notificationSettings.assignmentSubmissions}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, assignmentSubmissions: checked})
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label htmlFor="feedbackReceived" className="font-medium">Feedback Received</Label>
                        <p className="text-sm text-gray-500">Get notified when you receive new feedback</p>
                      </div>
                      <Switch
                        id="feedbackReceived"
                        checked={notificationSettings.feedbackReceived}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, feedbackReceived: checked})
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label htmlFor="paymentReceipts" className="font-medium">Payment Receipts</Label>
                        <p className="text-sm text-gray-500">Get notified when you receive a payment</p>
                      </div>
                      <Switch
                        id="paymentReceipts"
                        checked={notificationSettings.paymentReceipts}
                        onCheckedChange={(checked) => 
                          setNotificationSettings({...notificationSettings, paymentReceipts: checked})
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Notification Settings
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Change Password</h3>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" required />
                    </div>
                    
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      <Lock className="h-4 w-4 mr-2" />
                      Update Password
                    </Button>
                  </form>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-red-600 mb-3">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
