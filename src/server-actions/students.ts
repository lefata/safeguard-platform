'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface StudentRow {
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  homeroom?: string;
  house?: string;
  gender?: string;
  parentContacts?: string; // JSON string
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function importStudentsFromCSV(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  if ((session.user as any).role !== 'SCHOOL_ADMIN' && (session.user as any).role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized');
  }

  const file = formData.get('csv') as string;
  if (!file) throw new Error('No CSV data provided');

  const rows = file.split('\n').filter(row => row.trim() !== '');
  const headers = parseCSVLine(rows[0]).map(h => h.trim());

  const requiredHeaders = ['studentId', 'firstName', 'lastName', 'dateOfBirth', 'grade'];
  const missing = requiredHeaders.filter(h => !headers.includes(h));
  if (missing.length > 0) throw new Error(`Missing required columns: ${missing.join(', ')}`);

  const students: StudentRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const values = parseCSVLine(rows[i]);
    const rowData: any = {};
    headers.forEach((header, index) => {
      rowData[header] = values[index]?.replace(/^"|"$/g, '') || '';
    });
    students.push(rowData as StudentRow);
  }

  const tenantId = (session.user as any).tenantId;
  let inserted = 0;
  const errors: string[] = [];

  for (const student of students) {
    try {
      let parentContacts = [];
      if (student.parentContacts) {
        try {
          parentContacts = JSON.parse(student.parentContacts);
        } catch (e) {
          errors.push(`Row ${student.studentId}: Invalid parentContacts JSON`);
          continue;
        }
      }

      await prisma.student.upsert({
        where: {
          tenantId_studentId: {
            tenantId,
            studentId: student.studentId,
          },
        },
        update: {
          firstName: student.firstName,
          lastName: student.lastName,
          dateOfBirth: new Date(student.dateOfBirth),
          grade: student.grade,
          homeroom: student.homeroom || null,
          house: student.house || null,
          gender: student.gender || null,
          parentContacts,
        },
        create: {
          tenantId,
          studentId: student.studentId,
          firstName: student.firstName,
          lastName: student.lastName,
          dateOfBirth: new Date(student.dateOfBirth),
          grade: student.grade,
          homeroom: student.homeroom || null,
          house: student.house || null,
          gender: student.gender || null,
          parentContacts,
        },
      });
      inserted++;
    } catch (err: any) {
      errors.push(`Row ${student.studentId}: ${err.message}`);
    }
  }

  return { inserted, errors };
}
