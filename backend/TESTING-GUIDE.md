# 🧪 Testing Guide - Backend API

## Overview

Comprehensive API testing with Jest and Supertest.

---

## Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests for CI
npm run test:ci

# Run specific test file
npm test -- auth.test.ts

# Run tests with coverage
npm test -- --coverage
```

---

## Test Structure

```
backend/
├── tests/
│   ├── setup.ts              # Global test setup
│   ├── auth.test.ts          # Authentication tests
│   ├── equipment.test.ts     # Equipment API tests
│   ├── reservation.test.ts   # Reservation tests
│   └── monitoring.test.ts    # Monitoring tests
└── jest.config.js            # Jest configuration
```

---

## Test Coverage

### Current Coverage
- **Statements**: > 70%
- **Branches**: > 60%
- **Functions**: > 70%
- **Lines**: > 70%

### Coverage Goals
- **Statements**: > 80%
- **Branches**: > 70%
- **Functions**: > 80%
- **Lines**: > 80%

---

## Writing Tests

### Basic Test Template
```typescript
import request from 'supertest';
import app from '../src/app';

describe('API Endpoint', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Register and login
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123456',
      });
    
    authToken = response.body.token;
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### Testing Authentication
```typescript
describe('POST /api/auth/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123456',
      })
      .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should reject invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });
});
```

### Testing CRUD Operations
```typescript
describe('Equipment CRUD', () => {
  let equipmentId: number;

  it('should create equipment', async () => {
    const response = await request(app)
      .post('/api/equipment')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Equipment',
        category: 'laptop',
        status: 'available',
      })
      .expect(201);

    equipmentId = response.body.id;
    expect(response.body.name).toBe('Test Equipment');
  });

  it('should get equipment by id', async () => {
    const response = await request(app)
      .get(`/api/equipment/${equipmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.id).toBe(equipmentId);
  });

  it('should update equipment', async () => {
    const response = await request(app)
      .put(`/api/equipment/${equipmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'maintenance',
      })
      .expect(200);

    expect(response.body.status).toBe('maintenance');
  });

  it('should delete equipment', async () => {
    await request(app)
      .delete(`/api/equipment/${equipmentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

### Testing Query Parameters
```typescript
it('should filter by status', async () => {
  const response = await request(app)
    .get('/api/equipment?status=available')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  response.body.forEach((item: any) => {
    expect(item.status).toBe('available');
  });
});

it('should search by name', async () => {
  const response = await request(app)
    .get('/api/equipment?search=MacBook')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  response.body.forEach((item: any) => {
    expect(item.name.toLowerCase()).toContain('macbook');
  });
});
```

### Testing Error Handling
```typescript
it('should return 404 for non-existent resource', async () => {
  const response = await request(app)
    .get('/api/equipment/999999')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(404);

  expect(response.body).toHaveProperty('error');
});

it('should validate required fields', async () => {
  const response = await request(app)
    .post('/api/equipment')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      // Missing required fields
    })
    .expect(400);

  expect(response.body).toHaveProperty('error');
});
```

### Testing Rate Limiting
```typescript
it('should enforce rate limiting', async () => {
  const requests = Array(10).fill(null).map(() =>
    request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
  );

  const responses = await Promise.all(requests);
  const rateLimited = responses.some(r => r.status === 429);

  expect(rateLimited).toBe(true);
}, 15000);
```

---

## Mocking

### Mock Prisma
```typescript
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});
```

### Mock External Services
```typescript
jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));
```

---

## Test Data

### Create Test Data
```typescript
const createTestUser = async () => {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: 'hashed_password',
      name: 'Test User',
    },
  });
};

const createTestEquipment = async () => {
  return await prisma.equipment.create({
    data: {
      name: 'Test Equipment',
      category: 'laptop',
      status: 'available',
    },
  });
};
```

### Clean Test Data
```typescript
afterEach(async () => {
  await prisma.equipment.deleteMany();
  await prisma.user.deleteMany();
});
```

---

## Continuous Integration

### GitHub Actions
```yaml
- name: Run tests
  run: npm test -- --ci --coverage --maxWorkers=2
  env:
    DATABASE_URL: file:./test.db
    JWT_SECRET: test-secret
```

### Test Coverage Reporting
```bash
# Generate coverage report
npm test -- --coverage

# View HTML report
open coverage/index.html
```

---

## Best Practices

### ✅ Do's
- Write descriptive test names
- Test both success and error cases
- Use beforeAll/afterAll for setup/cleanup
- Mock external dependencies
- Test edge cases
- Keep tests independent
- Use meaningful assertions

### ❌ Don'ts
- Don't test implementation details
- Don't share state between tests
- Don't skip cleanup
- Don't use real external services
- Don't hardcode values
- Don't test third-party code

---

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "should login with valid credentials"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--no-cache",
    "--watchAll=false"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Verbose Output
```bash
npm test -- --verbose
```

---

## Performance Testing

### Load Testing with Artillery
```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

### Example load-test.yml
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
    - post:
        url: "/api/auth/login"
        json:
          email: "test@example.com"
          password: "Test123456"
```

---

## Test Checklist

- [ ] All routes tested
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Input validation tested
- [ ] Error handling tested
- [ ] Rate limiting tested
- [ ] Database operations tested
- [ ] Edge cases tested
- [ ] Coverage > 80%

---

**Status**: ✅ Ready for Testing
**Coverage Target**: 80%+
**Last Updated**: October 13, 2025
