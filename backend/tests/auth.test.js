"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Authentication API', () => {
    let authToken;
    let userId;
    const testUser = {
        email: 'test@example.com',
        password: 'Test123456',
        name: 'Test User',
        phone: '+905551234567',
    };
    beforeAll(async () => {
        // Clean test users
        await prisma.user.deleteMany({
            where: { email: testUser.email },
        });
    });
    afterAll(async () => {
        // Clean up test data
        await prisma.user.deleteMany({
            where: { email: testUser.email },
        });
        await prisma.$disconnect();
    });
    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser)
                .expect(201);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user.name).toBe(testUser.name);
            userId = response.body.user.id;
            authToken = response.body.token;
        });
        it('should not register duplicate email', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(testUser)
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should validate email format', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                ...testUser,
                email: 'invalid-email',
            })
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
        it('should validate password strength', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                ...testUser,
                email: 'newuser@example.com',
                password: '123', // Too short
            })
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: testUser.password,
            })
                .expect(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user.email).toBe(testUser.email);
        });
        it('should not login with invalid password', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: 'wrongpassword',
            })
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
        it('should not login with non-existent email', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'nonexistent@example.com',
                password: 'password',
            })
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('message');
        });
        it('should require authentication', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/logout')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('Rate Limiting', () => {
        it('should enforce rate limiting on login', async () => {
            // Make 6 requests (limit is 5 per 15 minutes)
            const requests = Array(6).fill(null).map(() => (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'wrongpassword',
            }));
            const responses = await Promise.all(requests);
            const lastResponse = responses[responses.length - 1];
            // Last request should be rate limited
            expect(lastResponse.status).toBe(429);
        }, 15000);
    });
});
