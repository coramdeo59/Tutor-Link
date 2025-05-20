"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/dashboard/auth/login-form"


export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-amber-100 -translate-x-1/2 -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-amber-50 translate-x-1/4 translate-y-1/4 z-0"></div>

      <div className="w-full max-w-md mx-auto space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-bold text-slate-800">
            Welcome to <span className="text-amber-500">Tutor-Link</span>
          </h2>
          <p className="mt-3 text-lg text-slate-600">Sign in to your account to continue</p>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl rounded-2xl">
          <CardHeader className="border-b bg-slate-50 px-8 py-6">
            <div className="flex items-center">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">Sign In</CardTitle>
                <CardDescription className="text-slate-600">
                  Enter your credentials to access your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-8 py-8 bg-white">
            <LoginForm />
          </CardContent>
          <CardFooter className="border-t bg-slate-50 px-8 py-5 flex flex-col items-center space-y-3">
            <div className="text-center">
              <p className="text-slate-600">
                Don't have an account?{" "}
                <Link href="/auth/register" className="font-medium text-amber-600 hover:text-amber-700">
                  Create one now
                </Link>
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 text-sm">
                Are you a student?{" "}
                <Link href="/child-login" className="font-medium text-amber-600 hover:text-amber-700">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
