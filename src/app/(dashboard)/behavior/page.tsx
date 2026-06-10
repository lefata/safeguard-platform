import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBehaviorIncidents } from '@/server-actions/behavior';
import { formatDateShort } from '@/lib/utils';
import { Plus, AlertTriangle, ThumbsUp } from 'lucide-react';

export default async function BehaviorPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const incidents = await getBehaviorIncidents();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Behavior</h1>
          <p className="text-muted-foreground">Track positive and negative student behavior.</p>
        </div>
        <Button asChild>
          <Link href="/behavior/new">
            <Plus className="mr-2 h-4 w-4" /> New Incident
          </Link>
        </Button>
      </div>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle>All Incidents</CardTitle>
          <CardDescription>{incidents.length} record(s) found</CardDescription>
        </CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No behavior incidents recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {incident.category.type === 'POSITIVE' ? (
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.student.firstName} {incident.student.lastName} · Grade {incident.student.grade}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {incident.category.name} · {formatDateShort(incident.dateOfIncident)} · Recorded by {incident.recorder.name || 'unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={incident.category.type === 'POSITIVE' ? 'success' : 'destructive'}>
                    {incident.category.type}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
