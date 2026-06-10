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
