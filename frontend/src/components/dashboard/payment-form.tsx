'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PaymentService, { type CreatePaymentRequest } from '@/services/payment.service';

interface PaymentFormProps {
  invoiceId?: number;
  amount: number;
  description: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ 
  invoiceId, 
  amount, 
  description, 
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('chapa');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [txRef, setTxRef] = useState('');

  const checkAuth = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to make a payment',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    if (!checkAuth()) {
      return;
    }
    
    setIsLoading(true);
    setPaymentStatus('processing');

    try {
      const paymentData: CreatePaymentRequest = {
        amount,
        description,
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || undefined,
        invoiceId,
        // In a real app, you'd get this from your auth context
        userId: 1,
      };

      console.log('Submitting payment data:', paymentData);
      
      const response = await PaymentService.createPayment(paymentData);
      console.log('Payment response:', response);
      
      if (response.redirectUrl) {
        // Show a message before redirecting
        toast({
          title: 'Redirecting to payment gateway',
          description: 'Please complete your payment on the next page',
          variant: 'default',
        });
        
        // Add a small delay to ensure the toast is visible
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Redirect to Chapa payment page
        window.location.href = response.redirectUrl;
      } else {
        setPaymentStatus('success');
        setTxRef(response.txRef);
        
        // Show success message
        toast({
          title: 'Payment initiated',
          description: 'Your payment is being processed...',
          variant: 'default',
        });

        // Call success callback if provided
        if (onSuccess) onSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      
      // Extract detailed error message
      let errorMessage = 'Failed to process payment. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
        
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid payment details. Please check your information and try again.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection and try again.';
      } else if (error.message) {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      toast({
        title: 'Payment failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-center">Payment Successful!</CardTitle>
          <CardDescription className="text-center">
            Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Transaction Reference: <span className="font-mono">{txRef}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            We've sent a confirmation email to {email}.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-center">Payment Failed</CardTitle>
          <CardDescription className="text-center">
            We couldn't process your payment. Please try again.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => setPaymentStatus('idle')}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your payment securely
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <span className="text-muted-foreground">ETB</span>
                <span className="ml-2 font-medium">{amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="ETB" disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="USD" disabled>USD (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+251 9XX XXX XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="space-y-4 pt-2">
            <Label>Payment Method</Label>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-3 border rounded-md p-4 hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="chapa" id="chapa" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="chapa" className="cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span>Chapa Payment</span>
                      <img 
                        src="/chapa-logo.png" 
                        alt="Chapa" 
                        className="h-6 ml-2" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      Pay with Chapa (Visa, Mastercard, Telebirr, etc.)
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay ETB {amount.toFixed(2)}
              </>
            )}
          </Button>
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <p className="text-xs text-center text-muted-foreground">
            Your payment is secured with end-to-end encryption.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
