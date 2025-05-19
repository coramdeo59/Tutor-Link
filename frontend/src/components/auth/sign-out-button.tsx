"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"

interface SignOutButtonProps {
  variant?: "default" | "ghost" | "link"
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export function SignOutButton({
  variant = "ghost",
  showIcon = true,
  showText = true,
  className = ""
}: SignOutButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem("accessToken")
      
      if (!accessToken) {
        // If no token exists, just redirect to login
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("userRole")
        router.push("/auth/login")
        return
      }

      // Call the sign-out API
      await axios.post("/api/auth/sign-out", {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      // Clear local storage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userRole")
      
      // Redirect to login page
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
      
      // Even if there's an error, clear tokens and redirect
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userRole")
      router.push("/auth/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={isLoading}
      className={`flex items-center ${className}`}
    >
      {isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : showIcon ? (
        <LogOut className="h-4 w-4" />
      ) : null}
      {showText && <span className={showIcon ? "ml-2" : ""}>{isLoading ? "Signing out..." : "Sign out"}</span>}
    </Button>
  )
}
