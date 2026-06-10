// src/server-actions/behavior.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getBehaviorIncidents(filters?: {
  studentId?: string;
  categoryId?: string;
  type?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  return prisma.behaviorIncident.findMany({
    where: {
      tenantId: (session.user as any).tenantId,
      ...(filters?.studentId && { studentId: filters.studentId }),
      ...(filters?.categoryId && { categoryId: filters.categoryId }),
      ...(filters?.type && {
        category: {
          type: filters.type,
        },
      }),
    },
    include: {
      student: { select: { firstName: true, lastName: true, grade: true } },
      category: { select: { name: true, type: true } },
      recorder: { select: { name: true } },
    },
    orderBy: { dateOfIncident: 'desc' },
    take: 50,
  });
}

export async function getBehaviorCategories() {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  return prisma.behaviorCategory.findMany({
    where: { tenantId: (session.user as any).tenantId, isActive: true },
    select: { id: true, name: true, type: true },
    orderBy: { name: 'asc' },
  });
}

export async function createBehaviorIncident(data: {
  studentId: string;
  categoryId: string;
  title: string;
  description: string;
  location?: string;
  actionTaken?: string;
  disciplinaryAction?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  const tenantId = (session.user as any).tenantId;
  const recorderId = (session.user as any).id;

  const incident = await prisma.behaviorIncident.create({
    data: {
      tenantId,
      studentId: data.studentId,
      categoryId: data.categoryId,
      recorderId,
      title: data.title,
      description: data.description,
      location: data.location,
      actionTaken: data.actionTaken,
      disciplinaryAction: data.disciplinaryAction,
    },
  });

  // Create chronology entry
  await prisma.chronologyEntry.create({
    data: {
      tenantId,
      studentId: data.studentId,
      entryType: 'BEHAVIOR',
      referenceId: incident.id,
      title: incident.title,
      description: incident.description,
      entryDate: incident.dateOfIncident,
    },
  });

  return incident;
}
