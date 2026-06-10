// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-school' },
    update: {},
    create: {
      name: 'Demo International School',
      slug: 'demo-school',
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      timezone: 'Europe/London',
      locale: 'en-GB',
      dataRetentionDays: 2555,
      subscriptionTier: 'ENTERPRISE',
      safeguardingSettings: {
        autoEscalateCritical: true,
        notifyDSLOnHighRisk: true,
        requireReviewWithinDays: 7,
      },
    },
  })

  console.log('✅ Created tenant:', tenant.name)

  // Create users
  const password = await bcrypt.hash('password123', 12)

  const users = [
  { email: 'superadmin@safeguard.com', name: 'Super Admin', role: 'SUPER_ADMIN' },
  { email: 'admin@demoschool.com', name: 'Sarah Johnson', role: 'SCHOOL_ADMIN' },
  { email: 'dsl@demoschool.com', name: 'Mark Thompson', role: 'DSL' },
  { email: 'deputy-dsl@demoschool.com', name: 'Emma Williams', role: 'DEPUTY_DSL' },
  { email: 'counselor@demoschool.com', name: 'Dr. Lisa Chen', role: 'COUNSELOR' },
  { email: 'principal@demoschool.com', name: 'Robert Davis', role: 'PRINCIPAL' },
  { email: 'teacher@demoschool.com', name: 'James Wilson', role: 'TEACHER' },
  { email: 'teacher2@demoschool.com', name: 'Maria Garcia', role: 'TEACHER' },
  { email: 'nurse@demoschool.com', name: 'Patricia Brown', role: 'NURSE' },
  { email: 'support@demoschool.com', name: 'Tom Anderson', role: 'STUDENT_SUPPORT' },
  { email: 'auditor@demoschool.com', name: 'Audit Viewer', role: 'READ_ONLY_AUDITOR' },
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
    })
  }

  console.log('✅ Created users')

  // Create safeguarding categories
  const categories = [
    { name: 'Child Protection', riskLevel: 'HIGH', description: 'Physical, emotional, or sexual abuse concerns' },
    { name: 'Neglect', riskLevel: 'HIGH', description: 'Failure to meet basic needs' },
    { name: 'Emotional Wellbeing', riskLevel: 'MEDIUM', description: 'Mental health and emotional concerns' },
    { name: 'Self Harm', riskLevel: 'CRITICAL', description: 'Self-injury or suicidal ideation' },
    { name: 'Bullying', riskLevel: 'MEDIUM', description: 'Physical, verbal, or cyber bullying' },
    { name: 'Online Safety', riskLevel: 'MEDIUM', description: 'Online risks and digital safety' },
    { name: 'Attendance', riskLevel: 'LOW', description: 'Attendance-related concerns' },
    { name: 'Medical Concern', riskLevel: 'MEDIUM', description: 'Physical health issues' },
    { name: 'Substance Abuse', riskLevel: 'HIGH', description: 'Drug or alcohol related concerns' },
    { name: 'Peer Conflict', riskLevel: 'LOW', description: 'Interpersonal conflicts between students' },
    { name: 'Radicalization', riskLevel: 'HIGH', description: 'Extremism and radicalization concerns' },
    { name: 'Other', riskLevel: 'LOW', description: 'Other safeguarding concerns' },
  ]

  for (const cat of categories) {
    await prisma.safeguardingCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: cat.name } },
      update: {},
      create: { ...cat, tenantId: tenant.id },
    })
  }

  console.log('✅ Created safeguarding categories')

  // Create behavior categories
  const behaviorCategories = [
    { name: 'Positive Contribution', type: 'POSITIVE', severity: 1 },
    { name: 'Outstanding Effort', type: 'POSITIVE', severity: 1 },
    { name: 'Helping Others', type: 'POSITIVE', severity: 1 },
    { name: 'Disruption', type: 'NEGATIVE', severity: 2 },
    { name: 'Defiance', type: 'NEGATIVE', severity: 3 },
    { name: 'Verbal Aggression', type: 'NEGATIVE', severity: 4 },
    { name: 'Physical Aggression', type: 'NEGATIVE', severity: 5 },
    { name: 'Bullying', type: 'NEGATIVE', severity: 5 },
  ]

  for (const bCat of behaviorCategories) {
    await prisma.behaviorCategory.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: bCat.name } },
      update: {},
      create: { ...bCat, tenantId: tenant.id },
    })
  }

  console.log('✅ Created behavior categories')

  // Create sample students
  const students = [
    { studentId: 'STU-2024-001', firstName: 'Alex', lastName: 'Thompson', grade: '10', gender: 'M', homeroom: '10A', house: 'Red' },
    { studentId: 'STU-2024-002', firstName: 'Sophie', lastName: 'Martinez', grade: '9', gender: 'F', homeroom: '9B', house: 'Blue' },
    { studentId: 'STU-2024-003', firstName: 'Liam', lastName: 'Chen', grade: '11', gender: 'M', homeroom: '11C', house: 'Green' },
    { studentId: 'STU-2024-004', firstName: 'Emma', lastName: 'Wilson', grade: '8', gender: 'F', homeroom: '8A', house: 'Yellow' },
    { studentId: 'STU-2024-005', firstName: 'Noah', lastName: 'Patel', grade: '12', gender: 'M', homeroom: '12B', house: 'Red' },
  ]

  for (const student of students) {
    await prisma.student.upsert({
      where: { tenantId_studentId: { tenantId: tenant.id, studentId: student.studentId } },
      update: {},
      create: {
        ...student,
        tenantId: tenant.id,
        dateOfBirth: new Date(Date.now() - 15 * 365 * 24 * 60 * 60 * 1000),
        parentContacts: [
          { name: `${student.lastName} Parent 1`, relation: 'Mother', email: 'parent1@example.com', phone: '+44 7700 900000' },
          { name: `${student.lastName} Parent 2`, relation: 'Father', email: 'parent2@example.com', phone: '+44 7700 900001' },
        ],
      },
    })
  }

  console.log('✅ Created sample students')

  // Create workflow rules
  await prisma.workflowRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Critical Risk Auto-Escalate',
      description: 'Automatically notify DSL and escalate critical risk concerns',
      triggerType: 'RISK_LEVEL',
      triggerValue: 'CRITICAL',
      actions: ['NOTIFY_DSL', 'SEND_EMAIL', 'CREATE_URGENT_TASK'],
      isActive: true,
      priority: 10,
    },
  })

  await prisma.workflowRule.create({
    data: {
      tenantId: tenant.id,
      name: 'Self-Harm Detection',
      description: 'Auto-escalate concerns containing self-harm indicators',
      triggerType: 'KEYWORD',
      triggerValue: 'self-harm,suicide,cutting',
      actions: ['NOTIFY_DSL', 'ESCALATE'],
      isActive: true,
      priority: 10,
    },
  })

  console.log('✅ Created workflow rules')
  console.log('🎉 Seeding complete!')
  console.log('\n📧 Demo Login Credentials:')
  console.log('   DSL: dsl@demoschool.com / password123')
  console.log('   Teacher: teacher@demoschool.com / password123')
  console.log('   Admin: admin@demoschool.com / password123')
  console.log('   Super Admin: superadmin@safeguard.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
