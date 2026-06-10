// src/app/(dashboard)/layout.tsx

// Prevent static generation – all dashboard pages require auth
export const dynamic = 'force-dynamic';

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The actual layout (top navbar) is now in the root layout or a higher-level wrapper?
  // Since we moved the navbar to the global layout, we no longer need a separate layout here.
  // Just render children directly, or wrap with a simple div if needed.
  return <>{children}</>;
}
