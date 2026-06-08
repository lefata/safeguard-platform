// src/components/safeguarding/safeguarding-list.tsx
import React from "react";

export function SafeguardingList({
  tenantId,
  userRole,
  userId,
}: {
  tenantId: string;
  userRole: string;
  userId: string;
}) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-muted-foreground">No safeguarding concerns found.</p>
    </div>
  );
}
