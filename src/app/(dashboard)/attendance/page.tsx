import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { formatDateShort } from '@/lib/utils';

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      tenantId: (session.user as any).tenantId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 86400000),
      },
    },
    include: {
      student: { select: { firstName: true, lastName: true, grade: true } },
    },
    orderBy: { date: 'desc' },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Today’s attendance records</p>
      </div>
      <div className="grid gap-4">
        {records.length === 0 ? (
          <Card className="shadow-card border-0">
            <CardContent className="py-8 text-center text-muted-foreground">
              No attendance recorded today.
            </CardContent>
          </Card>
        ) : (
          records.map((r) => (
            <Card key={r.id} className="shadow-card border-0">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{r.student.firstName} {r.student.lastName}</p>
                  <p className="text-sm text-muted-foreground">Grade {r.student.grade}</p>
                </div>
                <Badge variant={r.status === 'PRESENT' ? 'success' : r.status === 'ABSENT' ? 'destructive' : 'warning'}>
                  {r.status}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
