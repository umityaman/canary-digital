import { Router, Response, Request } from 'express'
import { authenticateToken } from '../middleware/auth'
import { prisma } from '../database'
import { createPromissorySchema, updatePromissorySchema } from '../validators/promissory.validator'

type AuthReq = Request & { companyId?: number; userId?: number }

const router = Router()

// GET /api/promissory-notes - list
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
        { noteNumber: { contains: search, mode: 'insensitive' } },
        { drawer: { contains: search, mode: 'insensitive' } },
        { aval: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [total, notes] = await Promise.all([
      prisma.promissoryNote.count({ where }),
      prisma.promissoryNote.findMany({ where, orderBy: { dueDate: 'asc' }, skip, take }),
    ])

    res.json({ success: true, data: notes, total })
  } catch (error) {
    console.error('Promissory list error:', error)
    res.status(500).json({ error: 'Failed to list promissory notes' })
  }
})

// GET /api/promissory-notes/:id
router.get('/:id', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    const id = Number(req.params.id)
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    const note = await prisma.promissoryNote.findFirst({ where: { id, companyId } })
    if (!note) return res.status(404).json({ error: 'Promissory note not found' })
    res.json({ success: true, data: note })
  } catch (error) {
    console.error('Promissory get error:', error)
    res.status(500).json({ error: 'Failed to get promissory note' })
  }
})

// POST /api/promissory-notes
router.post('/', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })
    const parsed = createPromissorySchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ success: false, errors: parsed.error.format() })

    const payload = parsed.data
    const created = await prisma.promissoryNote.create({
      data: {
        companyId,
        noteNumber: payload.noteNumber,
        type: payload.type,
        drawer: payload.drawer,
        amount: Number(payload.amount),
        issueDate: new Date(payload.issueDate),
        dueDate: new Date(payload.dueDate),
        status: payload.status,
        aval: payload.aval,
        customerId: payload.customerId,
        notes: payload.notes,
      },
    })

    res.status(201).json({ success: true, data: created })
  } catch (error) {
    console.error('Promissory create error:', error)
    res.status(500).json({ error: 'Failed to create promissory note' })
  }
})

// PUT /api/promissory-notes/:id
router.put('/:id', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    const id = Number(req.params.id)
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    const existing = await prisma.promissoryNote.findFirst({ where: { id, companyId } })
    if (!existing) return res.status(404).json({ error: 'Promissory note not found' })

  const parsed = updatePromissorySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, errors: parsed.error.format() })

  const updatePayload: any = parsed.data
  if (updatePayload.issueDate) updatePayload.issueDate = new Date(updatePayload.issueDate)
  if (updatePayload.dueDate) updatePayload.dueDate = new Date(updatePayload.dueDate)
  if (updatePayload.amount) updatePayload.amount = Number(updatePayload.amount)

  const updated = await prisma.promissoryNote.update({ where: { id }, data: updatePayload })
  res.json({ success: true, data: updated })
  } catch (error) {
    console.error('Promissory update error:', error)
    res.status(500).json({ error: 'Failed to update promissory note' })
  }
})

// DELETE /api/promissory-notes/:id
router.delete('/:id', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    const id = Number(req.params.id)
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })

    const existing = await prisma.promissoryNote.findFirst({ where: { id, companyId } })
    if (!existing) return res.status(404).json({ error: 'Promissory note not found' })

    await prisma.promissoryNote.delete({ where: { id } })
    res.json({ success: true })
  } catch (error) {
    console.error('Promissory delete error:', error)
    res.status(500).json({ error: 'Failed to delete promissory note' })
  }
})

export default router
