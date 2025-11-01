import { PrismaClient } from '@prisma/client';

// Try to create a Prisma client for tests, but be resilient if the
// environment isn't configured (so unit tests that mock prisma still run).
let prisma: PrismaClient | null = null;
let connected = false;
try {
  prisma = new PrismaClient({
    datasources: { db: { url: 'file:./test.db' } },
  });
} catch (err) {
  // If PrismaClient construction fails, continue — some tests mock the DB.
  // eslint-disable-next-line no-console
  console.warn('PrismaClient not constructed for tests:', (err as any)?.message || err)
}

// Setup before all tests
beforeAll(async () => {
  if (!prisma) return
  try {
    await prisma.$connect()
    connected = true

    // Try best-effort cleanup for commonly present tables
    await Promise.allSettled([
      prisma.user?.deleteMany?.() as any,
      prisma.equipment?.deleteMany?.() as any,
      prisma.reservation?.deleteMany?.() as any,
    ])
  } catch (err) {
    // Don't fail the test run if DB isn't available
    // eslint-disable-next-line no-console
    console.warn('Prisma test DB connect/cleanup skipped:', (err as any)?.message || err)
  }
})

// Cleanup after all tests
afterAll(async () => {
  if (!prisma || !connected) return
  try {
    await prisma.$disconnect()
  } catch (err) {
    // ignore
  }
})

// Setup before each test
beforeEach(async () => {
  // nothing by default
})

// Cleanup after each test
afterEach(async () => {
  jest.clearAllMocks();
});

// Keep console as-is but silence info logs in test output
(global as any).console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  error: console.error,
  warn: console.warn,
};
