"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import authService from "@/services/auth.service"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Define Role enum to match backend
enum Role {
  ADMIN = "admin",
  PARENT = "parent",
  TUTOR = "tutor",
  CHILD = "child",
}

// Step indicators
const steps = [
  { id: "role", name: "Choose Role" },
  { id: "account", name: "Account Details" },
  { id: "profile", name: "Profile Info" },
  { id: "photo", name: "Profile Photo" },
  { id: "review", name: "Review" },
]

// Registration schemas with zod
// Base schema without discriminator
const baseSchemaFields = {
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Region is required"),
}

// Password validation refinement
const passwordRefinement = (data: any) => data.password === data.confirmPassword
const passwordRefinementError = {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}

// Communication method enum
const CommunicationMethod = z.enum(["email", "phone", "both", "text", "app"])
type CommunicationMethod = z.infer<typeof CommunicationMethod>

// We need to define raw schemas first (without refinements) for the discriminated union
const rawParentSchema = z.object({
  role: z.literal(Role.PARENT),
  ...baseSchemaFields,
  preferredSubjects: z.string().optional().default(""),
  preferred_communication: CommunicationMethod.default("email"),
})

const rawTutorSchema = z.object({
  role: z.literal(Role.TUTOR),
  ...baseSchemaFields,
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  hourlyRate: z.coerce.number().min(100, "Hourly rate must be at least 100 ETB"),
  street: z.string().min(1, "Street address is required"),
  zipCode: z.string().optional().default(""),
  country: z.string().min(1, "Country is required"),
  // New fields for tutor subjects and grade levels
  subjects: z.array(z.string()).default([]),
  gradeLevels: z.array(z.string()).default([]),
})

// Parent-specific schema with refinement
const parentSchema = rawParentSchema.refine(passwordRefinement, passwordRefinementError)

// Tutor-specific schema with refinement
const tutorSchema = rawTutorSchema.refine(passwordRefinement, passwordRefinementError)

// Combined schema using discriminated union with raw schemas
const formSchema = z.discriminatedUnion("role", [rawParentSchema, rawTutorSchema])
  .refine(passwordRefinement, passwordRefinementError)

