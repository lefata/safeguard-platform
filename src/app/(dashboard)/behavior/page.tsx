import { AlertTriangle } from "lucide-react";

export default function BehaviorPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <AlertTriangle className="h-16 w-16 mb-4" />
      <h1 className="text-2xl font-semibold">Behavior</h1>
      <p className="mt-2">Behavior tracking is coming soon.</p>
    </div>
  );
}
