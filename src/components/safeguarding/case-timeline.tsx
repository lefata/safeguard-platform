// src/components/safeguarding/case-timeline.tsx
import React from "react";

interface TimelineEntry {
  id: string;
  action: string;
  description?: string | null;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
  };
}

export function CaseTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline entries yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="text-sm">
          <span className="font-medium">{entry.actor.name || "Unknown"}</span>{" "}
          <span className="text-muted-foreground">{entry.action}</span>
          {entry.description && (
            <p className="text-xs text-muted-foreground">{entry.description}</p>
          )}
          <p className="text-xs text-gray-400">
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
