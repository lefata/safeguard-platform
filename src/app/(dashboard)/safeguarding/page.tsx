// src/app/(dashboard)/safeguarding/page.tsx
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layouts/dashboard-layout'
import { SafeguardingList } from '@/components/safeguarding/safeguarding-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import Link from 'next/link'

export default async function SafeguardingPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Safeguarding</h1>
            <p className="text-muted-foreground">
              Manage safeguarding concerns and cases
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
            <Button asChild>
              <Link href="/safeguarding/new">
                <Plus className="mr-2 h-4 w-4" /> New Concern
              </Link>
            </Button>
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <SafeguardingList tenantId={session.user.tenantId} userRole={session.user.role} userId={session.user.id} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}
