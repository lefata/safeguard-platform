import { Users } from "lucide-react";

export default function StudentsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <Users className="h-16 w-16 mb-4" />
      <h1 className="text-2xl font-semibold">Students</h1>
      <p className="mt-2">Student management is coming soon.</p>
    </div>
  );
}
