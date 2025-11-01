import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import eInvoiceService from '../services/eInvoiceService'

const router = Router()

router.post('/generate/:invoiceId', authenticateToken, async (req, res) => {
	const invoiceId = Number(req.params.invoiceId)

	if (!invoiceId || Number.isNaN(invoiceId)) {
		return res.status(400).json({ success: false, message: 'Geçersiz fatura ID' })
	}

	try {
		const result = await eInvoiceService.generateXML(invoiceId)
		res.json({
			success: true,
			message: 'E-Fatura XML oluşturuldu',
			data: {
				uuid: result.uuid,
				xmlPreview: `${result.xml.substring(0, 500)}...`,
			},
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: 'E-Fatura XML oluşturulamadı',
			error: error.message,
		})
	}
})

router.post('/send/:invoiceId', authenticateToken, async (req, res) => {
	const invoiceId = Number(req.params.invoiceId)

	if (!invoiceId || Number.isNaN(invoiceId)) {
		return res.status(400).json({ success: false, message: 'Geçersiz fatura ID' })
	}

	try {
		const result = await eInvoiceService.sendToGIB(invoiceId)
		res.json({
			success: true,
			message: "E-Fatura GİB'e gönderildi",
			data: {
				uuid: result.uuid,
				ettn: result.ettn,
				status: result.gibStatus,
			},
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: 'E-Fatura gönderilemedi',
			error: error.message,
		})
	}
})

router.get('/status/:invoiceId', authenticateToken, async (req, res) => {
	const invoiceId = Number(req.params.invoiceId)

	if (!invoiceId || Number.isNaN(invoiceId)) {
		return res.status(400).json({ success: false, message: 'Geçersiz fatura ID' })
	}

	try {
		const status = await eInvoiceService.checkStatus(invoiceId)
		res.json({ success: true, data: status })
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: 'Durum sorgulanamadı',
			error: error.message,
		})
	}
})

router.get('/xml/:invoiceId', authenticateToken, async (req, res) => {
	const invoiceId = Number(req.params.invoiceId)

	if (!invoiceId || Number.isNaN(invoiceId)) {
		return res.status(400).json({ success: false, message: 'Geçersiz fatura ID' })
	}

	try {
		const xml = await eInvoiceService.getXML(invoiceId)
		res.setHeader('Content-Type', 'application/xml')
		res.send(xml)
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: 'E-Fatura bulunamadı',
			error: error.message,
		})
	}
})

export default router
