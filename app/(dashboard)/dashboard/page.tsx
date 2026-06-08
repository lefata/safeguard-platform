// src/app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
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
    <div className="space-y-6">
      {/* page content */}
    </div>
  );
}
  )
}
