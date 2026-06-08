// src/lib/audit.ts
import prisma from '@/lib/prisma'

interface AuditEntry {
  tenantId: string
  userId?: string
  action: string
  entity: string
  entityId?: string
  oldValue?: any
  newValue?: any
  ipAddress?: string
  userAgent?: string
  metadata?: any
}

export async function createAuditLog(entry: AuditEntry) {
  return prisma.auditLog.create({
    data: {
      tenantId: entry.tenantId,
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      oldValue: entry.oldValue ? JSON.parse(JSON.stringify(entry.oldValue)) : undefined,
      newValue: entry.newValue ? JSON.parse(JSON.stringify(entry.newValue)) : undefined,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata || {},
    },
  })
}

export async function getAuditLogs(params: {
  tenantId: string
  entity?: string
  entityId?: string
  userId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  return prisma.auditLog.findMany({
    where: {
      tenantId: params.tenantId,
      ...(params.entity && { entity: params.entity }),
      ...(params.entityId && { entityId: params.entityId }),
      ...(params.userId && { userId: params.userId }),
      ...(params.startDate && params.endDate && {
        createdAt: {
          gte: params.startDate,
          lte: params.endDate,
        },
      }),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit || 100,
    skip: params.offset || 0,
  })
}
