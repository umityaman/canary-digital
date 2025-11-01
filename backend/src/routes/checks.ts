import { Router, Response, Request } from 'express'
import { authenticateToken } from '../middleware/auth'
import { prisma } from '../database'
import { createCheckSchema, updateCheckSchema } from '../validators/checks.validator'

type AuthReq = Request & { companyId?: number; userId?: number }

const router = Router()

// GET /api/checks - list checks with optional filters (status, search, pagination)
router.get('/', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    const { status, search, page = '1', limit = '50' } = req.query as any
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const take = Math.min(200, parseInt(limit, 10) || 50)
    const skip = (pageNum - 1) * take

    const where: any = { companyId }

    if (status) where.status = status

    if (search) {
      where.OR = [
        { checkNumber: { contains: search, mode: 'insensitive' } },
        { drawer: { contains: search, mode: 'insensitive' } },
        { bank: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, checks] = await Promise.all([
      prisma.check.count({ where }),
      prisma.check.findMany({ where, orderBy: { dueDate: 'asc' }, skip, take }),
    ])

    res.json({ success: true, data: checks, total })
  } catch (error) {
    console.error('Checks list error:', error)
    res.status(500).json({ error: 'Failed to list checks' })
  }
})

// GET /api/checks/:id
router.get('/:id', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    const id = Number(req.params.id)
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    const check = await prisma.check.findFirst({ where: { id, companyId } })
    if (!check) return res.status(404).json({ error: 'Check not found' })
    res.json({ success: true, data: check })
  } catch (error) {
    console.error('Checks get error:', error)
    res.status(500).json({ error: 'Failed to get check' })
  }
})

// POST /api/checks - create
router.post('/', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    // Validate input
    const parsed = createCheckSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.format() })
    }

    const payload = parsed.data
    const created = await prisma.check.create({
      data: {
        companyId,
        checkNumber: payload.checkNumber,
        type: payload.type,
        drawer: payload.drawer,
        bank: payload.bank,
        branch: payload.branch,
        accountNumber: payload.accountNumber,
        amount: Number(payload.amount),
        issueDate: new Date(payload.issueDate),
        dueDate: new Date(payload.dueDate),
        status: payload.status,
        customerId: payload.customerId,
        orderId: payload.orderId,
        notes: payload.notes,
      },
    })

    res.status(201).json({ success: true, data: created })
  } catch (error) {
    console.error('Checks create error:', error)
    res.status(500).json({ error: 'Failed to create check' })
  }
})

// PUT /api/checks/:id - update
router.put('/:id', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    const id = Number(req.params.id)
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    const existing = await prisma.check.findFirst({ where: { id, companyId } })
    if (!existing) return res.status(404).json({ error: 'Check not found' })

  const parsed = updateCheckSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, errors: parsed.error.format() })

  const updatePayload = parsed.data
  if (updatePayload.issueDate) (updatePayload as any).issueDate = new Date((updatePayload as any).issueDate)
  if (updatePayload.dueDate) (updatePayload as any).dueDate = new Date((updatePayload as any).dueDate)
  if (updatePayload.amount) (updatePayload as any).amount = Number((updatePayload as any).amount)

  const updated = await prisma.check.update({ where: { id }, data: updatePayload as any })
  res.json({ success: true, data: updated })
  } catch (error) {
    console.error('Checks update error:', error)
    res.status(500).json({ error: 'Failed to update check' })
  }
})

// DELETE /api/checks/:id
router.delete('/:id', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    const id = Number(req.params.id)
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    const existing = await prisma.check.findFirst({ where: { id, companyId } })
    if (!existing) return res.status(404).json({ error: 'Check not found' })

    await prisma.check.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Checks delete error:', error)
    res.status(500).json({ error: 'Failed to delete check' })
  }
})

export default router
