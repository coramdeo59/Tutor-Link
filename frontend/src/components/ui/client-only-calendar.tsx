"use client";

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";

// This is a client-only wrapper for the Calendar component
// It prevents hydration errors by only rendering on the client
export function ClientOnlyCalendar(props: React.ComponentProps<typeof Calendar>) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      // Clean up any potential DOM references when unmounting
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) {
    // Return a skeleton loader during SSR and initial hydration
    // This prevents the "Node.removeChild" error
    return <Skeleton className="h-[304px] w-full rounded-md" />;
  }

  // Only render the actual calendar component on the client
  return <Calendar {...props} />;
}
