import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken, AuthRequest } from '../middleware/auth'

const router = express.Router()
const prisma = new PrismaClient()

// Get all account cards with filters
router.get('/', authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest
    const { type, isActive, search, page = 1, limit = 50 } = req.query
    const companyId = authReq.user?.companyId || 1

    const where: any = { companyId }

    if (type) {
      where.type = type
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { taxNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const [accountCards, total] = await Promise.all([
      prisma.accountCard.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: {
            select: {
              transactions: true,
              invoices: true,
              expenses: true,
              customers: true,
              suppliers: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.accountCard.count({ where })
    ])

    res.json({
      accountCards,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error: any) {
    console.error('Get account cards error:', error)
    res.status(500).json({ error: 'Cari hesaplar getirilemedi', message: error.message })
  }
})

// Get single account card with details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const authReq = req as AuthRequest; const companyId = authReq.user?.companyId || 1

    const accountCard = await prisma.accountCard.findFirst({
      where: { id: parseInt(id), companyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        transactions: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { date: 'desc' },
          take: 100
        },
        customers: { select: { id: true, name: true, email: true, phone: true } },
        suppliers: { select: { id: true, name: true, email: true, phone: true } },
        _count: {
          select: {
            transactions: true,
            invoices: true,
            expenses: true
          }
        }
      }
    })

    if (!accountCard) {
      return res.status(404).json({ error: 'Cari hesap bulunamadı' })
    }

    res.json(accountCard)
  } catch (error: any) {
    console.error('Get account card error:', error)
    res.status(500).json({ error: 'Cari hesap getirilemedi', message: error.message })
  }
})

// Create account card
router.post('/', authenticateToken, async (req, res) => {
  try {
    const authReq = req as AuthRequest; const companyId = authReq.user?.companyId || 1
    const userId = authReq.user?.userId || 1

    const {
      code,
      name,
      type,
      taxNumber,
      taxOffice,
      phone,
      email,
      address,
      city,
      district,
      postalCode,
      country = 'Türkiye',
      contactPerson,
      contactPhone,
      contactEmail,
      website,
      notes,
      creditLimit,
      paymentTerm,
      discountRate
    } = req.body

    // Validate required fields
    if (!code || !name || !type) {
      return res.status(400).json({ error: 'Kod, isim ve tip zorunludur' })
    }

    // Check if code already exists
    const existing = await prisma.accountCard.findUnique({
      where: { code }
    })

    if (existing) {
      return res.status(400).json({ error: 'Bu kod zaten kullanılıyor' })
    }

    const accountCard = await prisma.accountCard.create({
      data: {
        code,
        name,
        type,
        taxNumber,
        taxOffice,
        phone,
        email,
        address,
        city,
        district,
        postalCode,
        country,
        contactPerson,
        contactPhone,
        contactEmail,
        website,
        notes,
        creditLimit,
        paymentTerm,
        discountRate,
        companyId,
        createdBy: userId
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    res.status(201).json(accountCard)
  } catch (error: any) {
    console.error('Create account card error:', error)
    res.status(500).json({ error: 'Cari hesap oluşturulamadı', message: error.message })
  }
})

// Update account card
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const authReq = req as AuthRequest; const companyId = authReq.user?.companyId || 1

    const accountCard = await prisma.accountCard.findFirst({
      where: { id: parseInt(id), companyId }
    })

    if (!accountCard) {
      return res.status(404).json({ error: 'Cari hesap bulunamadı' })
    }

    const updated = await prisma.accountCard.update({
      where: { id: parseInt(id) },
      data: req.body,
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    })

    res.json(updated)
  } catch (error: any) {
    console.error('Update account card error:', error)
    res.status(500).json({ error: 'Cari hesap güncellenemedi', message: error.message })
  }
})

// Delete account card (soft delete - set isActive to false)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const authReq = req as AuthRequest; const companyId = authReq.user?.companyId || 1

    const accountCard = await prisma.accountCard.findFirst({
      where: { id: parseInt(id), companyId }
    })

    if (!accountCard) {
      return res.status(404).json({ error: 'Cari hesap bulunamadı' })
    }

    await prisma.accountCard.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    })

    res.json({ message: 'Cari hesap pasif edildi' })
  } catch (error: any) {
    console.error('Delete account card error:', error)
    res.status(500).json({ error: 'Cari hesap silinemedi', message: error.message })
  }
})

