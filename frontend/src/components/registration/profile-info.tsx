"use client"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "@/lib/types"
import { RegionCitySelector } from "./region-city-selector"
import { schoolSubjects } from "@/lib/subjects-data"



export function ProfileInfo({ form, selectedRole }: { form: any; selectedRole: Role }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" className="rounded-lg" {...field} />
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
                <Input placeholder="Doe" className="rounded-lg" {...field} />
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
              <Input placeholder="+1 (555) 123-4567" className="rounded-lg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedRole === Role.TUTOR ? <TutorFields form={form} /> : <ParentFields form={form} />}
    </div>
  )
}

function TutorFields({ form }: { form: any }) {
  return (
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
                className="min-h-[120px] rounded-lg"
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
                className="rounded-lg"
                {...field}
                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <h3 className="text-lg font-semibold pt-2">Location</h3>
      <Separator />

      <FormField
        control={form.control}
        name="street"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input placeholder="123 Main St" className="rounded-lg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <RegionCitySelector form={form} regionName="state" cityName="city" regionLabel="Region/State" cityLabel="City" />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip/Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="12345" className="rounded-lg" {...field} />
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
                <Input placeholder="Ethiopia" className="rounded-lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Verification Fields */}
      <h3 className="text-lg font-semibold pt-4">Verification Information</h3>
      <FormDescription className="text-sm text-muted-foreground">
        Please provide the following information for verification purposes. This helps us ensure the quality of our tutors.
      </FormDescription>
      <Separator className="my-2" />
      
      <FormField
        control={form.control}
        name="fanNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>National ID/FAN Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter your national ID or FAN number" className="rounded-lg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="educationLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Education Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select your education level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                  <SelectItem value="masters">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graduation Year</FormLabel>
              <FormControl>
                <Input placeholder="YYYY" className="rounded-lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="institutionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Institution Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your institution name" className="rounded-lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Degree/Field of Study</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Computer Science" className="rounded-lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="yearsOfExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Years of Teaching Experience</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={0} 
                className="rounded-lg" 
                {...field} 
                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="hasTeachingCertificate"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <input
                type="checkbox"
                checked={field.value}
                onChange={field.onChange}
                className="h-4 w-4 mt-1"
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I have a teaching certificate</FormLabel>
              <FormDescription>
                Check this if you have a formal teaching certificate or qualification
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </>
  )
}

function ParentFields({ form }: { form: any }) {
  return (
    <>
      <RegionCitySelector form={form} regionName="state" cityName="city" regionLabel="Region/State" cityLabel="City" />

      <FormField
        control={form.control}
        name="preferredSubjects"
        render={({ field }) => {
          // Split comma-separated string to array for display
          const selectedValues = field.value ? field.value.split(",").map(v => v.trim()).filter(Boolean) : [];
          
          return (
            <FormItem className="space-y-2">
              <FormLabel>Preferred Subjects</FormLabel>
              <div className="relative">
                <Select
                  onValueChange={(value) => {
                    // Toggle selection
                    if (selectedValues.includes(value)) {
                      const newValues = selectedValues.filter(v => v !== value);
                      field.onChange(newValues.join(", "));
                    } else {
                      const newValues = [...selectedValues, value];
                      field.onChange(newValues.join(", "));
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-lg w-full">
                      <SelectValue 
                        placeholder="Select subjects" 
                        className="text-muted-foreground"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {schoolSubjects.map((subject) => (
                      <SelectItem 
                        key={subject} 
                        value={subject}
                        className="flex items-center gap-2"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedValues.includes(subject) ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}>
                            {selectedValues.includes(subject) && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span>{subject}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Display selected subjects as badges */}
              {selectedValues.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedValues.map((subject : string) => (
                    <div 
                      key={subject}
                      className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
                    >
                      {subject}
                      <button
                        type="button"
                        className="text-amber-600 hover:text-amber-800"
                        onClick={() => {
                          const newValues = selectedValues.filter((v : string) => v !== subject);
                          field.onChange(newValues.join(", "));
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <FormDescription>
                Select one or more subjects your child needs help with
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={form.control}
        name="preferred_communication"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Communication Method</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select a communication method" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="email">online</SelectItem>
                <SelectItem value="phone">In person</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}


