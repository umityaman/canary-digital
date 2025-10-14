import { PrismaClient } from '@prisma/client';

// Mock Prisma Client for tests
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db',
    },
  },
});

// Setup before all tests
beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
  
  // Clean database
  await prisma.user.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.reservation.deleteMany();
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database
  await prisma.$disconnect();
});

// Setup before each test
beforeEach(async () => {
  // Clean specific tables if needed
});

// Cleanup after each test
afterEach(async () => {
  // Reset mocks
  jest.clearAllMocks();
});

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests
  log: jest.fn(),
  // Keep error and warn
  error: console.error,
  warn: console.warn,
};
