"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, LogIn } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered") === "true"

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  // Function to decode JWT token and extract role
  const decodeToken = (token: string) => {
    try {
      // Split the token and get the payload part (second part)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Decode the base64 string
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      // Make direct API call to the backend server
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/auth/sign-in`,
        {
          email: data.email,
          password: data.password,
        },
        {
          withCredentials: true, // Important for cookies
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Save tokens in localStorage
      if (response.data.accessToken) {
        // Store the access token
        localStorage.setItem('accessToken', response.data.accessToken);
        
        // Store the refresh token if available
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Decode the token to get the user role
        const decodedToken = decodeToken(response.data.accessToken);
        if (decodedToken) {
          // Store user role
          if (decodedToken.role) {
            localStorage.setItem('userRole', decodedToken.role);
          }
          
          // Store user ID
          if (decodedToken.sub) {
            localStorage.setItem('userId', decodedToken.sub);
          }
          
          // Redirect users based on their role
          const userRole = decodedToken.role?.toLowerCase() || '';
          
          if (userRole === 'tutor') {
            router.push('/dashboard/tutor-dashboard');
          } else if (userRole === 'parent') {
            router.push('/dashboard/parent-dashboard');
          } else if (userRole === 'admin') {
            router.push('/admin-dashboard');
          } else if (userRole === 'child') {
            router.push('/child-dashboard');
          } else {
            router.push('/dashboard');
          }
        } else {
          // Fallback to standard dashboard if token can't be decoded
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {registered && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800 flex items-center justify-center py-2">
            <span className="font-medium">Your account has been successfully created! Please sign in.</span>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-800">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your.email@example.com"
                    type="email"
                    autoComplete="email"
                    className="rounded-lg border-slate-200 py-3 focus-visible:ring-amber-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-800">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="rounded-lg border-slate-200 py-3 focus-visible:ring-amber-500"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-slate-500 hover:text-slate-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-slate-300 text-amber-500 focus-visible:ring-amber-500"
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-slate-600">Remember me</FormLabel>
                </FormItem>
              )}
            />

            <Link href="/auth/forgot-password" className="text-sm font-medium text-amber-600 hover:text-amber-700">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="mt-6 w-full rounded-full bg-amber-500 py-6 text-white hover:bg-amber-600 shadow-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="h-5 w-5" />
                Sign In
              </span>
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}
