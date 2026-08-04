// src/components/layouts/dashboard-layout.tsx
"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Shield } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Students", href: "/dashboard/students", icon: "🎓" },
  { label: "Safeguarding", href: "/dashboard/safeguarding", icon: "🛡️" },
  { label: "Reports", href: "/dashboard/reports", icon: "📋" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Modern Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-school-900 to-school-800 border-r border-school-700 flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-school-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-school-gold to-school-gold-light flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-school-900" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">SafeGuard</h1>
              <p className="text-xs text-school-300">School Platform</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-school-gold/20 text-school-gold border border-school-gold/30 shadow-lg"
                    : "text-school-200 hover:bg-school-700/50 hover:text-white"
                }`}
              >
                <span className={`text-lg ${isActive ? 'scale-110' : ''} transition-transform`}>{icon}</span>
                <span>{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-school-gold animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User Section */}
        <div className="p-4 border-t border-school-700/50">
          <div className="bg-school-700/30 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-xs text-school-300">Need help?</p>
            <p className="text-sm font-medium text-white">Contact Support</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-school-border shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-school-900 tracking-tight">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications, Profile, etc. can go here */}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <section className="flex-1 p-6 bg-gradient-school overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
}
