"use client"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Users } from "lucide-react"
import { Role } from "@/lib/types"

export function RoleSelection({ form }: { form: any }) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-xl font-semibold">I am registering as a</FormLabel>
            <FormDescription className="text-base">Choose the role that best describes you</FormDescription>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid grid-cols-2 gap-6 pt-2"
              >
                <div>
                  <RadioGroupItem value={Role.TUTOR} id="tutor" className="peer sr-only" />
                  <Label
                    htmlFor="tutor"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-amber-400 hover:bg-amber-50 peer-data-[state=checked]:border-amber-500 [&:has([data-state=checked])]:border-amber-500 [&:has([data-state=checked])]:bg-amber-50"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                      <User className="h-8 w-8 text-amber-600" />
                    </div>
                    <p className="text-xl font-semibold">Tutor</p>
                    <p className="mt-2 text-center">I want to offer tutoring services</p>
                  </Label>
                </div>

                <div>
                  <RadioGroupItem value={Role.PARENT} id="parent" className="peer sr-only" />
                  <Label
                    htmlFor="parent"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-amber-400 hover:bg-amber-50 peer-data-[state=checked]:border-amber-500 [&:has([data-state=checked])]:border-amber-500 [&:has([data-state=checked])]:bg-amber-50"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                      <Users className="h-8 w-8 text-amber-600" />
                    </div>
                    <p className="text-xl font-semibold">Parent</p>
                    <p className="mt-2 text-center">I want to find tutors for my children</p>
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
}
