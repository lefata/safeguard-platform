// src/server-actions/wellbeing.ts
'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createWellbeingNoteSchema = z.object({
  studentId: z.string().min(1),
  noteType: z.string(),
  content: z.string().min(1),
  mood: z.string().optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  isPrivate: z.boolean().default(false),
})

export async function createWellbeingNote(data: z.infer<typeof createWellbeingNoteSchema>) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  const validated = createWellbeingNoteSchema.parse(data)

  const note = await prisma.wellbeingNote.create({
    data: {
      tenantId: session.user.tenantId,
      studentId: validated.studentId,
      authorId: session.user.id,
      noteType: validated.noteType,
      content: validated.content,
      mood: validated.mood,
      energyLevel: validated.energyLevel,
      isPrivate: validated.isPrivate,
    },
  })

  await prisma.chronologyEntry.create({
    data: {
      tenantId: session.user.tenantId,
      studentId: validated.studentId,
      entryType: 'WELLBEING',
      referenceId: note.id,
      title: `Wellbeing Note - ${validated.noteType}`,
      description: validated.content.substring(0, 200),
      entryDate: new Date(),
    },
  })

  revalidatePath('/wellbeing')
  return note
}

export async function createWellbeingCheckin(data: {
  studentId: string
  mood: string
  energyLevel?: number
  stressLevel?: number
  sleepQuality?: number
  notes?: string
}) {
  const session = await auth()
  if (!session?.user) throw new Error('Not authenticated')

  return prisma.wellbeingCheckin.create({
    data: {
      tenantId: session.user.tenantId,
      ...data,
    },
  })
}
