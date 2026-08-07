import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/prisma';
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { formatDateShort, getRiskLevelColor } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Fetch counts
  const openCases = await prisma.safeguardingConcern.count({
    where: { tenantId: (session.user as any).tenantId, status: { notIn: ['CLOSED', 'ARCHIVED'] } },
  });
  const criticalCases = await prisma.safeguardingConcern.count({
    where: { tenantId: (session.user as any).tenantId, riskLevel: 'CRITICAL', status: { notIn: ['CLOSED', 'ARCHIVED'] } },
  });
  const highRiskCases = await prisma.safeguardingConcern.count({
    where: { tenantId: (session.user as any).tenantId, riskLevel: 'HIGH', status: { notIn: ['CLOSED', 'ARCHIVED'] } },
  });
  const totalStudents = await prisma.student.count({
    where: { tenantId: (session.user as any).tenantId, isActive: true },
  });

  const recentConcerns = await prisma.safeguardingConcern.findMany({
    where: { tenantId: (session.user as any).tenantId },
    include: {
      student: { select: { firstName: true, lastName: true, grade: true } },
      category: { select: { name: true } },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-school-500 mb-1">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-school-900">
            Welcome back, {session.user.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Here's your safeguarding overview for today.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Cases"
          value={openCases}
          icon={Shield}
          accent="school"
        />
        <StatCard
          title="Critical"
          value={criticalCases}
          icon={AlertTriangle}
          accent="danger"
          trend="Requires immediate attention"
        />
        <StatCard
          title="High Risk"
          value={highRiskCases}
          icon={TrendingUp}
          accent="warning"
        />
        <StatCard
          title="Students"
          value={totalStudents}
          icon={Users}
          accent="success"
        />
      </div>

      {/* Recent Concerns */}
      <Card className="shadow-school-card border-0 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-school-border/70 bg-school-50/50">
          <div>
            <CardTitle className="font-display font-medium text-xl">Recent Concerns</CardTitle>
            <CardDescription>Latest safeguarding reports</CardDescription>
          </div>
          <Link href="/safeguarding" className="text-sm text-school-600 hover:text-school-700 font-medium flex items-center gap-1 shrink-0">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {recentConcerns.map((concern) => (
              <Link
                key={concern.id}
                href={`/safeguarding/${concern.id}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-transparent bg-muted/40 hover:bg-muted hover:border-school-border transition-colors group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      concern.riskLevel === "CRITICAL"
                        ? "bg-red-50 text-red-500"
                        : concern.riskLevel === "HIGH"
                        ? "bg-orange-50 text-orange-500"
                        : "bg-blue-50 text-blue-500"
                    }`}
                  >
                    {concern.riskLevel === "CRITICAL" || concern.riskLevel === "HIGH" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Shield className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium group-hover:text-school-700 transition-colors truncate">
                      {concern.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {concern.student.firstName} {concern.student.lastName} · Grade {concern.student.grade}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {concern.category.name} · {formatDateShort(concern.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge className={`shrink-0 ${getRiskLevelColor(concern.riskLevel)}`}>
                  {concern.riskLevel}
                </Badge>
              </Link>
            ))}
            {recentConcerns.length === 0 && (
              <div className="text-center py-16">
                <div className="h-14 w-14 rounded-2xl bg-school-50 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-7 w-7 text-school-300" />
                </div>
                <p className="text-muted-foreground">No recent concerns.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const ACCENTS = {
  school: {
    icon: "bg-school-50 text-school-600",
    bar: "bg-school-500",
  },
  danger: {
    icon: "bg-red-50 text-red-600",
    bar: "bg-red-500",
  },
  warning: {
    icon: "bg-orange-50 text-orange-600",
    bar: "bg-orange-500",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
  },
} as const;

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: keyof typeof ACCENTS;
  trend?: string;
}) {
  const styles = ACCENTS[accent];
  return (
    <Card className="relative shadow-school-card border-0 overflow-hidden hover:shadow-school-hover hover:-translate-y-0.5 transition-all duration-300">
      <div className={`absolute inset-x-0 top-0 h-1 ${styles.bar}`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-display font-semibold tracking-tight text-school-900">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${styles.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <p className="text-xs text-red-600 mt-3 font-medium flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
