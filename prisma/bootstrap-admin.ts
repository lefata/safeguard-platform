import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const required = [
  'BOOTSTRAP_TENANT_NAME',
  'BOOTSTRAP_TENANT_SLUG',
  'BOOTSTRAP_ADMIN_EMAIL',
  'BOOTSTRAP_ADMIN_PASSWORD',
] as const;

async function main() {
  if (process.env.ALLOW_BOOTSTRAP_ADMIN !== 'true') {
    throw new Error('Set ALLOW_BOOTSTRAP_ADMIN=true to run this one-time command.');
  }

  for (const name of required) {
    if (!process.env[name]?.trim()) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
  }

  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD!;
  if (password.length < 12) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' },
    select: { id: true },
  });
  if (existingSuperAdmin) {
    throw new Error('A super administrator already exists. Refusing to create another.');
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: process.env.BOOTSTRAP_TENANT_SLUG! },
    update: {},
    create: {
      name: process.env.BOOTSTRAP_TENANT_NAME!,
      slug: process.env.BOOTSTRAP_TENANT_SLUG!,
      subscriptionTier: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
    },
  });

  const email = process.env.BOOTSTRAP_ADMIN_EMAIL!.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { tenantId_email: { tenantId: tenant.id, email } },
    select: { id: true },
  });
  if (existingUser) {
    throw new Error('That email already exists for this school. Refusing to overwrite it.');
  }

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email,
      name: process.env.BOOTSTRAP_ADMIN_NAME?.trim() || 'Platform Administrator',
      role: 'SUPER_ADMIN',
      password: await bcrypt.hash(password, 12),
      isActive: true,
    },
  });

  console.log(`Created the first super administrator for ${tenant.name}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
