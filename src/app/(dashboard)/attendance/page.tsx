import { Clock } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <Clock className="h-16 w-16 mb-4" />
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <p className="mt-2">Attendance tracking is coming soon.</p>
    </div>
  );
}
