import request from 'supertest'
import express from 'express'

// Mock the prisma client used by the routes
const mockPrisma = {
  check: {
    count: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}

// Replace the actual prisma import inside the route module with our mock
jest.mock('../../src/database', () => ({ prisma: mockPrisma }))

// Now import the router after mocking
const checksRouter = require('../../src/routes/checks').default

// Create an express app and mount the router with a fake auth middleware
const app = express()
app.use(express.json())
app.use((req: any, res, next) => {
  // fake authentication middleware: attach companyId
  req.companyId = 1
  next()
})
app.use('/api/checks', checksRouter)

describe('Checks routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET /api/checks returns list and total', async () => {
    mockPrisma.check.count.mockResolvedValue(2)
    mockPrisma.check.findMany.mockResolvedValue([
      { id: 1, checkNumber: 'CHK-1', amount: 100 },
      { id: 2, checkNumber: 'CHK-2', amount: 200 },
    ])

    const res = await request(app).get('/api/checks')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.total).toBe(2)
    expect(Array.isArray(res.body.data)).toBe(true)
    // Ensure company scoping was applied to the prisma calls
    expect(mockPrisma.check.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ companyId: 1 }) }))
    expect(mockPrisma.check.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ companyId: 1 }) }))
  })

  test('POST /api/checks returns 400 for invalid payload', async () => {
    const res = await request(app).post('/api/checks').send({ bank: 'Ziraat' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.errors).toBeDefined()
  })

  test('POST /api/checks creates a check and returns 201', async () => {
    const payload = {
      checkNumber: 'CHK-100',
      bank: 'Ziraat',
      amount: 1500,
      issueDate: '2025-10-01',
      dueDate: '2025-11-01',
    }

    mockPrisma.check.create.mockResolvedValue({ id: 123, ...payload })

    const res = await request(app).post('/api/checks').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({ id: 123, checkNumber: 'CHK-100' })
    expect(mockPrisma.check.create).toHaveBeenCalled()
    // Ensure the created record includes the companyId from the auth middleware
    expect(mockPrisma.check.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ companyId: 1, checkNumber: 'CHK-100' }) }))
  })

  test('GET /api/checks/:id returns 404 when not found and 200 when found', async () => {
    mockPrisma.check.findFirst.mockResolvedValueOnce(null)
    let res = await request(app).get('/api/checks/999')
    expect(res.status).toBe(404)

    mockPrisma.check.findFirst.mockResolvedValueOnce({ id: 5, checkNumber: 'CHK-5', companyId: 1 })
    res = await request(app).get('/api/checks/5')
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({ id: 5 })
    expect(mockPrisma.check.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 5, companyId: 1 } }))
  })

  test('PUT /api/checks/:id updates when exists, deletes when requested', async () => {
    // Update happy path
    mockPrisma.check.findFirst.mockResolvedValueOnce({ id: 10, companyId: 1 })
    mockPrisma.check.update.mockResolvedValueOnce({ id: 10, checkNumber: 'CHK-10', amount: 300 })

    let res = await request(app).put('/api/checks/10').send({ amount: 300 })
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockPrisma.check.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 10, companyId: 1 } }))
    expect(mockPrisma.check.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 10 } , data: expect.any(Object)}))

    // Delete happy path
    mockPrisma.check.findFirst.mockResolvedValueOnce({ id: 11, companyId: 1 })
    mockPrisma.check.delete.mockResolvedValueOnce({})
    res = await request(app).delete('/api/checks/11')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(mockPrisma.check.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 11 } }))
  })
})
