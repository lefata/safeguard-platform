import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { addCaseNote, addSafeguardingAction, updateCaseStatus, assignCase, completeAction } from '@/server-actions/safeguarding';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getRiskLevelColor, getStatusColor, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  MessageSquare,
  FileText,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { CaseTimeline } from '@/components/safeguarding/case-timeline';
import { CaseActions } from '@/components/safeguarding/case-actions';
import prisma from '@/lib/prisma';
import { addCaseNote, addSafeguardingAction, updateCaseStatus, assignCase } from '@/server-actions/safeguarding';
import { getStudents } from '@/server-actions/students';  // for assignee list? Actually we need staff list, but we'll use a simple input for now

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SafeguardingCasePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;
  const tenantId = (session.user as any).tenantId;
  const currentUserId = (session.user as any).id;
  const userRole = (session.user as any).role as string;

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

  if (!concern || concern.tenantId !== tenantId) redirect('/safeguarding');

  const isDSL = ['DSL', 'DEPUTY_DSL', 'SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(userRole);

  // Fetch staff list for assignment dropdown (simplified: all active users in tenant)
  const staffList = isDSL ? await prisma.user.findMany({
    where: { tenantId, isActive: true },
    select: { id: true, name: true, role: true },
  }) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
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
        <CaseActions concern={concern} userRole={userRole} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content – 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Concern Details */}
          <Card className="shadow-school-card border-0">
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

          {/* Add Note Form */}
          <Card className="shadow-school-card border-0">
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
              <CardDescription>Record an observation or update (visible to team)</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const content = formData.get('content') as string;
                  await addCaseNote(concern.id, content, true);
                }}
              >
                <Textarea name="content" placeholder="Type your note…" required className="mb-3" />
                <Button type="submit">
                  <MessageSquare className="mr-2 h-4 w-4" /> Add Note
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Case Notes (display) */}
          <Card className="shadow-school-card border-0">
            <CardHeader>
              <CardTitle>Case Notes</CardTitle>
              <CardDescription>All notes recorded for this case</CardDescription>
            </CardHeader>
            <CardContent>
              {concern.caseNotes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No notes yet.</p>
              ) : (
                <div className="space-y-4">
                  {concern.caseNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl bg-muted/40">
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
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Action Form (DSL only) */}
          {isDSL && (
            <Card className="shadow-school-card border-0 border-l-4 border-school-500">
              <CardHeader>
                <CardTitle>Add Action</CardTitle>
                <CardDescription>Create a follow‑up task for this case</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const actionType = formData.get('actionType') as string;
                    const description = formData.get('description') as string;
                    const assignedToId = formData.get('assignedToId') as string || undefined;
                    const dueDate = formData.get('dueDate') as string || undefined;
                    const priority = formData.get('priority') as string || 'MEDIUM';
                    await addSafeguardingAction({
                      concernId: concern.id,
                      actionType,
                      description,
                      assignedToId,
                      dueDate,
                      priority,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Action Type</label>
                      <Input name="actionType" placeholder="e.g., Interview, Referral" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select name="priority" defaultValue="MEDIUM">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea name="description" placeholder="What needs to be done?" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Assign To</label>
                      <Select name="assignedToId">
                        <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                        <SelectContent>
                          {staffList.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Due Date</label>
                      <Input name="dueDate" type="date" />
                    </div>
                  </div>
                  <Button type="submit">
                    <FileText className="mr-2 h-4 w-4" /> Add Action
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

                   {/* Actions List */}
          <Card className="shadow-school-card border-0">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Tasks and follow‑up actions</CardDescription>
            </CardHeader>
            <CardContent>
              {concern.actions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No actions yet.</p>
              ) : (
                <div className="space-y-3">
                  {concern.actions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-4 rounded-xl border bg-white">
                      <div>
                        <p className="font-medium text-sm">{action.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Type: {action.actionType} • Assigned to: {action.assignedTo?.name || 'Unassigned'}
                          {action.dueDate && ` • Due: ${formatDate(action.dueDate)}`}
                        </p>
                        {action.status === 'COMPLETED' && action.completedBy && (
                          <p className="text-xs text-green-600 mt-1">
                            ✅ Completed by {action.completedBy.name} on {formatDate(action.completedAt!)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          action.status === 'COMPLETED' ? 'success' :
                          action.status === 'OVERDUE' ? 'destructive' :
                          'secondary'
                        }>
                          {action.status.replace(/_/g, ' ')}
                        </Badge>
                        {action.status !== 'COMPLETED' && (
                          <form
                            action={async () => {
                              "use server";
                              await completeAction(action.id, concern.id);
                            }}
                          >
                            <Button variant="outline" size="sm" type="submit">
                              Complete
                            </Button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar – 1 column */}
        <div className="space-y-6">
          {/* Student Info */}
          <Card className="shadow-school-card border-0">
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
                <Link href={`/students/${concern.student.id}`}>View Full Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Case Info + Assign / Status */}
          <Card className="shadow-school-card border-0">
            <CardHeader>
              <CardTitle className="text-lg">Case Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Current Status</p>
                <Badge className={getStatusColor(concern.status)}>{concern.status.replace(/_/g, ' ')}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="text-sm font-medium">{concern.assignee?.name || 'Unassigned'}</p>
              </div>

              {isDSL && (
                <>
                  <Separator />
                  {/* Assign Form */}
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      const assigneeId = formData.get('assigneeId') as string;
                      if (assigneeId) await assignCase(concern.id, assigneeId);
                    }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium">Reassign</label>
                    <div className="flex gap-2">
                      <Select name="assigneeId">
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose staff" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffList.map((u) => (
                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="submit" size="sm">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>

                  {/* Status Update Form */}
                  <form
                    action={async (formData: FormData) => {
                      "use server";
                      const newStatus = formData.get('status') as string;
                      const notes = formData.get('notes') as string;
                      if (newStatus) await updateCaseStatus(concern.id, newStatus, notes);
                    }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium">Update Status</label>
                    <div className="flex gap-2">
                      <Select name="status">
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="New status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEW">New</SelectItem>
                          <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                          <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                          <SelectItem value="ESCALATED">Escalated</SelectItem>
                          <SelectItem value="MONITORING">Monitoring</SelectItem>
                          <SelectItem value="CLOSED">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="submit" size="sm" variant="secondary">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea name="notes" placeholder="Optional note about this status change" className="mt-2" />
                  </form>
                </>
              )}
            </CardContent>
          </Card>
              {/* Close Case Button – visible only if case is not already closed */}
              {concern.status !== 'CLOSED' && (
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    const notes = formData.get('closureNotes') as string;
                    await updateCaseStatus(concern.id, 'CLOSED', notes);
                  }}
                  className="space-y-2"
                >
                  <input type="hidden" name="closureNotes" value="" />
                  <Button
                    type="submit"
                    variant="destructive"
                    className="w-full"
                    onClick={(e) => {
                      if (!confirm('Are you sure you want to close this case? This will finalize all actions.')) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Close Case
                  </Button>
                </form>
              )}
          {/* Timeline */}
          <Card className="shadow-school-card border-0">
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
