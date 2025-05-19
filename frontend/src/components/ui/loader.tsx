"use client"

import React from "react"
import { Loader2 } from "lucide-react"

interface LoaderProps {
  message?: string
}

export function Loader({ message = "Loading..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  )
}
