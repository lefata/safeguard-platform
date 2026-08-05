import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Reuse the client across local hot reloads and warm Vercel invocations.
globalForPrisma.prisma = prisma;

export default prisma;