// Get inferred type from the schema
type FormValues = z.infer<typeof formSchema>
type ParentFormValues = z.infer<typeof parentSchema>
type TutorFormValues = z.infer<typeof tutorSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [formType, setFormType] = useState<"tutor" | "parent">("tutor")

  // Initialize react-hook-form with the correct default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      formType === "tutor"
        ? ({
            role: Role.TUTOR,
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            bio: "",
            hourlyRate: 100,
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "Ethiopia",
            subjects: [],
            gradeLevels: [],
          } as TutorFormValues)
        : ({
            role: Role.PARENT,
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            city: "",
            state: "",
            preferredSubjects: "",
            preferred_communication: "email" as CommunicationMethod,
          } as ParentFormValues),
    mode: "onChange",
  })

  // Watch for role changes to update form type
  const selectedRole = form.watch("role")

  // Update form type when role changes
  const handleRoleChange = (role: Role) => {
    if (role === Role.TUTOR) {
      setFormType("tutor")
      form.reset({
        role: Role.TUTOR,
        email: form.getValues("email"),
        password: form.getValues("password"),
        confirmPassword: form.getValues("confirmPassword"),
        firstName: form.getValues("firstName"),
        lastName: form.getValues("lastName"),
        phoneNumber: form.getValues("phoneNumber"),
        bio: "",
        hourlyRate: 100,
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Ethiopia",
        subjects: [],
        gradeLevels: [],
      } as TutorFormValues)
    } else {
      setFormType("parent")
      form.reset({
        role: Role.PARENT,
        email: form.getValues("email"),
        password: form.getValues("password"),
        confirmPassword: form.getValues("confirmPassword"),
        firstName: form.getValues("firstName"),
        lastName: form.getValues("lastName"),
        phoneNumber: form.getValues("phoneNumber"),
        city: "",
        state: "",
        preferredSubjects: "",
        preferred_communication: "email",
      } as ParentFormValues)
    }
  }

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Navigate between steps
  const goToNextStep = () => {
    // For the first step (role selection), we can just proceed without validation
    if (currentStep === 0) {
      setCurrentStep(1)
      return
    }
    
    const fieldsToValidate = getFieldsForCurrentStep()

    form.trigger(fieldsToValidate as any).then((isValid) => {
      if (isValid) {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
      }
    })
  }

  const goToPrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // Get fields that should be validated for the current step
  const getFieldsForCurrentStep = () => {
    const step = currentStep
    const commonFields: string[] = []

    switch (step) {
      case 0: // Role selection
        return ["role"]
      case 1: // Account details
        return ["email", "password", "confirmPassword"]
      case 2: // Profile info
        commonFields.push("firstName", "lastName", "phoneNumber")

        if (selectedRole === Role.TUTOR) {
          return [...commonFields, "bio", "hourlyRate", "street", "city", "state", "zipCode", "country"]
        } else {
          return [...commonFields, "city", "state", "preferredSubjects", "preferred_communication"]
        }
      case 3: // Photo upload - no required fields
        return []
      case 4: // Review - all fields
        return []
      default:
        return []
    }
  }

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      let profilePhotoUrl: string | undefined

      // Upload profile photo if one was selected
      if (profilePhoto) {
        try {
          const formData = new FormData()
          formData.append("file", profilePhoto)
          console.log("Uploading profile photo...", { fileName: profilePhoto.name, fileSize: profilePhoto.size })

          // Upload profile photo first
          const photoResponse = await fetch("/api/upload-photo", {
            method: "POST",
            body: formData,
          })

          if (!photoResponse.ok) {
            const errorData = await photoResponse.json()
            console.error("Photo upload failed:", errorData)
            throw new Error(`Failed to upload profile photo: ${errorData.error || 'Unknown error'}`)
          }

          const photoData = await photoResponse.json()
          console.log("Photo upload successful:", photoData)
          profilePhotoUrl = photoData.url
        } catch (uploadError) {
          console.error("Profile photo upload error:", uploadError)
          throw new Error(`Photo upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
        }
      }

      // Register based on user type
      if (data.role === Role.TUTOR) {
        const tutorData = data as TutorFormValues
        const tutorSignUpData = {
          email: tutorData.email,
          password: tutorData.password,
          firstName: tutorData.firstName,
          lastName: tutorData.lastName,
          phoneNumber: tutorData.phoneNumber,
          role: Role.TUTOR,
          bio: tutorData.bio,
          hourlyRate: tutorData.hourlyRate,
          street: tutorData.street,
          city: tutorData.city,
          state: tutorData.state,
          zipCode: tutorData.zipCode,
          country: tutorData.country,
          subjects: tutorData.subjects,
          gradeLevels: tutorData.gradeLevels,
          ...(profilePhotoUrl && { profilePhotoUrl }),
        }

        await authService.registerTutor(tutorSignUpData)
      } else {
        const parentData = data as ParentFormValues
        const parentSignUpData = {
          email: parentData.email,
          password: parentData.password,
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          phoneNumber: parentData.phoneNumber,
          role: Role.PARENT,
          city: parentData.city,
          state: parentData.state,
          preferredSubjects: parentData.preferredSubjects || "",
          preferred_communication: parentData.preferred_communication,
          ...(profilePhotoUrl && { profilePhotoUrl }),
        }

        await authService.registerParent(parentSignUpData)
      }

      // Redirect to login page after successful registration
      router.push("/auth/login?registered=true")
    } catch (err) {
      console.error("Registration error:", err)
      setError(err instanceof Error ? err.message : "Failed to register. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderRoleSelection()
      case 1:
        return renderAccountDetails()
      case 2:
        return renderProfileInfo()
      case 3:
        return renderPhotoUpload()
      case 4:
        return renderReview()
      default:
        return null
    }
  }

  // Step 1: Role Selection
  const renderRoleSelection = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>I am registering as a</FormLabel>
            <FormDescription>Choose the role that best describes you</FormDescription>
            <FormControl>
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(value)
                  handleRoleChange(value as Role)
                }}
                defaultValue={field.value}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <div>
                  <RadioGroupItem value={Role.TUTOR} id="tutor" className="peer sr-only" />
                  <Label
                    htmlFor="tutor"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <User className="mb-3 h-6 w-6" />
                    <p className="text-lg font-medium">Tutor</p>
                    <p className="text-sm text-muted-foreground">I want to offer tutoring services</p>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value={Role.PARENT} id="parent" className="peer sr-only" />
                  <Label
                    htmlFor="parent"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Users className="mb-3 h-6 w-6" />
                    <p className="text-lg font-medium">Parent</p>
                    <p className="text-sm text-muted-foreground">I want to find tutors for my children</p>
                  </Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  // Step 2: Account Details
  const renderAccountDetails = () => (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="your.email@example.com" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input placeholder="••••••••" type="password" {...field} />
            </FormControl>
            <FormDescription>At least 8 characters</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input placeholder="••••••••" type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  // Step 3: Profile Info
  const renderProfileInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input placeholder="+1 (555) 123-4567" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedRole === Role.TUTOR ? renderTutorFields() : renderParentFields()}
    </div>
  )

  // Tutor-specific fields
  const renderTutorFields = () => (
    <>
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell us about your experience and qualifications..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hourlyRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hourly Rate (ETB)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-medium">Teaching Information</h3>
      <Separator />

      <FormField
        control={form.control}
        name="subjects"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subjects You Teach</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {[
                  "Mathematics",
                  "English",
                  "Science",
                  "History",
                  "Geography",
                  "Physics",
                  "Chemistry",
                  "Biology",
                ].map((subject) => (
                  <label
                    key={subject}
                    className="flex items-center space-x-2 cursor-pointer border rounded-md px-3 py-1.5 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      value={subject}
                      checked={field.value?.includes(subject)}
                      onChange={(e) => {
                        const updatedSubjects = e.target.checked
                          ? [...(field.value || []), subject]
                          : (field.value || []).filter((item) => item !== subject)
                        field.onChange(updatedSubjects)
                      }}
                      className="rounded"
                    />
                    <span>{subject}</span>
                  </label>
                ))}
              </div>
            </FormControl>
            <FormDescription>Select all subjects you're qualified to teach</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="gradeLevels"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Grade Levels You Teach</FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {[
                  "1st Grade",
                  "2nd Grade",
                  "3rd Grade",
                  "4th Grade",
                  "5th Grade",
                  "6th Grade",
                  "7th Grade",
                  "8th Grade",
                  "9th Grade",
                  "10th Grade",
                  "11th Grade",
                  "12th Grade",
                ].map((grade) => (
                  <label
                    key={grade}
                    className="flex items-center space-x-2 cursor-pointer border rounded-md px-3 py-1.5 hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      value={grade}
                      checked={field.value?.includes(grade)}
                      onChange={(e) => {
                        const updatedGrades = e.target.checked
                          ? [...(field.value || []), grade]
                          : (field.value || []).filter((item) => item !== grade)
                        field.onChange(updatedGrades)
                      }}
                      className="rounded"
                    />
                    <span>{grade}</span>
                  </label>
                ))}
              </div>
            </FormControl>
            <FormDescription>Select all grade levels you teach</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-medium">Location</h3>
      <Separator />

      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <FormControl>
                <Input placeholder="State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip/Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Ethiopia" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  )

  // Parent-specific fields
  const renderParentFields = () => (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Province</FormLabel>
              <FormControl>
                <Input placeholder="State" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="preferredSubjects"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Subjects</FormLabel>
            <FormControl>
              <Input placeholder="Mathematics, Science, English..." {...field} />
            </FormControl>
            <FormDescription>Comma-separated list of subjects your child needs help with</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="preferred_communication"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Communication Method</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a communication method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone Call</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
                <SelectItem value="app">In-App Messaging</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )

  // Step 4: Photo Upload
  const renderPhotoUpload = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium">Profile Photo</h3>
        <p className="text-sm text-muted-foreground">Add a profile photo to make your profile more personal</p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-40 w-40 overflow-hidden rounded-full border-2 border-primary/20">
          {photoPreviewUrl ? (
            <img
              src={photoPreviewUrl || "/placeholder.svg"}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <User className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <Label
          htmlFor="photo-upload"
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <span className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Photo
          </span>
          <input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
        </Label>

        {photoPreviewUrl && (
          <Button
            variant="outline"
            onClick={() => {
              setProfilePhoto(null)
              setPhotoPreviewUrl(null)
            }}
          >
            Remove Photo
          </Button>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>This step is optional. You can skip it if you prefer.</p>
      </div>
    </div>
  )

  // Step 5: Review
  const renderReview = () => {
    const data = form.getValues()
    console.log("Review data:", data) // Log the form values for debugging
    const isTutor = data.role === Role.TUTOR
    const isParent = data.role === Role.PARENT

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium">Review Your Information</h3>
          <p className="text-sm text-muted-foreground">Please review your information before submitting</p>
        </div>

        <div className="rounded-md border p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Role</h4>
              <p className="capitalize">{String(data.role)}</p>
            </div>

            <div>
              <h4 className="font-medium">Email</h4>
              <p>{String(data.email)}</p>
            </div>

            <div>
              <h4 className="font-medium">Full Name</h4>
              <p>
                {String(data.firstName)} {String(data.lastName)}
              </p>
            </div>

            <div>
              <h4 className="font-medium">Phone</h4>
              <p>{String(data.phoneNumber)}</p>
            </div>

            <div>
              <h4 className="font-medium">Location</h4>
              <p>
                {String(data.city)}, {String(data.state)}
              </p>
            </div>

            {isTutor && (
              <>
                <div>
                  <h4 className="font-medium">Hourly Rate</h4>
                  <p>{String((data as TutorFormValues).hourlyRate)} ETB</p>
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium">Bio</h4>
                  <p className="text-sm">{String((data as TutorFormValues).bio)}</p>
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium">Full Address</h4>
                  <p className="text-sm">
                    {String((data as TutorFormValues).street)}, {String(data.city)}, {String(data.state)}{" "}
                    {String((data as TutorFormValues).zipCode || "")}, {String((data as TutorFormValues).country)}
                  </p>
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium">Subjects</h4>
                  <p className="text-sm">
                    {(data as TutorFormValues).subjects && (data as TutorFormValues).subjects.length > 0
                      ? (data as TutorFormValues).subjects.join(", ")
                      : "No subjects selected"}
                  </p>
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium">Grade Levels</h4>
                  <p className="text-sm">
                    {(data as TutorFormValues).gradeLevels && (data as TutorFormValues).gradeLevels.length > 0
                      ? (data as TutorFormValues).gradeLevels.join(", ")
                      : "No grade levels selected"}
                  </p>
                </div>
              </>
            )}

            {isParent && (
              <>
                <div>
                  <h4 className="font-medium">Preferred Communication</h4>
                  <p className="capitalize">{String((data as ParentFormValues).preferred_communication || "email")}</p>
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium">Preferred Subjects</h4>
                  <p className="text-sm">
                    {(data as ParentFormValues).preferredSubjects
                      ? String((data as ParentFormValues).preferredSubjects)
                      : "None specified"}
                  </p>
                </div>
              </>
            )}

            <div className="col-span-2">
              <h4 className="font-medium">Profile Photo</h4>
              {photoPreviewUrl ? (
                <div className="mt-2 h-20 w-20 overflow-hidden rounded-full">
                  <img
                    src={photoPreviewUrl || "/placeholder.svg"}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No photo uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your information to register</p>
        </div>

        <div className="mt-8">
          {/* Step progress indicator */}
          <nav aria-label="Progress" className="mb-8">
            <ol role="list" className="flex items-center">
              {steps.map((step, index) => (
                <li key={step.id} className={cn(index !== steps.length - 1 ? "flex-1" : "", "relative")}>
                  {index < currentStep ? (
                    <div className="group flex w-full flex-col items-center">
                      <span className="flex h-9 items-center">
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                          <CheckCircle2 className="h-5 w-5" />
                        </span>
                      </span>
                      <span className="text-xs font-medium text-primary">{step.name}</span>
                    </div>
                  ) : index === currentStep ? (
                    <div className="flex w-full flex-col items-center">
                      <span className="flex h-9 items-center">
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-white text-primary">
                          {index + 1}
                        </span>
                      </span>
                      <span className="text-xs font-medium text-primary">{step.name}</span>
                    </div>
                  ) : (
                    <div className="group flex w-full flex-col items-center">
                      <span className="flex h-9 items-center">
                        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-500">
                          {index + 1}
                        </span>
                      </span>
                      <span className="text-xs font-medium text-gray-500">{step.name}</span>
                    </div>
                  )}
                  {index !== steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute left-0 top-4 -ml-px h-0.5 w-full",
                        index < currentStep ? "bg-primary" : "bg-gray-300",
                      )}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>{steps[currentStep].name}</CardTitle>
              <CardDescription>
                {currentStep === 0 && "Select your user type to get started"}
                {currentStep === 1 && "Create your account credentials"}
                {currentStep === 2 && "Tell us more about yourself"}
                {currentStep === 3 && "Upload a profile photo (optional)"}
                {currentStep === 4 && "Review and confirm your information"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {renderStepContent()}
                </form>
              </Form>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-4">
              <div className="flex w-full items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goToPrevStep}
                  disabled={currentStep === 0}
                  className={currentStep === 0 ? "invisible" : ""}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={goToNextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={form.handleSubmit(onSubmit)} disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Creating Account...
                      </span>
                    ) : (
                      <span>Create Account</span>
                    )}
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
