// src/components/safeguarding/safeguarding-list.tsx
import { getSafeguardingConcerns } from '@/server-actions/safeguarding';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateShort } from '@/lib/utils';
import Link from 'next/link';
import { Shield, AlertTriangle } from 'lucide-react';

export async function SafeguardingList({
  tenantId,
  userRole,
  userId,
}: {
  tenantId: string;
  userRole: string;
  userId: string;
}) {
  // Fetch concerns (server action already filters by tenant)
  const concerns = await getSafeguardingConcerns();

  if (concerns.length === 0) {
    return (
      <Card className="shadow-school-card border-0">
        <CardContent className="py-12 text-center text-muted-foreground">
          No safeguarding concerns found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {concerns.map((concern) => (
        <Link
          key={concern.id}
          href={`/safeguarding/${concern.id}`}
          className="block"
        >
          <Card className="shadow-school-card border-0 hover:shadow-school-hover transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {concern.riskLevel === 'CRITICAL' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : concern.riskLevel === 'HIGH' ? (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <Shield className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{concern.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {concern.student.firstName} {concern.student.lastName} • Grade {concern.student.grade}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {concern.category.name} • {formatDateShort(concern.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={
                  concern.riskLevel === 'CRITICAL' ? 'critical' :
                  concern.riskLevel === 'HIGH' ? 'high' :
                  concern.riskLevel === 'MEDIUM' ? 'medium' : 'low'
                }>
                  {concern.riskLevel}
                </Badge>
                <Badge variant="outline">{concern.status.replace('_', ' ')}</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
