// src/server-actions/safeguarding.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const createConcernSchema = z.object({
  studentId: z.string().min(1),
  categoryId: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  locationOfIncident: z.string().optional(),
  immediateActions: z.string().optional(),
});

export async function createSafeguardingConcern(
  data: z.infer<typeof createConcernSchema>
) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  const validated = createConcernSchema.parse(data);

  const concern = {
    id: 'temp-' + Date.now(),
    tenantId: (session.user as any).tenantId,
    studentId: validated.studentId,
    categoryId: validated.categoryId,
    creatorId: (session.user as any).id,
    title: validated.title,
    description: validated.description,
    riskLevel: validated.riskLevel,
    status: 'NEW',
    createdAt: new Date(),
  };

  revalidatePath('/safeguarding');
  return concern;
}
