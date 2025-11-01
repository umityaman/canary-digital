import { Router, Response, Request } from 'express'
import { authenticateToken } from '../middleware/auth'
import { prisma } from '../database'

type AuthReq = Request & { companyId?: number; userId?: number }

const router = Router()

function bucketDays(days: number) {
  if (days <= 0) return 'current'
  if (days <= 30) return '1-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  return '90+'
}

// Helper to compute aging for a list of items with amount and dueDate
function computeAging(items: Array<{ amount: number; dueDate: Date }>, asOf: Date) {
  const buckets: any = { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  let total = 0
  items.forEach(it => {
    const due = new Date(it.dueDate)
    const diff = Math.floor((asOf.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
    const bucket = bucketDays(diff)
    buckets[bucket] += Number(it.amount || 0)
    total += Number(it.amount || 0)
  })
  return { total, buckets }
}

// GET /api/aging/checks
router.get('/checks', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })
    const asOfDate = req.query?.asOfDate ? new Date(String(req.query.asOfDate)) : new Date()

    const rows = await prisma.check.findMany({ where: { companyId } , select: { amount: true, dueDate: true } })
    const result = computeAging(rows as any, asOfDate)
    res.json({ success: true, asOf: asOfDate.toISOString(), ...result })
  } catch (error) {
    console.error('Aging checks error:', error)
    res.status(500).json({ error: 'Failed to compute checks aging' })
  }
})

// GET /api/aging/promissory-notes
router.get('/promissory-notes', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })
    const asOfDate = req.query?.asOfDate ? new Date(String(req.query.asOfDate)) : new Date()

    const rows = await prisma.promissoryNote.findMany({ where: { companyId }, select: { amount: true, dueDate: true } })
    const result = computeAging(rows as any, asOfDate)
    res.json({ success: true, asOf: asOfDate.toISOString(), ...result })
  } catch (error) {
    console.error('Aging promissory error:', error)
    res.status(500).json({ error: 'Failed to compute promissory notes aging' })
  }
})

// GET /api/aging/combined
router.get('/combined', authenticateToken, async (req: AuthReq, res: Response) => {
  try {
    const companyId = req.companyId
    if (!companyId) return res.status(400).json({ error: 'Company ID not found' })
    const asOfDate = req.query?.asOfDate ? new Date(String(req.query.asOfDate)) : new Date()

    const [checks, notes] = await Promise.all([
      prisma.check.findMany({ where: { companyId }, select: { amount: true, dueDate: true } }),
      prisma.promissoryNote.findMany({ where: { companyId }, select: { amount: true, dueDate: true } }),
    ])

    const merged = [...(checks as any), ...(notes as any)]
    const result = computeAging(merged, asOfDate)
    res.json({ success: true, asOf: asOfDate.toISOString(), ...result })
  } catch (error) {
    console.error('Aging combined error:', error)
    res.status(500).json({ error: 'Failed to compute combined aging' })
  }
})

export default router
