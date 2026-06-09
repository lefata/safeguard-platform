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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-school-900">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here’s your safeguarding overview for today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Cases"
          value={openCases}
          icon={Shield}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Critical"
          value={criticalCases}
          icon={AlertTriangle}
          color="bg-red-50 text-red-600"
          trend="urgent"
        />
        <StatCard
          title="High Risk"
          value={highRiskCases}
          icon={TrendingUp}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Students"
          value={totalStudents}
          icon={Users}
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Recent Concerns */}
      <Card className="shadow-card border-0">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Concerns</CardTitle>
            <CardDescription>Latest safeguarding reports</CardDescription>
          </div>
          <Link href="/safeguarding" className="text-sm text-school-600 hover:text-school-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentConcerns.map((concern) => (
              <Link
                key={concern.id}
                href={`/safeguarding/${concern.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {concern.riskLevel === 'CRITICAL' ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : concern.riskLevel === 'HIGH' ? (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    ) : (
                      <Shield className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-school-700 transition-colors">
                      {concern.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {concern.student.firstName} {concern.student.lastName} · Grade {concern.student.grade}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {concern.category.name} · {formatDateShort(concern.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge className={getRiskLevelColor(concern.riskLevel)}>
                  {concern.riskLevel}
                </Badge>
              </Link>
            ))}
            {recentConcerns.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No recent concerns.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: string;
}) {
  return (
    <Card className="shadow-card border-0 hover:shadow-soft transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-2">
            {trend === "urgent" ? "⚠️ Requires immediate attention" : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
