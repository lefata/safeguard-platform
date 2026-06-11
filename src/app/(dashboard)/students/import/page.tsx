"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { importStudentsFromCSV } from '@/server-actions/students';
import { toast } from 'sonner';
import { Upload, Download, FileText } from 'lucide-react';

const CSV_TEMPLATE =
  'studentId,firstName,lastName,dateOfBirth,grade,homeroom,house,gender,parent1Name,parent1Relation,parent1Email,parent1Phone,parent2Name,parent2Relation,parent2Email,parent2Phone\n' +
  'STU-2025-001,Jane,Smith,2010-05-15,9,9A,Red,F,Alice Smith,Mother,alice@example.com,+44 7700 900000,John Smith,Father,john@example.com,+44 7700 900001';

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

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Students (CSV)</h1>
        <p className="text-muted-foreground mt-1">
          Paste your CSV data below or download a template to get started.
        </p>
      </div>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> CSV Template
              </CardTitle>
              <CardDescription>
                Required columns: studentId, firstName, lastName, dateOfBirth, grade.<br />
                Optional: homeroom, house, gender, parentContacts (JSON array).
              </CardDescription>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-school-card border-0">
        <CardHeader>
          <CardTitle>Paste CSV Data</CardTitle>
          <CardDescription>
              Required columns: studentId, firstName, lastName, dateOfBirth, grade.<br />
              Optional: homeroom, house, gender.<br />
              Parent contacts: parent1Name, parent1Relation, parent1Email, parent1Phone, (and parent2…).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={CSV_TEMPLATE.replace(/"/g, '')}
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
