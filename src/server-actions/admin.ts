// src/server-actions/admin.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const assignableRoles = [
  'SCHOOL_ADMIN',
  'DSL',
  'DEPUTY_DSL',
  'COUNSELOR',
  'PRINCIPAL',
  'TEACHER',
  'NURSE',
  'STUDENT_SUPPORT',
  'READ_ONLY_AUDITOR',
] as const;

const createUserSchema = z.object({
  tenantId: z.string().cuid(),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  name: z.string().trim().min(1).max(120),
  role: z.enum(assignableRoles),
  password: z.string().min(12).max(128),
});

// Authorise: SUPER_ADMIN always, SCHOOL_ADMIN only if tenant matches
async function checkAdminAccess(tenantId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  const role = (session.user as any).role;
  const userTenantId = (session.user as any).tenantId;

  if (role !== 'SUPER_ADMIN' && role !== 'SCHOOL_ADMIN') {
    throw new Error('Unauthorized');
  }

  // If a specific tenant is required and the user is SCHOOL_ADMIN, must match
  if (tenantId && role === 'SCHOOL_ADMIN' && userTenantId !== tenantId) {
    throw new Error('You can only manage your own school.');
  }

  return { role, userTenantId };
}

export async function createSchool(data: {
  name: string;
  slug: string;
  timezone?: string;
  locale?: string;
}) {
  const { role } = await checkAdminAccess();
  if (role !== 'SUPER_ADMIN') throw new Error('Only Super Admins can create schools.');

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
  role: string;
  password: string;
}) {
  const input = createUserSchema.parse(data);
  // Allow SUPER_ADMIN or SCHOOL_ADMIN (restricted to own tenant)
  const { role: actorRole } = await checkAdminAccess(input.tenantId);
  if (actorRole === 'SCHOOL_ADMIN' && input.role === 'SCHOOL_ADMIN') {
    throw new Error('School administrators cannot create other school administrators.');
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: input.tenantId } });
  if (!tenant) throw new Error('School not found.');

  const existing = await prisma.user.findFirst({
    where: { tenantId: input.tenantId, email: input.email },
  });
  if (existing) throw new Error('A user with this email already exists in this school.');

  const hashedPassword = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      tenantId: input.tenantId,
      email: input.email,
      name: input.name,
      role: input.role,
      password: hashedPassword,
      isActive: true,
    },
  });

  revalidatePath('/admin');
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function getAllTenants() {
  const { role } = await checkAdminAccess();
  // If SCHOOL_ADMIN, return only their own tenant
  if (role === 'SCHOOL_ADMIN') {
    const session = await auth();
    const tenantId = (session?.user as any).tenantId;
    return prisma.tenant.findMany({
      where: { id: tenantId },
      select: { id: true, name: true, slug: true, subscriptionStatus: true },
    });
  }
  return prisma.tenant.findMany({
    select: { id: true, name: true, slug: true, subscriptionStatus: true },
    orderBy: { name: 'asc' },
  });
}

export async function getTenantById(tenantId: string) {
  await checkAdminAccess(tenantId);
  return prisma.tenant.findUnique({ where: { id: tenantId } });
}

export async function updateSchoolSettings(data: {
  tenantId: string;
  name?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  address?: string;
  timezone?: string;
  locale?: string;
}) {
  await checkAdminAccess(data.tenantId);

  const tenant = await prisma.tenant.findUnique({ where: { id: data.tenantId } });
  if (!tenant) throw new Error('School not found');

  const updated = await prisma.tenant.update({
    where: { id: data.tenantId },
    data: {
      name: data.name !== undefined ? data.name : undefined,
      logo: data.logo !== undefined ? data.logo : undefined,
      primaryColor: data.primaryColor !== undefined ? data.primaryColor : undefined,
      secondaryColor: data.secondaryColor !== undefined ? data.secondaryColor : undefined,
      address: data.address !== undefined ? data.address : undefined,
      timezone: data.timezone !== undefined ? data.timezone : undefined,
      locale: data.locale !== undefined ? data.locale : undefined,
    },
  });

  revalidatePath('/admin');
  return updated;
}

export async function getUsersForTenant(tenantId: string) {
  await checkAdminAccess(tenantId);
  return prisma.user.findMany({
    where: { tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const input = z.object({
    userId: z.string().cuid(),
    password: z.string().min(12).max(128),
  }).parse({ userId, password: newPassword });

  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  const userRole = (session.user as any).role;
  const userTenantId = (session.user as any).tenantId;

  if (userRole !== 'SUPER_ADMIN' && userRole !== 'SCHOOL_ADMIN') {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error('User not found');

  // School admin can only reset passwords within their own school
  if (userRole === 'SCHOOL_ADMIN' && user.tenantId !== userTenantId) {
    throw new Error('You can only manage users in your own school.');
  }

  const hashedPassword = await bcrypt.hash(input.password, 12);
  await prisma.user.update({
    where: { id: input.userId },
    data: { password: hashedPassword },
  });

  revalidatePath('/admin');
}
