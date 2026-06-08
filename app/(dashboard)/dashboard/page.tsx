// src/app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import prisma from '@/lib/prisma'
import {
  Shield,
  AlertTriangle,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = session.user.role as string

  // Fetch dashboard data based on role
  const openCases = await prisma.safeguardingConcern.count({
    where: {
      tenantId: session.user.tenantId,
      status: { notIn: ['CLOSED', 'ARCHIVED'] },
    },
  })

  const criticalCases = await prisma.safeguardingConcern.count({
    where: {
      tenantId: session.user.tenantId,
      riskLevel: 'CRITICAL',
      status: { notIn: ['CLOSED', 'ARCHIVED'] },
    },
  })

  const highRiskCases = await prisma.safeguardingConcern.count({
    where: {
      tenantId: session.user.tenantId,
      riskLevel: 'HIGH',
      status: { notIn: ['CLOSED', 'ARCHIVED'] },
    },
  })

  const totalStudents = await prisma.student.count({
    where: { tenantId: session.user.tenantId, isActive: true },
  })

  const recentConcerns = await prisma.safeguardingConcern.findMany({
    where: { tenantId: session.user.tenantId },
    include: {
      student: { select: { firstName: true, lastName: true, grade: true } },
      category: { select: { name: true } },
      creator: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  const isDSL = ['DSL', 'DEPUTY_DSL', 'SUPER_ADMIN'].includes(role)
  const isAdmin = ['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(role)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name}. Here's your safeguarding overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openCases}</div>
              <p className="text-xs text-muted-foreground">Active safeguarding concerns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{criticalCases}</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">High Risk</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{highRiskCases}</div>
              <p className="text-xs text-muted-foreground">High risk concerns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Concerns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Concerns</CardTitle>
            <CardDescription>Latest safeguarding concerns raised</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConcerns.map((concern) => (
                <div
                  key={concern.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
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
                      <p className="font-medium">{concern.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {concern.student.firstName} {concern.student.lastName} • Grade {concern.student.grade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {concern.category.name} • Reported by {concern.creator.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      concern.riskLevel === 'CRITICAL' ? 'critical' :
                      concern.riskLevel === 'HIGH' ? 'high' :
                      concern.riskLevel === 'MEDIUM' ? 'medium' : 'low'
                    }>
                      {concern.riskLevel}
                    </Badge>
                    <Badge variant="outline">{concern.status}</Badge>
                  </div>
                </div>
              ))}
              {recentConcerns.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No recent concerns</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
