// src/components/safeguarding/safeguarding-list.tsx
"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { AlertTriangle, Shield } from "lucide-react";

interface SafeguardingConcern {
  id: string;
  title: string;
  description?: string;
  riskLevel: string;
  student: {
    firstName: string;
    lastName: string;
    grade: string;
  };
  category: {
    name: string;
  };
  createdAt: string | Date;
  status: string;
}

// Update the interface at the top of the file
interface SafeguardingListProps {
  tenantId: string;
  userRole: string;
  userId: string;
  concerns: SafeguardingConcern[];
}

export function SafeguardingList({ concerns, tenantId, userRole, userId }: SafeguardingListProps) {
  if (!concerns || concerns.length === 0) {
    return (
      <Card className="shadow-school-card border-0">
        <CardContent className="py-12 text-center text-muted-foreground">
          No safeguarding concerns found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {concerns.map((concern) => (
        <Link key={concern.id} href={`/safeguarding/${concern.id}`} className="block">
          <Card className="shadow-school-card border-0 hover:shadow-school-hover transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {concern.riskLevel === "CRITICAL" ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : concern.riskLevel === "HIGH" ? (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Shield className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{concern.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {concern.student.firstName} {concern.student.lastName} • Grade {concern.student.grade}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {concern.category.name} • {new Date(concern.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    concern.riskLevel === "CRITICAL"
                      ? "critical"
                      : concern.riskLevel === "HIGH"
                      ? "high"
                      : concern.riskLevel === "MEDIUM"
                      ? "medium"
                      : "low"
                  }
                >
                  {concern.riskLevel}
                </Badge>
                <Badge variant="outline">{concern.status.replace(/_/g, " ")}</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
