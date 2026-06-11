// src/server-actions/admin.ts
'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

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
  // Allow SUPER_ADMIN or SCHOOL_ADMIN (restricted to own tenant)
  await checkAdminAccess(data.tenantId);

  const tenant = await prisma.tenant.findUnique({ where: { id: data.tenantId } });
  if (!tenant) throw new Error('School not found.');

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
