"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Shield,
  LayoutDashboard,
  Heart,
  AlertTriangle,
  Clock,
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
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const mainNavigation = [
  { title: "Admin", href: "/admin", icon: Settings, roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"] },
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
    roles: ["SUPER_ADMIN", "SCHOOL_ADMIN"],   // only these roles see the admin link
  },
];
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["*"] },
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
  { title: "Students", href: "/students", icon: Users, roles: ["*"] },
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
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = (session?.user as any)?.role || "TEACHER";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const filteredNav = mainNavigation.filter(
    (item) => item.roles.includes("*") || item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ========== TOP NAVBAR ========== */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + Desktop links */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-school-500 to-school-700 flex items-center justify-center shadow-sm">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-school-900 hidden sm:block">Safeguard</span>
              </Link>

              {/* Desktop horizontal nav */}
              <nav className="hidden lg:flex items-center gap-1">
                {filteredNav.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                        isActive
                          ? "bg-school-50 text-school-700"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right side: search, notifications, user */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2 ring-1 ring-border/50 focus-within:ring-school-500 focus-within:ring-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm w-40 lg:w-64 placeholder:text-muted-foreground"
                />
              </div>

              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar className="h-9 w-9 ring-2 ring-blue-100">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userRole?.replace(/_/g, " ")}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 z-50">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile navigation dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white p-4 space-y-2">
            {filteredNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-school-50 text-school-700"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="max-w-screen-2xl mx-auto p-6 lg:p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
