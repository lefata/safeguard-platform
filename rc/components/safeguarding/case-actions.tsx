// src/components/safeguarding/case-actions.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Concern {
  id: string;
  status: string;
}

export function CaseActions({
  concern,
  userRole,
}: {
  concern: Concern;
  userRole: string;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/safeguarding/${concern.id}`}>View Details</Link>
      </Button>
      {userRole !== "TEACHER" && (
        <Button size="sm">Update Status</Button>
      )}
    </div>
  );
}
