import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { SafeguardingList } from '@/components/safeguarding/safeguarding-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

export default async function SafeguardingPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch concerns from the database
  const concerns = await prisma.concern.findMany({
    where: {
      tenantId: session.user.tenantId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      actor: true,
      timelineEntries: true,
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Safeguarding Concerns</h1>
          <Button>New Concern</Button>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <SafeguardingList 
            concerns={concerns}
            tenantId={session.user.tenantId} 
            userRole={session.user.role} 
            userId={session.user.id} 
          />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
