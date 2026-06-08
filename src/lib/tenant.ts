// src/lib/tenant.ts
import { cache } from 'react'
import prisma from '@/lib/prisma'

export const getTenantBySlug = cache(async (slug: string) => {
  return prisma.tenant.findUnique({
    where: { slug },
  })
})

export const getTenantById = cache(async (id: string) => {
  return prisma.tenant.findUnique({
    where: { id },
  })
})

export const getCurrentTenant = cache(async (tenantId: string) => {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      primaryColor: true,
      secondaryColor: true,
      timezone: true,
      locale: true,
      features: true,
      safeguardingSettings: true,
      notificationSettings: true,
    },
  })
})

export const validateTenantAccess = async (tenantId: string, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tenantId: true, role: true },
  })
  
  if (!user) return false
  if (user.role === 'SUPER_ADMIN') return true
  return user.tenantId === tenantId
}
