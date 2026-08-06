// src/components/layouts/dashboard-layout.tsx
"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  Shield,
  LayoutDashboard,
  GraduationCap,
  ShieldAlert,
  ClipboardList,
  Settings,
  LifeBuoy,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Students", href: "/dashboard/students", icon: GraduationCap },
  { label: "Safeguarding", href: "/dashboard/safeguarding", icon: ShieldAlert },
  { label: "Reports", href: "/dashboard/reports", icon: ClipboardList },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Modern Sidebar */}
      <aside className="w-64 relative bg-gradient-to-b from-school-900 to-school-800 border-r border-school-700 flex flex-col shadow-xl overflow-hidden">
        {/* Signature crest-lattice watermark */}
        <div className="absolute inset-0 bg-crest-lattice pointer-events-none" />

        {/* Logo Section */}
        <div className="relative p-6 border-b border-school-700/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-school-gold to-school-gold-light flex items-center justify-center shadow-lg shrink-0">
              <Shield className="h-6 w-6 text-school-900" />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold text-white tracking-tight leading-none">SafeGuard</h1>
              <p className="text-xs text-school-300 mt-1">School Platform</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-4 text-[11px] font-semibold uppercase tracking-wider text-school-400 mb-2">
            Menu
          </p>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-school-gold/15 text-school-gold border border-school-gold/30 shadow-lg"
                    : "text-school-200 hover:bg-school-700/50 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-transform ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                <span className="text-sm">{label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-school-gold animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="relative p-4 border-t border-school-700/50">
          <div className="flex items-center gap-3 bg-school-700/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="h-9 w-9 rounded-lg bg-school-gold/15 flex items-center justify-center shrink-0">
              <LifeBuoy className="h-4 w-4 text-school-gold" />
            </div>
            <div>
              <p className="text-xs text-school-300">Need help?</p>
              <p className="text-sm font-medium text-white leading-tight">Contact Support</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-auto">
        {/* Modern Header */}
        <header className="bg-background/80 backdrop-blur-md border-b border-school-border shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-medium text-school-900 tracking-tight">Dashboard</h2>
              <p className="text-sm text-muted-foreground">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* Notifications, Profile, etc. can go here */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <section className="flex-1 p-6 bg-dot-grid bg-background overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  );
}
