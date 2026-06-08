// src/components/layouts/dashboard-layout.tsx
"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import {
  Shield,
  Heart,
  AlertTriangle,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  School,
  Clock,
  MessageSquare,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: string[]
  badge?: number
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    roles: ["*"],
  },
  {
    title: "Safeguarding",
    href: "/safeguarding",
    icon: Shield,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "DSL", "DEPUTY_DSL", "TEACHER", "NURSE", "PRINCIPAL", "READ_ONLY_AUDITOR"],
  },
  {
    title: "Wellbeing",
    href: "/wellbeing",
    icon: Heart,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "DSL", "DEPUTY_DSL", "COUNSELOR", "NURSE", "STUDENT_SUPPORT", "PRINCIPAL"],
  },
  {
    title: "Behavior",
    href: "/behavior",
    icon: AlertTriangle,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "DSL", "TEACHER", "PRINCIPAL", "STUDENT_SUPPORT"],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "DSL", "TEACHER", "PRINCIPAL"],
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
    roles: ["*"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN", "DSL", "DEPUTY_DSL", "PRINCIPAL", "READ_ONLY_AUDITOR"],
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Settings,
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"],
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(3) // Example count

  const userRole = session?.user?.role || "TEACHER"
  const userName = session?.user?.name || "User"
  const userEmail = session?.user?.email || ""
  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase()

  const filteredNav = navigation.filter(item =>
    item.roles.includes("*") || item.roles.includes(userRole)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-lg">Safeguard</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-4 space-y-1">
            {filteredNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto">{item.badge}</Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-white">
          <div className="flex h-16 items-center gap-2 px-6 border-b">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <span className="font-bold text-lg">Safeguard</span>
              <span className="text-xs text-gray-500 block">Student Safety Platform</span>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto">{item.badge}</Badge>
                )}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500 mb-2">
              {session?.user?.role?.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  type="search"
                  placeholder="Search students, concerns..."
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start gap-1">
                      <span className="font-medium text-sm">Critical Concern Alert</span>
                      <span className="text-xs text-gray-500">Student: John Doe - Self Harm concern raised</span>
                      <span className="text-xs text-gray-400">5 minutes ago</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{userName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{userName}</span>
                      <span className="text-xs text-gray-500">{userEmail}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
