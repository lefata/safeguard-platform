'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

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

// Build parentContacts from flat columns (parent1Name, parent1Email, …)
function buildParentContacts(values: Record<string, string>): any[] {
  const contacts: any[] = [];
  for (let i = 1; i <= 2; i++) {
    const name = values[`parent${i}Name`] || '';
    const email = values[`parent${i}Email`] || '';
    const phone = values[`parent${i}Phone`] || '';
    const relation = values[`parent${i}Relation`] || '';
    if (name || email || phone) {
      contacts.push({
        name: name || null,
        email: email || null,
        phone: phone || null,
        relation: relation || null,
      });
    }
  }
  return contacts;
}

export async function importStudentsFromCSV(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');
  const role = (session.user as any).role;
  if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN') throw new Error('Unauthorized');

  const file = formData.get('csv') as string;
  if (!file) throw new Error('No CSV data provided');

  const rows = file.split('\n').filter(row => row.trim() !== '');
  if (rows.length < 2) throw new Error('CSV must contain a header row and at least one data row.');

  const headerLine = rows[0];
  const rawHeaders = parseCSVLine(headerLine).map(h => h.trim());

  // Required columns (case-insensitive check)
  const requiredFields = ['studentId', 'firstName', 'lastName', 'dateOfBirth', 'grade'];
  const missing = requiredFields.filter(field =>
    !rawHeaders.some(h => h.toLowerCase() === field.toLowerCase())
  );
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }

  const tenantId = (session.user as any).tenantId;
  let inserted = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    try {
      const valuesArr = parseCSVLine(rows[i]);
      const rowData: Record<string, string> = {};
      rawHeaders.forEach((header, idx) => {
        let val = valuesArr[idx] || '';
        // Remove surrounding quotes if present
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        rowData[header] = val;
      });

      // Extract using normalized keys
      const getVal = (key: string) => {
        const found = rawHeaders.find(h => h.toLowerCase() === key.toLowerCase());
        return found ? rowData[found] : '';
      };

      const studentId = getVal('studentId');
      const firstName = getVal('firstName');
      const lastName = getVal('lastName');
      const dateOfBirth = getVal('dateOfBirth');
      const grade = getVal('grade');
      const homeroom = getVal('homeroom');
      const house = getVal('house');
      const gender = getVal('gender');

      // Build parent contacts from flat fields (if any)
      const parentContacts = buildParentContacts(rowData);

      await prisma.student.upsert({
        where: {
          tenantId_studentId: {
            tenantId,
            studentId,
          },
        },
        update: {
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          grade,
          homeroom: homeroom || null,
          house: house || null,
          gender: gender || null,
          parentContacts,
        },
        create: {
          tenantId,
          studentId,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          grade,
          homeroom: homeroom || null,
          house: house || null,
          gender: gender || null,
          parentContacts,
        },
      });
      inserted++;
    } catch (err: any) {
      errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  return { inserted, errors };
}

// Keep the existing getStudents function (if you have it)
export async function getStudents() {
  const session = await auth();
  if (!session?.user) throw new Error('Not authenticated');

  return prisma.student.findMany({
    where: { tenantId: (session.user as any).tenantId, isActive: true },
    orderBy: { lastName: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      grade: true,
    },
  });
}
