"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, User } from "lucide-react"

export function PhotoUpload({
  photoPreviewUrl,
  handleFileChange,
  removePhoto,
}: {
  photoPreviewUrl: string | null
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  removePhoto: () => void
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Profile Photo</h3>
        <p className="mt-2">Add a profile photo to make your profile more personal</p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-amber-100">
          {photoPreviewUrl ? (
            <img
              src={photoPreviewUrl || "/placeholder.svg"}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-amber-50">
              <User className="h-20 w-20 text-amber-300" />
            </div>
          )}
        </div>

        <Label
          htmlFor="photo-upload"
          className="cursor-pointer rounded-full bg-amber-500 px-6 py-3 text-base font-medium text-white hover:bg-amber-600"
        >
          <span className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Photo
          </span>
          <input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        </Label>

        {photoPreviewUrl && (
          <Button variant="outline" onClick={removePhoto} className="rounded-full">
            Remove Photo
          </Button>
        )}
      </div>

      <div className="text-center">
        <p>This step is optional. You can skip it if you prefer.</p>
      </div>
    </div>
  )
}
