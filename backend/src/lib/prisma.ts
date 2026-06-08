import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { emit: 'event', level: 'error' },
      { emit: 'stdout', level: 'warn' },
    ],
  });

// Suppress noisy "connection closed" pool recycling messages
(prisma as any).$on('error', (e: any) => {
  if (e?.message?.includes('kind: Closed') || e?.message?.includes('kind: SocketTimeout')) return;
  console.error('Prisma error:', e?.message ?? e);
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
