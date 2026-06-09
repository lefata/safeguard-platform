import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import prisma from '@/lib/prisma';

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const students = await prisma.student.findMany({
    where: { tenantId: (session.user as any).tenantId, isActive: true },
    orderBy: { lastName: 'asc' },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      grade: true,
      homeroom: true,
      house: true,
      enrollmentStatus: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <p className="text-muted-foreground">Manage your school’s student records.</p>
      </div>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>{students.length} student(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={students} searchKey="lastName" searchPlaceholder="Search by last name…" />
        </CardContent>
      </Card>
    </div>
  );
}