// Get account card transactions
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { page = 1, limit = 50, startDate, endDate, type } = req.query
    const authReq = req as AuthRequest; const companyId = authReq.user?.companyId || 1

    const accountCard = await prisma.accountCard.findFirst({
      where: { id: parseInt(id), companyId }
    })

    if (!accountCard) {
      return res.status(404).json({ error: 'Cari hesap bulunamadı' })
    }

    const where: any = { accountCardId: parseInt(id) }

    if (type) {
      where.type = type
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate as string)
      if (endDate) where.date.lte = new Date(endDate as string)
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)
    const take = parseInt(limit as string)

    const [transactions, total] = await Promise.all([
      prisma.accountCardTransaction.findMany({
        where,
        skip,
        take,
        include: {
          user: { select: { id: true, name: true } }
        },
        orderBy: { date: 'desc' }
      }),
      prisma.accountCardTransaction.count({ where })
    ])

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    })
  } catch (error: any) {
    console.error('Get transactions error:', error)
    res.status(500).json({ error: 'İşlemler getirilemedi', message: error.message })
  }
})

// Add transaction to account card
router.post('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const authReq = req as AuthRequest; const companyId = authReq.user?.companyId || 1
    const userId = authReq.user?.userId || 1

    const accountCard = await prisma.accountCard.findFirst({
      where: { id: parseInt(id), companyId }
    })

    if (!accountCard) {
      return res.status(404).json({ error: 'Cari hesap bulunamadı' })
    }

    const { type, amount, date, dueDate, description, referenceType, referenceId } = req.body

    if (!type || !amount || !date || !description) {
      return res.status(400).json({ error: 'Tip, tutar, tarih ve açıklama zorunludur' })
    }

    // Calculate new balance
    const balanceChange = type === 'debit' ? amount : -amount
    const newBalance = accountCard.balance + balanceChange

    // Create transaction and update balance in a transaction
    const [transaction] = await prisma.$transaction([
      prisma.accountCardTransaction.create({
        data: {
          accountCardId: parseInt(id),
          type,
          amount,
          date: new Date(date),
          dueDate: dueDate ? new Date(dueDate) : null,
          description,
          referenceType,
          referenceId,
          createdBy: userId
        },
        include: {
          user: { select: { id: true, name: true } }
        }
      }),
      prisma.accountCard.update({
        where: { id: parseInt(id) },
        data: { balance: newBalance }
      })
    ])

    res.status(201).json(transaction)
  } catch (error: any) {
    console.error('Add transaction error:', error)
    res.status(500).json({ error: 'İşlem eklenemedi', message: error.message })
  }
})

// Get account card summary/stats
router.get('/:id/summary', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const authReq = req as AuthRequest; const companyId = authReq.user?.companyId || 1

    const accountCard = await prisma.accountCard.findFirst({
      where: { id: parseInt(id), companyId }
    })

    if (!accountCard) {
      return res.status(404).json({ error: 'Cari hesap bulunamadı' })
    }

    const [debitTotal, creditTotal, overdueCount, invoiceCount, expenseCount] = await Promise.all([
      prisma.accountCardTransaction.aggregate({
        where: { accountCardId: parseInt(id), type: 'debit' },
        _sum: { amount: true }
      }),
      prisma.accountCardTransaction.aggregate({
        where: { accountCardId: parseInt(id), type: 'credit' },
        _sum: { amount: true }
      }),
      prisma.accountCardTransaction.count({
        where: {
          accountCardId: parseInt(id),
          dueDate: { lt: new Date() },
          type: 'debit'
        }
      }),
      prisma.invoice.count({
        where: { accountCardId: parseInt(id) }
      }),
      prisma.expense.count({
        where: { accountCardId: parseInt(id) }
      })
    ])

    res.json({
      balance: accountCard.balance,
      debitTotal: debitTotal._sum.amount || 0,
      creditTotal: creditTotal._sum.amount || 0,
      overdueCount,
      invoiceCount,
      expenseCount,
      creditLimit: accountCard.creditLimit,
      availableCredit: accountCard.creditLimit ? accountCard.creditLimit - accountCard.balance : null
    })
  } catch (error: any) {
    console.error('Get summary error:', error)
    res.status(500).json({ error: 'Özet getirilemedi', message: error.message })
  }
})

export default router
