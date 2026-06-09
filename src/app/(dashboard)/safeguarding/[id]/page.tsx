// src/app/(dashboard)/safeguarding/[id]/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getRiskLevelColor, getStatusColor, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  UserPlus,
  FileText,
  MessageSquare,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { CaseTimeline } from '@/components/safeguarding/case-timeline';
import { CaseActions } from '@/components/safeguarding/case-actions';
import prisma from '@/lib/prisma';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SafeguardingCasePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Await params in Next.js 15
  const { id } = await params;

  const concern = await prisma.safeguardingConcern.findUnique({
    where: { id },
    include: {
      student: true,
      category: true,
      creator: { select: { id: true, name: true, role: true } },
      assignee: { select: { id: true, name: true, role: true } },
      caseNotes: {
        include: {
          author: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      actions: {
        include: {
          assignedTo: { select: { id: true, name: true } },
          completedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      timeline: {
        include: {
          actor: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!concern || concern.tenantId !== (session.user as any).tenantId) {
    redirect('/safeguarding');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/safeguarding">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{concern.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getRiskLevelColor(concern.riskLevel)}>
                {concern.riskLevel}
              </Badge>
              <Badge className={getStatusColor(concern.status)}>
                {concern.status.replace(/_/g, ' ')}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Case #{concern.id.slice(-8)}
              </span>
            </div>
          </div>
        </div>
        <CaseActions concern={concern} userRole={(session.user as any).role} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Concern Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="mt-1 whitespace-pre-wrap">{concern.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p>{concern.category.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date of Incident</h4>
                  <p>{formatDate(concern.dateOfIncident)}</p>
                </div>
                {concern.locationOfIncident && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                    <p>{concern.locationOfIncident}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Reported By</h4>
                  <p>{concern.creator.name} ({concern.creator.role})</p>
                </div>
              </div>

              {concern.immediateActions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Immediate Actions</h4>
                    <p className="mt-1">{concern.immediateActions}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Case Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Case Notes</CardTitle>
                <CardDescription>Internal notes and updates</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" /> Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {concern.caseNotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notes yet</p>
              ) : (
                <div className="space-y-4">
                  {concern.caseNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{note.author.name}</span>
                          {note.isInternal && (
                            <Badge variant="outline" className="text-xs">Internal</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Actions</CardTitle>
                <CardDescription>Tasks and follow-up actions</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="mr-2 h-4 w-4" /> Add Action
              </Button>
            </CardHeader>
            <CardContent>
              {concern.actions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No actions yet</p>
              ) : (
                <div className="space-y-3">
                  {concern.actions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{action.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Assigned to: {action.assignedTo?.name || 'Unassigned'}
                          {action.dueDate && ` • Due: ${formatDate(action.dueDate)}`}
                        </p>
                      </div>
                      <Badge variant={
                        action.status === 'COMPLETED' ? 'success' :
                        action.status === 'OVERDUE' ? 'destructive' :
                        action.status === 'IN_PROGRESS' ? 'info' : 'secondary'
                      }>
                        {action.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">
                    {concern.student.firstName[0]}{concern.student.lastName[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{concern.student.firstName} {concern.student.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    Grade {concern.student.grade} • {concern.student.studentId}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href={`/students/${concern.student.id}`}>
                  View Full Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Case Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Case Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(concern.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="text-sm">{concern.assignee?.name || 'Unassigned'}</p>
              </div>
              {concern.reviewDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Review Date</p>
                  <p className="text-sm">{formatDate(concern.reviewDate)}</p>
                </div>
              )}
              {concern.closedAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Closed</p>
                  <p className="text-sm">{formatDate(concern.closedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CaseTimeline entries={concern.timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
