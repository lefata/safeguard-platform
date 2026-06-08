// src/server-actions/students.ts
'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const importStudentSchema = z.object({
  studentId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  gender: z.string().optional(),
  grade: z.string(),
  homeroom: z.string().optional(),
  house: z.string().optional(),
  parentContacts: z.string().optional(), // JSON string
})

export async function importStudents(data: z.infer<typeof importStudentSchema>[]) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')
  if (session.user.role !== 'SCHOOL_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized')
  }

  const results = { success: 0, errors: 0, errorsList: [] as string[] }

  for (const row of data) {
    try {
      const validated = importStudentSchema.parse(row)
      await prisma.student.upsert({
        where: {
          tenantId_studentId: {
            tenantId: session.user.tenantId,
            studentId: validated.studentId,
          },
        },
        update: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          dateOfBirth: new Date(validated.dateOfBirth),
          gender: validated.gender,
          grade: validated.grade,
          homeroom: validated.homeroom,
          house: validated.house,
          parentContacts: validated.parentContacts ? JSON.parse(validated.parentContacts) : [],
        },
        create: {
          tenantId: session.user.tenantId,
          studentId: validated.studentId,
          firstName: validated.firstName,
          lastName: validated.lastName,
          dateOfBirth: new Date(validated.dateOfBirth),
          gender: validated.gender,
          grade: validated.grade,
          homeroom: validated.homeroom,
          house: validated.house,
          parentContacts: validated.parentContacts ? JSON.parse(validated.parentContacts) : [],
        },
      })
      results.success++
    } catch (error: any) {
      results.errors++
      results.errorsList.push(`Row ${row.studentId}: ${error.message}`)
    }
  }

  return results
}

export async function getStudents(params?: {
  grade?: string
  homeroom?: string
  search?: string
  status?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  return prisma.student.findMany({
    where: {
      tenantId: session.user.tenantId,
      isActive: params?.status !== 'WITHDRAWN',
      ...(params?.grade && { grade: params.grade }),
      ...(params?.homeroom && { homeroom: params.homeroom }),
      ...(params?.search && {
        OR: [
          { firstName: { contains: params.search, mode: 'insensitive' } },
          { lastName: { contains: params.search, mode: 'insensitive' } },
          { studentId: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { lastName: 'asc' },
    take: 200,
  })
}
