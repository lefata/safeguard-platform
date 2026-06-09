// src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // ✅ Simple protection: require a secret key in the query string
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== "my-super-secret-seed-key") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // -------------------------------------------------------
    // 1. Create the demo tenant (school)
    // -------------------------------------------------------
    const tenant = await prisma.tenant.upsert({
      where: { slug: "demo-school" },
      update: {},
      create: {
        name: "Demo International School",
        slug: "demo-school",
        primaryColor: "#2563eb",
        secondaryColor: "#7c3aed",
        timezone: "Europe/London",
        locale: "en-GB",
        dataRetentionDays: 2555,
        subscriptionTier: "ENTERPRISE",
        safeguardingSettings: {
          autoEscalateCritical: true,
          notifyDSLOnHighRisk: true,
          requireReviewWithinDays: 7,
        },
      },
    });

    // -------------------------------------------------------
    // 2. Create users (password = password123)
    // -------------------------------------------------------
    const password = await bcrypt.hash("password123", 12);

    const users = [
      { email: "superadmin@safeguard.com", name: "Super Admin", role: "SUPER_ADMIN" as UserRole },
      { email: "admin@demoschool.com", name: "Sarah Johnson", role: "SCHOOL_ADMIN" as UserRole },
      { email: "dsl@demoschool.com", name: "Mark Thompson", role: "DSL" as UserRole },
      { email: "deputy-dsl@demoschool.com", name: "Emma Williams", role: "DEPUTY_DSL" as UserRole },
      { email: "counselor@demoschool.com", name: "Dr. Lisa Chen", role: "COUNSELOR" as UserRole },
      { email: "principal@demoschool.com", name: "Robert Davis", role: "PRINCIPAL" as UserRole },
      { email: "teacher@demoschool.com", name: "James Wilson", role: "TEACHER" as UserRole },
      { email: "teacher2@demoschool.com", name: "Maria Garcia", role: "TEACHER" as UserRole },
      { email: "nurse@demoschool.com", name: "Patricia Brown", role: "NURSE" as UserRole },
      { email: "support@demoschool.com", name: "Tom Anderson", role: "STUDENT_SUPPORT" as UserRole },
      { email: "auditor@demoschool.com", name: "Audit Viewer", role: "READ_ONLY_AUDITOR" as UserRole },
    ];

    for (const userData of users) {
      await prisma.user.upsert({
        where: { tenantId_email: { tenantId: tenant.id, email: userData.email } },
        update: {},
        create: {
          ...userData,
          tenantId: tenant.id,
          password,
          isActive: true,
        },
      });
    }

    // -------------------------------------------------------
    // 3. Create safeguarding categories
    // -------------------------------------------------------
    const categories = [
      { name: "Child Protection", riskLevel: "HIGH", description: "Physical, emotional, or sexual abuse concerns" },
      { name: "Neglect", riskLevel: "HIGH", description: "Failure to meet basic needs" },
      { name: "Emotional Wellbeing", riskLevel: "MEDIUM", description: "Mental health and emotional concerns" },
      { name: "Self Harm", riskLevel: "CRITICAL", description: "Self-injury or suicidal ideation" },
      { name: "Bullying", riskLevel: "MEDIUM", description: "Physical, verbal, or cyber bullying" },
      { name: "Online Safety", riskLevel: "MEDIUM", description: "Online risks and digital safety" },
      { name: "Attendance", riskLevel: "LOW", description: "Attendance-related concerns" },
      { name: "Medical Concern", riskLevel: "MEDIUM", description: "Physical health issues" },
      { name: "Substance Abuse", riskLevel: "HIGH", description: "Drug or alcohol related concerns" },
      { name: "Peer Conflict", riskLevel: "LOW", description: "Interpersonal conflicts between students" },
      { name: "Radicalization", riskLevel: "HIGH", description: "Extremism and radicalization concerns" },
      { name: "Other", riskLevel: "LOW", description: "Other safeguarding concerns" },
    ];

    for (const cat of categories) {
      await prisma.safeguardingCategory.upsert({
        where: { tenantId_name: { tenantId: tenant.id, name: cat.name } },
        update: {},
        create: { ...cat, tenantId: tenant.id },
      });
    }

    // -------------------------------------------------------
    // 4. Create sample students
    // -------------------------------------------------------
    const students = [
      { studentId: "STU-2024-001", firstName: "Alex", lastName: "Thompson", grade: "10", gender: "M", homeroom: "10A", house: "Red" },
      { studentId: "STU-2024-002", firstName: "Sophie", lastName: "Martinez", grade: "9", gender: "F", homeroom: "9B", house: "Blue" },
      { studentId: "STU-2024-003", firstName: "Liam", lastName: "Chen", grade: "11", gender: "M", homeroom: "11C", house: "Green" },
      { studentId: "STU-2024-004", firstName: "Emma", lastName: "Wilson", grade: "8", gender: "F", homeroom: "8A", house: "Yellow" },
      { studentId: "STU-2024-005", firstName: "Noah", lastName: "Patel", grade: "12", gender: "M", homeroom: "12B", house: "Red" },
    ];

    for (const student of students) {
      await prisma.student.upsert({
        where: { tenantId_studentId: { tenantId: tenant.id, studentId: student.studentId } },
        update: {},
        create: {
          ...student,
          tenantId: tenant.id,
          dateOfBirth: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000),
          parentContacts: [
            { name: `${student.lastName} Parent 1`, relation: "Mother", email: "parent1@example.com", phone: "+44 7700 900000" },
            { name: `${student.lastName} Parent 2`, relation: "Father", email: "parent2@example.com", phone: "+44 7700 900001" },
          ],
        },
      });
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
