// src/server-actions/safeguarding.ts
'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { notifyDSLOnCriticalConcern } from '@/lib/notifications'
import { z } from 'zod'

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
})

export async function createSafeguardingConcern(data: z.infer<typeof createConcernSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  const validated = createConcernSchema.parse(data)

  const concern = await prisma.safeguardingConcern.create({
    data: {
      tenantId: session.user.tenantId,
      studentId: validated.studentId,
      categoryId: validated.categoryId,
      creatorId: session.user.id,
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
  })

  // Create timeline entry
  await prisma.caseTimelineEntry.create({
    data: {
      concernId: concern.id,
      actorId: session.user.id,
      action: 'CONCERN_CREATED',
      description: `Safeguarding concern created: ${concern.title}`,
    },
  })

  // Create chronology entry
  await prisma.chronologyEntry.create({
    data: {
      tenantId: session.user.tenantId,
      studentId: validated.studentId,
      entryType: 'SAFEGUARDING',
      referenceId: concern.id,
      title: concern.title,
      description: concern.description,
      entryDate: concern.dateOfIncident,
    },
  })

  // Audit log
  await createAuditLog({
    tenantId: session.user.tenantId,
    userId: session.user.id,
    action: 'CREATE_SAFEGUARDING_CONCERN',
    entity: 'SafeguardingConcern',
    entityId: concern.id,
    newValue: concern,
  })

  // Critical risk level triggers immediate notification
  if (validated.riskLevel === 'CRITICAL') {
    await notifyDSLOnCriticalConcern({
      tenantId: session.user.tenantId,
      concernId: concern.id,
      studentName: `${concern.student.firstName} ${concern.student.lastName}`,
      riskLevel: 'CRITICAL',
      category: concern.category.name,
    })

    // Auto-escalate
    await prisma.safeguardingConcern.update({
      where: { id: concern.id },
      data: { escalationLevel: 1 },
    })
  }

  revalidatePath('/safeguarding')
  return concern
}

export async function updateConcernStatus(concernId: string, status: string, notes?: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  const concern = await prisma.safeguardingConcern.findUnique({
    where: { id: concernId },
  })

  if (!concern || concern.tenantId !== session.user.tenantId) {
    throw new Error('Not found or access denied')
  }

  const updated = await prisma.safeguardingConcern.update({
    where: { id: concernId },
    data: {
      status: status as any,
      ...(status === 'CLOSED' ? { closedAt: new Date(), closureNotes: notes } : {}),
    },
  })

  await prisma.caseTimelineEntry.create({
    data: {
      concernId,
      actorId: session.user.id,
      action: 'STATUS_CHANGED',
      description: `Status changed to ${status}${notes ? ': ' + notes : ''}`,
    },
  })

  await createAuditLog({
    tenantId: session.user.tenantId,
    userId: session.user.id,
    action: 'UPDATE_CONCERN_STATUS',
    entity: 'SafeguardingConcern',
    entityId: concernId,
    oldValue: { status: concern.status },
    newValue: { status },
  })

  revalidatePath(`/safeguarding/${concernId}`)
  return updated
}

export async function assignConcern(concernId: string, assigneeId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  const updated = await prisma.safeguardingConcern.update({
    where: { id: concernId },
    data: { assigneeId, status: 'INVESTIGATING' },
  })

  await prisma.caseTimelineEntry.create({
    data: {
      concernId,
      actorId: session.user.id,
      action: 'ASSIGNED',
      description: `Concern assigned to user ${assigneeId}`,
    },
  })

  revalidatePath(`/safeguarding/${concernId}`)
  return updated
}

export async function addCaseNote(concernId: string, content: string, isInternal: boolean = true) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  const note = await prisma.caseNote.create({
    data: {
      concernId,
      authorId: session.user.id,
      content,
      isInternal,
    },
  })

  await prisma.caseTimelineEntry.create({
    data: {
      concernId,
      actorId: session.user.id,
      action: 'NOTE_ADDED',
      description: `New ${isInternal ? 'internal' : ''} note added`,
    },
  })

  revalidatePath(`/safeguarding/${concernId}`)
  return note
}

export async function getSafeguardingConcerns(filters?: {
  status?: string
  riskLevel?: string
  categoryId?: string
  studentId?: string
  assigneeId?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  return prisma.safeguardingConcern.findMany({
    where: {
      tenantId: session.user.tenantId,
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
  })
}

export async function getStudentChronology(studentId: string) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  return prisma.chronologyEntry.findMany({
    where: {
      tenantId: session.user.tenantId,
      studentId,
    },
    orderBy: { entryDate: 'desc' },
    take: 200,
  })
}
