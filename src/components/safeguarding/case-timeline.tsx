import React from "react";
import { StatusIndicator } from '@/components/ui/StatusIndicator';

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

export function CaseTimeline({ events }: { events?: any[] }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline entries yet.</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-school-primary" />
            <div className="h-12 w-0.5 bg-school-border-light" />
          </div>
          <div className="pb-4">
            <p className="font-semibold text-school-text-primary">{event.title}</p>
            <p className="text-sm text-school-text-secondary mt-1">{event.date}</p>
            <StatusIndicator level={event.riskLevel} size="sm" className="mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Optionally export the list version with different name if needed
export function CaseTimelineList({ entries }: { entries: TimelineEntry[] }) {
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
