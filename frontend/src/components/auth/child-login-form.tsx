"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

// Form validation schema for child login
const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ChildLoginForm() {
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
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
    setError(null)
    setIsLoading(true)

    try {
      // Direct connection to backend - fixed URL to ensure it's working
      const response = await fetch('http://localhost:3001/users/child/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign in');
      }
      
      const responseData = await response.json();

      // Save tokens in localStorage
      if (responseData.accessToken) {
        localStorage.setItem("accessToken", responseData.accessToken)
        
        // Decode the token to get the user role
        const decodedToken = decodeToken(responseData.accessToken);
        if (decodedToken && decodedToken.role) {
          localStorage.setItem("userRole", decodedToken.role);
          
          // For child users, always redirect to child dashboard
          router.push("/child-dashboard");
        } else {
          // Fallback to standard dashboard if role can't be determined
          router.push("/dashboard");
        }
      }

      if (responseData.refreshToken) {
        localStorage.setItem("refreshToken", responseData.refreshToken)
      }
    } catch (err: any) {
      // Handle errors from fetch
      setError(err.message || "Login failed. Please check your username and password and try again.")
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-800">Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your-username"
                    type="text"
                    autoComplete="username"
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
                      className="rounded-lg border-slate-200 py-3 pr-10 focus-visible:ring-amber-500"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-slate-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
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
                      className="rounded-sm border-slate-300 focus:ring-amber-500 text-amber-500"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-slate-500">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-500 text-white hover:bg-amber-600 py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </span>
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}
