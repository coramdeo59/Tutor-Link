"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Calendar, 
  CreditCard, 
  Settings,
  MenuIcon,
  LogOut
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard/parent-dashboard",
      active: pathname === "/dashboard/parent-dashboard",
    },
    {
      label: "Children Management",
      icon: Users,
      href: "/dashboard/children-management",
      active: pathname === "/dashboard/children-management",
    },
    {
      label: "Tutor Search",
      icon: Search,
      href: "/dashboard/tutor-search",
      active: pathname === "/dashboard/tutor-search",
    },
    {
      label: "Session Management",
      icon: Calendar,
      href: "/dashboard/session-management",
      active: pathname === "/dashboard/session-management",
    },
    {
      label: "Payment Center",
      icon: CreditCard,
      href: "/dashboard/payment-center",
      active: pathname === "/dashboard/payment-center",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden block">
          <Button variant="ghost" size="icon" className="mr-2">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <MobileNav routes={routes} />
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex h-full w-64 flex-col border-r bg-slate-50">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-amber-500" />
            <span className="text-xl font-semibold">TutorLink</span>
          </Link>
        </div>
        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 pt-3">
            <nav className="grid gap-1 px-2">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                    route.active 
                      ? "bg-amber-50 text-amber-700" 
                      : "text-slate-600 hover:bg-gray-100"
                  }`}
                >
                  <route.icon className={`h-5 w-5 ${route.active ? "text-amber-700" : "text-slate-400"}`} />
                  <span>{route.label}</span>
                </Link>
              ))}
            </nav>
          </ScrollArea>
          
          {/* Logout Button */}
          <div className="p-4 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                // Clear all auth tokens and redirect to login
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('userRole');
                  window.location.href = '/auth/login';
                }
              }}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile Navigation
function MobileNav({ routes }: { routes: any[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-500" />
          <span className="text-xl font-semibold">TutorLink</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <nav className="grid gap-1 p-2 flex-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                route.active 
                  ? "bg-amber-50 text-amber-700" 
                  : "text-slate-600 hover:bg-gray-100"
              }`}
            >
              <route.icon className={`h-5 w-5 ${route.active ? "text-amber-700" : "text-slate-400"}`} />
              <span>{route.label}</span>
            </Link>
          ))}
        </nav>
        {/* Mobile Logout Button */}
        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => {
              // Clear all auth tokens and redirect to login
              if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('authToken');
                localStorage.removeItem('userRole');
                window.location.href = '/auth/login';
              }
            }}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}
