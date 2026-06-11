"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { RiskBadge } from '@/components/ui/RiskBadge';
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Student Name",
  },
  {
    accessorKey: "riskLevel",
    header: "Risk Level",
    cell: ({ row }) => (
      <RiskBadge level={row.getValue("riskLevel")} />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusIndicator 
        level={row.getValue("status")} 
        size="sm"
      />
    ),
  },
]

type Student = {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  grade: string;
  homeroom: string | null;
  house: string | null;
  enrollmentStatus: string;
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "studentId",
    header: "ID",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "grade",
    header: "Grade",
  },
  {
    accessorKey: "homeroom",
    header: "Homeroom",
    cell: ({ row }) => row.getValue("homeroom") || "—",
  },
  {
    accessorKey: "house",
    header: "House",
    cell: ({ row }) => row.getValue("house") || "—",
  },
  {
    accessorKey: "enrollmentStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("enrollmentStatus") === "ENROLLED" ? "success" : "warning"}>
        {row.getValue("enrollmentStatus")}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/students/${row.original.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];
