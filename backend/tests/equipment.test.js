"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
describe('Equipment API', () => {
    let authToken;
    let equipmentId;
    const testUser = {
        email: 'equipment-test@example.com',
        password: 'Test123456',
        name: 'Equipment Test User',
    };
    const testEquipment = {
        name: 'MacBook Pro 16"',
        description: 'M2 Max, 32GB RAM',
        category: 'laptop',
        status: 'available',
        serialNumber: 'TEST123456',
        dailyRate: 500,
        weeklyRate: 3000,
        monthlyRate: 10000,
    };
    beforeAll(async () => {
        // Register and login test user
        const registerResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send(testUser);
        authToken = registerResponse.body.token;
    });
    afterAll(async () => {
        // Clean up test data
        await prisma.equipment.deleteMany({
            where: { serialNumber: testEquipment.serialNumber },
        });
        await prisma.user.deleteMany({
            where: { email: testUser.email },
        });
        await prisma.$disconnect();
    });
    describe('POST /api/equipment', () => {
        it('should create new equipment', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/equipment')
                .set('Authorization', `Bearer ${authToken}`)
                .send(testEquipment)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.name).toBe(testEquipment.name);
            expect(response.body.category).toBe(testEquipment.category);
            expect(response.body.status).toBe(testEquipment.status);
            equipmentId = response.body.id;
        });
        it('should require authentication', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/equipment')
                .send(testEquipment)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
        it('should validate required fields', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/equipment')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Test Equipment',
                // Missing required fields
            })
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('GET /api/equipment', () => {
        it('should get all equipment', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/equipment')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
        });
        it('should filter by status', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/equipment?status=available')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((item) => {
                expect(item.status).toBe('available');
            });
        });
        it('should filter by category', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/equipment?category=laptop')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((item) => {
                expect(item.category).toBe('laptop');
            });
        });
        it('should search by name', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/equipment?search=MacBook')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((item) => {
                expect(item.name.toLowerCase()).toContain('macbook');
            });
        });
    });
    describe('GET /api/equipment/:id', () => {
        it('should get equipment by id', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/equipment/${equipmentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.id).toBe(equipmentId);
            expect(response.body.name).toBe(testEquipment.name);
        });
        it('should return 404 for non-existent equipment', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/equipment/999999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('PUT /api/equipment/:id', () => {
        it('should update equipment', async () => {
            const updatedData = {
                status: 'maintenance',
                notes: 'Under maintenance',
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/equipment/${equipmentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updatedData)
                .expect(200);
            expect(response.body.status).toBe(updatedData.status);
            expect(response.body.notes).toBe(updatedData.notes);
        });
        it('should not update non-existent equipment', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/equipment/999999')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ status: 'maintenance' })
                .expect(404);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('DELETE /api/equipment/:id', () => {
        it('should soft delete equipment', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/equipment/${equipmentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('message');
            // Verify it's soft deleted (status changed to retired)
            const equipment = await prisma.equipment.findUnique({
                where: { id: equipmentId },
            });
            expect(equipment?.status).toBe('retired');
        });
    });
});
