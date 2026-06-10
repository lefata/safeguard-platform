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
