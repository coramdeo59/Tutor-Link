"use client"

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ethiopianRegions, ethiopianCities, getCitiesByRegion } from "@/lib/ethiopia-data"
import { UseFormReturn } from "react-hook-form"

interface RegionCitySelectorProps {
  form: UseFormReturn<any, any, any>
  regionName: string
  cityName: string
  regionLabel: string
  cityLabel: string
}

export function RegionCitySelector({ form, regionName, cityName, regionLabel, cityLabel }: RegionCitySelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={regionName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{regionLabel}</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // When region changes, reset city field
                const cityField = form.getValues(cityName);
                if (cityField) {
                  // Reset city when region changes
                  form.setValue(cityName, "");
                }
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select a region" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {ethiopianRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={cityName}
        render={({ field }) => {
          const selectedRegion = form.watch(regionName);
          const cities = selectedRegion ? getCitiesByRegion(selectedRegion) : [];
          
          return (
            <FormItem>
              <FormLabel>{cityLabel}</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedRegion}
              >
                <FormControl>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedRegion && (
                <FormDescription>
                  Please select a region first
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  )
}
