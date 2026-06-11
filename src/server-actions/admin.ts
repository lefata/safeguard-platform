// src/server-actions/admin.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

// Ensure only SUPER_ADMIN can access these functions
async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  if ((session.user as any).role !== 'SUPER_ADMIN') throw new Error('Unauthorized');
  return session;
}

export async function createSchool(data: {
  name: string;
  slug: string;
  timezone?: string;
  locale?: string;
}) {
  await requireSuperAdmin();

  // Check if slug already exists
  const existing = await prisma.tenant.findUnique({ where: { slug: data.slug } });
  if (existing) throw new Error('A school with this slug already exists.');

  const tenant = await prisma.tenant.create({
    data: {
      name: data.name,
      slug: data.slug,
      timezone: data.timezone || 'UTC',
      locale: data.locale || 'en-GB',
      subscriptionTier: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
    },
  });

  revalidatePath('/admin');
  return tenant;
}

export async function createUserForSchool(data: {
  tenantId: string;
  email: string;
  name: string;
  role: string; // e.g., 'TEACHER', 'COUNSELOR', 'PRINCIPAL', 'SCHOOL_ADMIN', etc.
  password: string;
}) {
  await requireSuperAdmin();

  // Validate tenant exists
  const tenant = await prisma.tenant.findUnique({ where: { id: data.tenantId } });
  if (!tenant) throw new Error('School not found.');

  // Check if user already exists in that tenant
  const existing = await prisma.user.findFirst({
    where: { tenantId: data.tenantId, email: data.email },
  });
  if (existing) throw new Error('A user with this email already exists in this school.');

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      tenantId: data.tenantId,
      email: data.email,
      name: data.name,
      role: data.role,
      password: hashedPassword,
      isActive: true,
    },
  });

  revalidatePath('/admin');
  return user;
}

// Also fetch all tenants for the Super Admin (for dropdown)
export async function getAllTenants() {
  await requireSuperAdmin();
  return prisma.tenant.findMany({
    select: { id: true, name: true, slug: true, subscriptionStatus: true },
    orderBy: { name: 'asc' },
  });
}
