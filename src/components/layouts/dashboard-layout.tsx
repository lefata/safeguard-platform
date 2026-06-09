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

const navigation = [
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = (session?.user as any)?.role || "TEACHER";
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const filteredNav = navigation.filter(
    (item) => item.roles.includes("*") || item.roles.includes(userRole)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl border-r animate-in slide-in-from-left duration-300">
          <SidebarContent
            filteredNav={filteredNav}
            pathname={pathname}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow border-r bg-white shadow-sm">
          <SidebarContent filteredNav={filteredNav} pathname={pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b shadow-sm">
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
              <div className="hidden sm:flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2 ring-1 ring-border/50 hover:ring-school-300 transition-all focus-within:ring-school-500 focus-within:ring-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search students, concerns..."
                  className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar className="h-9 w-9 ring-2 ring-school-100">
                      <AvatarFallback className="bg-school-100 text-school-700 font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs text-muted-foreground">{userRole?.replace(/_/g, " ")}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
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
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  filteredNav,
  pathname,
  onClose,
}: {
  filteredNav: typeof navigation;
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center gap-3 px-6 border-b">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-school-500 to-school-700 flex items-center justify-center shadow-sm">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-school-900">Safeguard</span>
          <span className="text-xs text-muted-foreground block -mt-0.5">Student Safety</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" className="ml-auto" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-school-50 text-school-700 shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  isActive
                    ? "text-school-600"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          {new Date().getFullYear()} © Safeguard
        </div>
      </div>
    </>
  );
}
