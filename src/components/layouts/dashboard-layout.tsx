"use client";

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Students', href: '/dashboard/students', icon: '🎓' },
  { label: 'Safeguarding', href: '/dashboard/safeguarding', icon: '🛡️' },
  { label: 'Reports', href: '/dashboard/reports', icon: '📋' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-school-bg">
      <aside className="w-64 bg-school-surface border-r border-school-border-light flex flex-col">
        <div className="p-6 border-b border-school-border-light flex items-center justify-between">
          <h1 className="text-xl font-bold text-school-primary">SafeGuard</h1>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(({ label, href, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-school-primary text-white shadow-school-hover border-l-4 border-school-accent-gold'
                    : 'text-school-text-muted hover:bg-school-primary-light hover:text-school-primary'
                }`}
              >
                <span className="text-lg">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col overflow-auto">
        <header className="bg-school-primary text-white p-4 shadow-school-elevated flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
        </header>
        <section className="flex-1 p-6 bg-school-bg overflow-y-auto">{children}</section>
      </main>
    </div>
  );
}
