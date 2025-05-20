"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Send } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Form validation schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type FormValues = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      // Call the backend API
      const response = await axios.post("/api/auth/password/forgot", {
        email: data.email,
      })

      setSuccess(response.data.message || "If your email exists in our system, you will receive a password reset link.")
      form.reset()
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again later.")
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

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
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

          <Button
            type="submit"
            className="mt-6 w-full rounded-full bg-amber-500 py-6 text-white hover:bg-amber-600 shadow-md"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="h-5 w-5" />
                Send Reset Link
              </span>
            )}
          </Button>
        </form>
      </Form>
    </>
  )
}
