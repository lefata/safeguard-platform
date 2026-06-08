// src/app/(dashboard)/safeguarding/new/page.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
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
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/safeguarding">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Safeguarding Concern</h1>
            <p className="text-muted-foreground">Record a new safeguarding concern</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Concern Details</CardTitle>
              <CardDescription>
                Provide details about the safeguarding concern. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student *</Label>
                  <Select onValueChange={(value) => setValue('studentId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student-1">John Doe - Grade 10</SelectItem>
                      <SelectItem value="student-2">Jane Smith - Grade 9</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.studentId && (
                    <p className="text-sm text-red-500">{errors.studentId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select onValueChange={(value) => setValue('categoryId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cat-1">Child Protection</SelectItem>
                      <SelectItem value="cat-2">Emotional Wellbeing</SelectItem>
                      <SelectItem value="cat-3">Self Harm</SelectItem>
                      <SelectItem value="cat-4">Bullying</SelectItem>
                      <SelectItem value="cat-5">Online Safety</SelectItem>
                      <SelectItem value="cat-6">Neglect</SelectItem>
                      <SelectItem value="cat-7">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title describing the concern"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed account of the concern. Include what happened, when, where, and who was involved."
                  rows={6}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level *</Label>
                  <Select
                    defaultValue="MEDIUM"
                    onValueChange={(value) => setValue('riskLevel', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationOfIncident">Location</Label>
                  <Input
                    id="locationOfIncident"
                    placeholder="Where did this occur?"
                    {...register('locationOfIncident')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="immediateActions">Immediate Actions Taken</Label>
                <Textarea
                  id="immediateActions"
                  placeholder="Describe any immediate actions taken to address the concern"
                  rows={3}
                  {...register('immediateActions')}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" asChild>
              <Link href="/safeguarding">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Concern'
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
