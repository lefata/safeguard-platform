// src/app/(dashboard)/safeguarding/layout.tsx

// Force all safeguarding pages to be rendered dynamically (no static generation)
export const dynamic = 'force-dynamic';

export default function SafeguardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
