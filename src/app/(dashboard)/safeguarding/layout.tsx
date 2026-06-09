// src/app/(dashboard)/layout.tsx
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Prevent static generation – all dashboard pages require auth
export const dynamic = 'force-dynamic';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
