"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
// Mock Prisma Client for tests
exports.prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: 'file:./test.db',
        },
    },
});
// Setup before all tests
beforeAll(async () => {
    // Connect to test database
    await exports.prisma.$connect();
    // Clean database
    await exports.prisma.user.deleteMany();
    await exports.prisma.equipment.deleteMany();
    await exports.prisma.reservation.deleteMany();
});
// Cleanup after all tests
afterAll(async () => {
    // Disconnect from database
    await exports.prisma.$disconnect();
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
