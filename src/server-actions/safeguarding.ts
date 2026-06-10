// src/server-actions/safeguarding.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { notifyDSLOnCriticalConcern } from '@/lib/notifications';
import { z } from 'zod';

const createConcernSchema = z.object({
  studentId: z.string().min(1),
  categoryId: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  dateOfIncident: z.string().optional(),
  locationOfIncident: z.string().optional(),
  immediateActions: z.string().optional(),
  witnessIds: z.array(z.string()).optional(),
  relatedStudentIds: z.array(z.string()).optional(),
});

export async function createSafeguardingConcern(
  data: z.infer<typeof createConcernSchema>
) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  const validated = createConcernSchema.parse(data);
  const tenantId = (session.user as any).tenantId;
  const creatorId = (session.user as any).id;

  // 1. Create the concern record
  const concern = await prisma.safeguardingConcern.create({
    data: {
      tenantId,
      studentId: validated.studentId,
      categoryId: validated.categoryId,
      creatorId,
      title: validated.title,
      description: validated.description,
      riskLevel: validated.riskLevel,
      dateOfIncident: validated.dateOfIncident ? new Date(validated.dateOfIncident) : new Date(),
      locationOfIncident: validated.locationOfIncident,
      immediateActions: validated.immediateActions,
      witnesses: validated.witnessIds || [],
      relatedStudentIds: validated.relatedStudentIds || [],
      status: 'NEW',
    },
    include: {
      student: { select: { firstName: true, lastName: true } },
      category: { select: { name: true } },
    },
  });

  // 2. Add timeline entry
  await prisma.caseTimelineEntry.create({
    data: {
      concernId: concern.id,
      actorId: creatorId,
      action: 'CONCERN_CREATED',
      description: `Safeguarding concern created: ${concern.title}`,
    },
  });

  // 3. Add chronology entry
  await prisma.chronologyEntry.create({
    data: {
      tenantId,
      studentId: validated.studentId,
      entryType: 'SAFEGUARDING',
      referenceId: concern.id,
      title: concern.title,
      description: concern.description,
      entryDate: concern.dateOfIncident,
    },
  });

  // 4. Audit log
  await createAuditLog({
    tenantId,
    userId: creatorId,
    action: 'CREATE_SAFEGUARDING_CONCERN',
    entity: 'SafeguardingConcern',
    entityId: concern.id,
    newValue: concern,
  });

  // 5. Critical risk triggers immediate notification
  if (validated.riskLevel === 'CRITICAL') {
    await notifyDSLOnCriticalConcern({
      tenantId,
      concernId: concern.id,
      studentName: `${concern.student.firstName} ${concern.student.lastName}`,
      riskLevel: 'CRITICAL',
      category: concern.category.name,
    });

    await prisma.safeguardingConcern.update({
      where: { id: concern.id },
      data: { escalationLevel: 1 },
    });
  }

  revalidatePath('/safeguarding');
  return concern;
}
export async function getSafeguardingConcerns(filters?: {
  status?: string;
  riskLevel?: string;
  categoryId?: string;
  studentId?: string;
  assigneeId?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  return prisma.safeguardingConcern.findMany({
    where: {
      tenantId: (session.user as any).tenantId,
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.riskLevel && { riskLevel: filters.riskLevel as any }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.studentId && { studentId: filters.studentId }),
      ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, grade: true, photo: true } },
      category: { select: { id: true, name: true } },
      creator: { select: { id: true, name: true, role: true } },
      assignee: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}
// Add a case note (any authenticated user with access to the concern)
export async function addCaseNote(concernId: string, content: string, isInternal: boolean = true) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  const concern = await prisma.safeguardingConcern.findUnique({ where: { id: concernId } });
  if (!concern || concern.tenantId !== (session.user as any).tenantId) throw new Error('Not found');

  const note = await prisma.caseNote.create({
    data: {
      concernId,
      authorId: (session.user as any).id,
      content,
      isInternal,
    },
  });

  await prisma.caseTimelineEntry.create({
    data: {
      concernId,
      actorId: (session.user as any).id,
      action: 'NOTE_ADDED',
      description: `${isInternal ? 'Internal' : 'Shared'} note added`,
    },
  });

  revalidatePath(`/safeguarding/${concernId}`);
  return note;
}

// Add an action (DSL/Deputy DSL)
export async function addSafeguardingAction(data: {
  concernId: string;
  actionType: string;
  description: string;
  assignedToId?: string;
  dueDate?: string;
  priority?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  const role = (session.user as any).role;
  if (!['DSL', 'DEPUTY_DSL', 'SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(role)) {
    throw new Error('Only DSLs can add actions');
  }

  const action = await prisma.safeguardingAction.create({
    data: {
      concernId: data.concernId,
      assignedToId: data.assignedToId || (session.user as any).id,
      actionType: data.actionType,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      priority: data.priority || 'MEDIUM',
      status: 'PENDING',
    },
  });

  await prisma.caseTimelineEntry.create({
    data: {
      concernId: data.concernId,
      actorId: (session.user as any).id,
      action: 'ACTION_ADDED',
      description: `New action: ${data.actionType} - ${data.description}`,
    },
  });

  revalidatePath(`/safeguarding/${data.concernId}`);
  return action;
}

// Update case status (DSL/Deputy DSL)
export async function updateCaseStatus(concernId: string, status: string, notes?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  const role = (session.user as any).role;
  if (!['DSL', 'DEPUTY_DSL', 'SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(role)) {
    throw new Error('Only DSLs can update case status');
  }

  const old = await prisma.safeguardingConcern.findUnique({ where: { id: concernId } });
  if (!old || old.tenantId !== (session.user as any).tenantId) throw new Error('Not found');

  const updated = await prisma.safeguardingConcern.update({
    where: { id: concernId },
    data: {
      status,
      closedAt: status === 'CLOSED' ? new Date() : null,
      closureNotes: notes || undefined,
    },
  });

  await prisma.caseTimelineEntry.create({
    data: {
      concernId,
      actorId: (session.user as any).id,
      action: 'STATUS_CHANGED',
      description: `Status changed from ${old.status} to ${status}${notes ? ': ' + notes : ''}`,
    },
  });

  revalidatePath(`/safeguarding/${concernId}`);
  return updated;
}

// Assign case (DSL/Deputy DSL)
export async function assignCase(concernId: string, assigneeId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  const role = (session.user as any).role;
  if (!['DSL', 'DEPUTY_DSL', 'SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(role)) {
    throw new Error('Only DSLs can assign cases');
  }

  const updated = await prisma.safeguardingConcern.update({
    where: { id: concernId },
    data: {
      assigneeId,
      status: 'INVESTIGATING',
    },
  });

  await prisma.caseTimelineEntry.create({
    data: {
      concernId,
      actorId: (session.user as any).id,
      action: 'ASSIGNED',
      description: `Case assigned to user ${assigneeId}`,
    },
  });

  revalidatePath(`/safeguarding/${concernId}`);
  return updated;
}
