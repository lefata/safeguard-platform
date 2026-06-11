import React from "react";
import { StatusIndicator } from '@/components/ui/StatusIndicator';

interface TimelineEntry {
  id: string;
  title: string;
  date: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  action?: string;
  description?: string | null;
  createdAt?: Date;
  actor?: {
    id: string;
    name: string | null;
  };
}

interface CaseTimelineProps {
  entries: TimelineEntry[];
}

export function CaseTimeline({ entries }: CaseTimelineProps) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No timeline entries yet.</p>;
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-school-primary" />
            <div className="h-12 w-0.5 bg-school-border-light" />
          </div>
          <div className="pb-4">
            {entry.title && <p className="font-semibold text-school-text-primary">{entry.title}</p>}
            {entry.date && <p className="text-sm text-school-text-secondary mt-1">{entry.date}</p>}
            {entry.riskLevel && (
              <StatusIndicator level={entry.riskLevel} size="sm" className="mt-2" />
            )}
            {entry.action && (
              <p className="text-muted-foreground">{entry.action}</p>
            )}
            {entry.description && (
              <p className="text-xs text-muted-foreground">{entry.description}</p>
            )}
            {entry.createdAt && (
              <p className="text-xs text-gray-400">
                {new Date(entry.createdAt).toLocaleString()}
              </p>
            )}
            {entry.actor && (
              <p className="text-xs text-muted-foreground font-medium">
                {entry.actor.name || "Unknown"}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
