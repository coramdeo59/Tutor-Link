import { z } from "zod"
import { Role } from "./types"

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

// Parent-specific schema
export const parentSchema = z
  .object({
    role: z.literal(Role.PARENT),
    ...baseSchemaFields,
    preferredSubjects: z.string().optional(),
    preferred_communication: z.enum(["email", "phone", "text", "app"]).default("email"),
  })
  .refine(passwordRefinement, passwordRefinementError)

// Tutor-specific schema
export const tutorSchema = z
  .object({
    role: z.literal(Role.TUTOR),
    ...baseSchemaFields,
    bio: z.string().min(20, "Bio must be at least 20 characters"),
    hourlyRate: z.coerce.number().min(100, "Hourly rate must be at least 100 ETB"),
    street: z.string().min(1, "Street address is required"),
    zipCode: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    
    // Verification fields
    fanNumber: z.string().optional(),
    idDocumentUrl: z.string().optional(),
    cvUrl: z.string().optional(),
    educationLevel: z.string().optional(),
    institutionName: z.string().optional(),
    degree: z.string().optional(),
    graduationYear: z.string().optional(),
    yearsOfExperience: z.coerce.number().optional(),
    hasTeachingCertificate: z.boolean().optional(),
    certificateUrl: z.string().optional(),
    
    // Subject fields
    subjects: z.array(z.string()).optional(),
    
    // Availability fields
    availabilitySlots: z.array(
      z.object({
        dayOfWeek: z.string(),
        startTime: z.string(),
        endTime: z.string()
      })
    ).optional(),
  })
  .refine(passwordRefinement, passwordRefinementError)

// Raw schemas for discriminated union
const rawParentSchema = z.object({
  role: z.literal(Role.PARENT),
  ...baseSchemaFields,
  preferredSubjects: z.string().optional(),
  preferred_communication: z.enum(["email", "phone", "text", "app"]).default("email"),
})

const rawTutorSchema = z.object({
  role: z.literal(Role.TUTOR),
  ...baseSchemaFields,
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  hourlyRate: z.coerce.number().min(100, "Hourly rate must be at least 100 ETB"),
  street: z.string().min(1, "Street address is required"),
  zipCode: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  
  // Verification fields
  fanNumber: z.string().optional(),
  idDocumentUrl: z.string().optional(),
  cvUrl: z.string().optional(),
  educationLevel: z.string().optional(),
  institutionName: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.string().optional(),
  yearsOfExperience: z.coerce.number().optional(),
  hasTeachingCertificate: z.boolean().optional(),
  certificateUrl: z.string().optional(),
  
  // Subject fields
  subjects: z.array(z.string()).optional(),
  
  // Availability fields
  availabilitySlots: z.array(
    z.object({
      dayOfWeek: z.string(),
      startTime: z.string(),
      endTime: z.string()
    })
  ).optional(),
})

// Combined schema using discriminated union
export const formSchema = z
  .discriminatedUnion("role", [rawParentSchema, rawTutorSchema])
  .refine(passwordRefinement, passwordRefinementError)

export type FormValues = z.infer<typeof formSchema>
