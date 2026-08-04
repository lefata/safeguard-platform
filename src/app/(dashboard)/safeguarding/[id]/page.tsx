// src/app/(dashboard)/safeguarding/[id]/page.tsx
"use client";

import React from "react";
import { CaseTimeline } from "@/components/safeguarding/case-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConcernDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock function to fetch concern by ID - replace with real data fetching
async function getConcernById(id: string) {
  // fetch the concern including timeline entries
  return {
    id,
    title: "Example Concern",
    description: "Detailed description here",
    timeline: [
      {
        id: "1",
        title: "Initial report",
        date: "2024-06-01",
        riskLevel: "medium",
        action: "Reported by teacher",
        description: "Concern reported due to behavior",
        createdAt: new Date("2024-06-01T10:00:00Z"),
        actor: { id: "u1", name: "Ms. Smith" },
      },
      {
        id: "2",
        title: "Follow-up",
        date: "2024-06-05",
        riskLevel: "high",
        action: "Meeting with parents",
        description: "Discussed intervention plan",
        createdAt: new Date("2024-06-05T14:00:00Z"),
        actor: { id: "u2", name: "Mr. Johnson" },
      },
    ],
  };
}

export default async function ConcernDetailPage({ params }: ConcernDetailPageProps) {
  const { id } = await params;
  const concern = await getConcernById(id);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{concern.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{concern.description}</p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseTimeline entries={concern.timeline} />
        </CardContent>
      </Card>
    </div>
  );
}
