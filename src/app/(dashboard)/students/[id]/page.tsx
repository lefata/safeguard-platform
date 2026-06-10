import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, User, GraduationCap, Home, Shield } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const tenantId = (session.user as any).tenantId;

  const student = await prisma.student.findFirst({
    where: { id, tenantId, isActive: true },
    include: {
      safeguardingConcerns: { select: { id: true, title: true, riskLevel: true, status: true, createdAt: true } },
      wellbeingNotes: { select: { id: true, mood: true, createdAt: true } },
    },
  });

  if (!student) notFound();

  const parentContacts = student.parentContacts as any[] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/students">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-muted-foreground">Student ID: {student.studentId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-school-card border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-school-600" /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Grade</span>
              <span className="font-medium">{student.grade}</span>
            </div>
            {student.homeroom && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Homeroom</span>
                <span className="font-medium">{student.homeroom}</span>
              </div>
            )}
            {student.house && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">House</span>
                <span className="font-medium">{student.house}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gender</span>
              <span className="font-medium">{student.gender || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date of Birth</span>
              <span className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString('en-GB')}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-school-card border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-school-600" /> Safeguarding Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {student.safeguardingConcerns.length === 0 ? (
              <p className="text-muted-foreground text-sm">No safeguarding concerns recorded.</p>
            ) : (
              <ul className="space-y-2">
                {student.safeguardingConcerns.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex justify-between items-center text-sm">
                    <Link href={`/safeguarding/${c.id}`} className="text-school-600 hover:underline truncate">
                      {c.title}
                    </Link>
                    <Badge variant={c.riskLevel === 'CRITICAL' ? 'critical' : c.riskLevel === 'HIGH' ? 'high' : 'low'}>
                      {c.riskLevel}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5 text-school-600" /> Parent / Guardian Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {parentContacts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No parent contacts on file.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parentContacts.map((contact: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-muted/40">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.relation}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {contact.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" /> {contact.email}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {contact.phone}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {student.medicalAlerts && (student.medicalAlerts as any[]).length > 0 && (
        <Card className="shadow-school-card border-0 border-l-4 border-red-400">
          <CardHeader>
            <CardTitle className="text-lg text-red-700">Medical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm space-y-1">
              {(student.medicalAlerts as any[]).map((alert: any, idx: number) => (
                <li key={idx}>{alert}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
