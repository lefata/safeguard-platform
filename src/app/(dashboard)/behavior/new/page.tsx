"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStudents } from "@/server-actions/students";
import { getBehaviorCategories } from "@/server-actions/behavior";
import { createBehaviorIncident } from "@/server-actions/behavior"; // we'll create this next
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const behaviorSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  categoryId: z.string().min(1, "Category is required"),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  location: z.string().optional(),
  actionTaken: z.string().optional(),
  disciplinaryAction: z.string().optional(),
});

type BehaviorFormData = z.infer<typeof behaviorSchema>;

export default function NewBehaviorIncidentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<{ id: string; firstName: string; lastName: string; grade: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BehaviorFormData>({
    resolver: zodResolver(behaviorSchema),
    defaultValues: {
      disciplinaryAction: "",
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [studentsData, categoriesData] = await Promise.all([
          getStudents(),
          getBehaviorCategories(),
        ]);
        setStudents(studentsData);
        setCategories(categoriesData);
      } catch (error) {
        toast.error("Failed to load form data");
      } finally {
        setLoadingStudents(false);
      }
    }
    loadData();
  }, []);

  const onSubmit = async (data: BehaviorFormData) => {
    setIsSubmitting(true);
    try {
      const incident = await createBehaviorIncident(data);
      toast.success("Behavior incident recorded successfully");
      router.push("/behavior");
    } catch (error: any) {
      toast.error(error.message || "Failed to record incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/behavior">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">New Behavior Incident</h1>
          <p className="text-muted-foreground">Record a positive or negative behavior observation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Incident Details</CardTitle>
            <CardDescription>All fields marked with * are required.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student *</Label>
                <Select
                  onValueChange={(value) => setValue("studentId", value)}
                  disabled={loadingStudents}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingStudents ? "Loading…" : "Select student"} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} - Gr {s.grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.studentId && <p className="text-sm text-red-500">{errors.studentId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select onValueChange={(value) => setValue("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.type === "POSITIVE" ? "👍" : "👎"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-sm text-red-500">{errors.categoryId.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="Brief title" {...register("title")} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Detailed account of the behavior"
                rows={4}
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Where did this occur?" {...register("location")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Input id="actionTaken" placeholder="Immediate action, if any" {...register("actionTaken")} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disciplinaryAction">Disciplinary Action</Label>
              <Input id="disciplinaryAction" placeholder="e.g., Warning, Detention, Restorative" {...register("disciplinaryAction")} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" asChild>
            <Link href="/behavior">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || loadingStudents}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              "Submit Incident"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
