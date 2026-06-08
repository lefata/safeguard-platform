// src/app/(dashboard)/safeguarding/new/page.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSafeguardingConcern } from '@/server-actions/safeguarding'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const concernSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  locationOfIncident: z.string().optional(),
  immediateActions: z.string().optional(),
})

type ConcernFormData = z.infer<typeof concernSchema>

export default function NewSafeguardingConcernPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ConcernFormData>({
    resolver: zodResolver(concernSchema),
    defaultValues: {
      riskLevel: 'MEDIUM',
    },
  })

  const onSubmit = async (data: ConcernFormData) => {
    setIsSubmitting(true)
    try {
      const concern = await createSafeguardingConcern(data)
      toast.success('Safeguarding concern created successfully')
      router.push(`/safeguarding/${concern.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to create concern')
    } finally {
      setIsSubmitting(false)
    }
  }
return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ... */}
    </div>
  )
}
