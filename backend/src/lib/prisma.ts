import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client as a singleton
export const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
