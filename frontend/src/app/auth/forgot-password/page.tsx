"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-100 -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-50 translate-x-1/4 translate-y-1/4 z-0"></div>

      <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-bold text-slate-800">
            <span className="text-amber-500">Forgot Password</span>
          </h2>
          <p className="mt-3 text-lg text-slate-600">Enter your email to reset your password</p>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl rounded-2xl">
          <CardHeader className="border-b bg-slate-50 px-8 py-6">
            <div className="flex items-center">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Password Recovery</CardTitle>
                <CardDescription className="text-slate-600">
                  We'll send you a link to reset your password
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 py-8 bg-white">
            <ForgotPasswordForm />
          </CardContent>
          <CardFooter className="border-t bg-slate-50 px-8 py-5 flex justify-center">
            <div className="text-center">
              <p className="text-slate-600">
                Remember your password?{" "}
                <Link href="/auth/login" className="font-medium text-amber-600 hover:text-amber-700">
                  Back to login
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
