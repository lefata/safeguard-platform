"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { importStudentsFromCSV } from '@/server-actions/students';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function ImportStudentsPage() {
  const [csv, setCsv] = useState('');
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  const handleImport = async () => {
    if (!csv.trim()) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('csv', csv);
    try {
      const result = await importStudentsFromCSV(formData);
      toast.success(`${result.inserted} student(s) imported!`);
      if (result.errors.length > 0) {
        toast.error(`Errors:\n${result.errors.join('\n')}`, { duration: 10000 });
      }
      router.push('/students');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Students (CSV)</h1>
        <p className="text-muted-foreground mt-1">
          Paste your CSV data below. The first row must contain column headers.
        </p>
      </div>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle>CSV Data</CardTitle>
          <CardDescription>
            Required columns: studentId, firstName, lastName, dateOfBirth, grade.<br />
            Optional: homeroom, house, gender, parentContacts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={`studentId,firstName,lastName,dateOfBirth,grade,homeroom,house,gender,parentContacts\n...`}
            rows={12}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <Button onClick={handleImport} disabled={importing}>
              <Upload className="mr-2 h-4 w-4" />
              {importing ? 'Importing…' : 'Import Students'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
