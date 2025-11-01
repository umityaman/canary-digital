import { Prisma } from '@prisma/client'
import { XMLBuilder } from 'fast-xml-parser'
import crypto from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '../database'
import logger from '../config/logger'

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
	include: {
		customer: true
		payments: true
		order: {
			include: {
				orderItems: {
					include: {
						equipment: true
					}
				}
			}
		}
	}
}>

interface InvoiceLineData {
	description: string
	quantity: number
	unitCode: string
	unitPrice: number
	vatRate: number
	netAmount: number
	taxAmount: number
}

class EInvoiceService {
	async generateXML(invoiceId: number) {
		const invoice = await this.fetchInvoice(invoiceId)

		const existing = await prisma.eInvoice.findUnique({ where: { invoiceId } })
		const uuid = existing?.uuid ?? uuidv4()

		const lines = this.buildInvoiceLines(invoice)
		const totals = this.calculateTotals(invoice, lines)

		const supplier = this.getSupplierInfo()
		const customer = this.getCustomerInfo(invoice)

		const paymentMeansCode = this.getPaymentMeansCode(invoice.payments?.[0]?.paymentMethod)

		const ublInvoice = {
			Invoice: {
				'@_xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
				'@_xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
				'@_xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
				'cbc:UBLVersionID': '2.1',
				'cbc:CustomizationID': 'TR1.2',
				'cbc:ProfileID': customer.taxNumber ? 'TICARIFATURA' : 'EARSIVFATURA',
				'cbc:ID': invoice.invoiceNumber || `INV-${invoice.id}`,
				'cbc:CopyIndicator': 'false',
				'cbc:UUID': uuid,
				'cbc:IssueDate': this.formatDate(invoice.invoiceDate),
				'cbc:IssueTime': this.formatTime(invoice.invoiceDate),
				'cbc:InvoiceTypeCode': invoice.type?.toUpperCase() === 'RETURN' ? 'IADE' : 'SATIS',
				'cbc:DocumentCurrencyCode': 'TRY',
				'cbc:Note': invoice.order?.notes || undefined,
				'cac:AccountingSupplierParty': {
					'cac:Party': {
						'cac:PartyIdentification': {
							'cbc:ID': {
								'@_schemeID': 'VKN',
								'#text': supplier.taxNumber,
							},
						},
						'cac:PartyName': {
							'cbc:Name': supplier.name,
						},
						'cac:PostalAddress': {
							'cbc:StreetName': supplier.address,
							'cbc:CityName': supplier.city,
							'cbc:PostalZone': supplier.postalCode,
							'cac:Country': {
								'cbc:Name': supplier.country,
							},
						},
						'cac:Contact': {
							'cbc:Telephone': supplier.phone,
							'cbc:ElectronicMail': supplier.email,
						},
					},
				},
				'cac:AccountingCustomerParty': {
					'cac:Party': {
						'cac:PartyIdentification': customer.identifierScheme
							? {
									'cbc:ID': {
										'@_schemeID': customer.identifierScheme,
										'#text': customer.identifier,
									},
								}
							: undefined,
						'cac:PartyName': {
							'cbc:Name': customer.name,
						},
						'cac:PostalAddress': {
							'cbc:StreetName': customer.address,
							'cbc:CityName': customer.city,
							'cac:Country': {
								'cbc:Name': customer.country,
							},
						},
						'cac:Contact': {
							'cbc:Telephone': customer.phone,
							'cbc:ElectronicMail': customer.email,
						},
					},
				},
				'cac:PaymentMeans': {
					'cbc:PaymentMeansCode': paymentMeansCode,
					'cbc:PaymentDueDate': this.formatDate(invoice.dueDate),
				},
				'cac:TaxTotal': {
					'cbc:TaxAmount': {
						'@_currencyID': 'TRY',
						'#text': totals.taxTotal.toFixed(2),
					},
					'cac:TaxSubtotal': this.generateTaxSubtotals(lines),
				},
				'cac:LegalMonetaryTotal': {
					'cbc:LineExtensionAmount': {
						'@_currencyID': 'TRY',
						'#text': totals.netTotal.toFixed(2),
					},
					'cbc:TaxExclusiveAmount': {
						'@_currencyID': 'TRY',
						'#text': totals.netTotal.toFixed(2),
					},
					'cbc:TaxInclusiveAmount': {
						'@_currencyID': 'TRY',
						'#text': totals.grandTotal.toFixed(2),
					},
					'cbc:PayableAmount': {
						'@_currencyID': 'TRY',
						'#text': (totals.grandTotal - (invoice.paidAmount || 0)).toFixed(2),
					},
				},
				'cac:InvoiceLine': lines.map((line, index) => ({
					'cbc:ID': index + 1,
					'cbc:InvoicedQuantity': {
						'@_unitCode': line.unitCode,
						'#text': line.quantity,
					},
					'cbc:LineExtensionAmount': {
						'@_currencyID': 'TRY',
						'#text': line.netAmount.toFixed(2),
					},
					'cac:Item': {
						'cbc:Name': line.description,
					},
					'cac:Price': {
						'cbc:PriceAmount': {
							'@_currencyID': 'TRY',
							'#text': line.unitPrice.toFixed(2),
						},
					},
					'cac:TaxTotal': {
						'cbc:TaxAmount': {
							'@_currencyID': 'TRY',
							'#text': line.taxAmount.toFixed(2),
						},
						'cac:TaxSubtotal': {
							'cbc:TaxableAmount': {
								'@_currencyID': 'TRY',
								'#text': line.netAmount.toFixed(2),
							},
							'cbc:TaxAmount': {
								'@_currencyID': 'TRY',
								'#text': line.taxAmount.toFixed(2),
							},
							'cac:TaxCategory': {
								'cbc:Percent': line.vatRate,
								'cac:TaxScheme': {
									'cbc:Name': 'KDV',
									'cbc:TaxTypeCode': '0015',
								},
							},
						},
					},
				})),
			},
		}

		const builder = new XMLBuilder({ ignoreAttributes: false, format: true })
		const xml = builder.build(ublInvoice)
		const xmlHash = this.calculateHash(xml)

		if (existing) {
			await prisma.eInvoice.update({
				where: { id: existing.id },
				data: {
					xmlContent: xml,
					xmlHash,
					updatedAt: new Date(),
				},
			})
		} else {
			await prisma.eInvoice.create({
				data: {
					invoiceId,
					uuid,
					xmlContent: xml,
					xmlHash,
					gibStatus: 'draft',
				},
			})
		}

		logger.info(`E-Invoice XML generated for invoice ${invoiceId}`)

		return { xml, uuid }
	}

	async sendToGIB(invoiceId: number) {
		let eInvoice = await prisma.eInvoice.findUnique({ where: { invoiceId } })
		if (!eInvoice) {
			logger.info(`E-Invoice record missing for invoice ${invoiceId}, generating XML before send`)
			await this.generateXML(invoiceId)
			eInvoice = await prisma.eInvoice.findUnique({ where: { invoiceId } })
			if (!eInvoice) {
				throw new Error('E-Invoice could not be generated')
			}
		}

		const mockResponse = {
			status: 'sent',
			ettn: `ETTN-${Date.now()}`,
			message: 'E-Fatura GİB\'e gönderildi (TEST MODE)',
		}

		const updated = await prisma.eInvoice.update({
			where: { id: eInvoice.id },
			data: {
				gibStatus: 'sent',
				ettn: mockResponse.ettn,
				sentDate: new Date(),
				responseDate: new Date(),
				gibResponse: mockResponse,
			},
		})

		await prisma.invoice.update({
			where: { id: invoiceId },
			data: {
				status: 'sent',
			},
		})

		logger.info(`E-Invoice sent (mock) for invoice ${invoiceId}`)

		return updated
	}

	async checkStatus(invoiceId: number) {
		const eInvoice = await prisma.eInvoice.findUnique({ where: { invoiceId } })
		if (!eInvoice) {
			throw new Error('E-Invoice not found')
		}

		return {
			uuid: eInvoice.uuid,
			ettn: eInvoice.ettn,
			status: eInvoice.gibStatus,
			sentDate: eInvoice.sentDate,
			responseDate: eInvoice.responseDate,
		}
	}

	async getXML(invoiceId: number) {
		const eInvoice = await prisma.eInvoice.findUnique({ where: { invoiceId } })
		if (!eInvoice) {
			throw new Error('E-Invoice not found')
		}
		return eInvoice.xmlContent
	}

	private async fetchInvoice(invoiceId: number): Promise<InvoiceWithRelations> {
		const invoice = await prisma.invoice.findUnique({
			where: { id: invoiceId },
			include: {
				customer: true,
				payments: true,
				order: {
					include: {
						orderItems: {
							include: { equipment: true },
						},
					},
				},
			},
		})

		if (!invoice) {
			throw new Error('Invoice not found')
		}

		return invoice
	}

	private buildInvoiceLines(invoice: InvoiceWithRelations): InvoiceLineData[] {
		const orderItems = invoice.order?.orderItems || []

		if (orderItems.length === 0) {
			const netAmount = this.safeNumber(invoice.totalAmount)
			const taxAmount = this.safeNumber(invoice.vatAmount)
			const vatRate = netAmount > 0 ? (taxAmount / netAmount) * 100 : 18

			return [
				{
					description: invoice.invoiceNumber || 'Hizmet Bedeli',
					quantity: 1,
					unitCode: 'C62',
					unitPrice: netAmount,
					vatRate: Number.isFinite(vatRate) ? parseFloat(vatRate.toFixed(2)) : 18,
					netAmount,
					taxAmount,
				},
			]
		}

		return orderItems.map((item) => {
			const quantity = item.quantity || 1
			const netAmount = this.safeNumber(item.totalAmount)
			const unitPrice = item.dailyRate ?? (quantity !== 0 ? netAmount / quantity : netAmount)
			const vatRate = 18
			const taxAmount = (netAmount * vatRate) / 100

			return {
				description: item.equipment?.name || 'Hizmet Bedeli',
				quantity,
				unitCode: 'C62',
				unitPrice,
				vatRate,
				netAmount,
				taxAmount,
			}
		})
	}

	private calculateTotals(invoice: InvoiceWithRelations, lines: InvoiceLineData[]) {
		const netFromLines = lines.reduce((sum, line) => sum + line.netAmount, 0)
		const taxFromLines = lines.reduce((sum, line) => sum + line.taxAmount, 0)

		const netTotal = invoice.totalAmount ?? netFromLines
		const taxTotal = invoice.vatAmount ?? taxFromLines
		const grandTotal = invoice.grandTotal ?? netTotal + taxTotal

		return {
			netTotal: this.safeNumber(netTotal),
			taxTotal: this.safeNumber(taxTotal),
			grandTotal: this.safeNumber(grandTotal),
		}
	}

	private getSupplierInfo() {
		return {
			name: process.env.COMPANY_NAME || 'Canary Digital',
			taxNumber: process.env.COMPANY_TAX_NUMBER || '1234567890',
			address: process.env.COMPANY_ADDRESS || 'Adres Bilgisi',
			city: process.env.COMPANY_CITY || 'İstanbul',
			postalCode: process.env.COMPANY_POSTAL_CODE || '34000',
			country: 'Türkiye',
			phone: process.env.COMPANY_PHONE || undefined,
			email: process.env.COMPANY_EMAIL || undefined,
		}
	}

	private getCustomerInfo(invoice: InvoiceWithRelations) {
		const customer = invoice.customer
		const identifierScheme = customer.taxNumber ? 'VKN' : undefined

		return {
			name: customer.fullName || customer.name || customer.email || 'Müşteri',
			identifierScheme,
			identifier: customer.taxNumber || customer.email || `${invoice.customerId}`,
			taxNumber: customer.taxNumber || undefined,
			address: customer.address || 'Adres bilgisi belirtilmemiş',
			city: process.env.DEFAULT_CUSTOMER_CITY || 'İstanbul',
			country: 'Türkiye',
			phone: customer.phone || undefined,
			email: customer.email || undefined,
		}
	}

	private getPaymentMeansCode(method?: string) {
		const codes: Record<string, string> = {
			Nakit: '10',
			'Kredi Kartı': '48',
			'Banka Transferi': '42',
			Çek: '20',
			Senet: '21',
		}

		if (!method) {
			return '30'
		}

		return codes[method] || '30'
	}

	private generateTaxSubtotals(lines: InvoiceLineData[]) {
		const groups = new Map<number, { taxable: number; tax: number }>()

		lines.forEach((line) => {
			const entry = groups.get(line.vatRate) || { taxable: 0, tax: 0 }
			entry.taxable += line.netAmount
			entry.tax += line.taxAmount
			groups.set(line.vatRate, entry)
		})

		const subtotals = Array.from(groups.entries()).map(([rate, totals]) => ({
			'cbc:TaxableAmount': {
				'@_currencyID': 'TRY',
				'#text': totals.taxable.toFixed(2),
			},
			'cbc:TaxAmount': {
				'@_currencyID': 'TRY',
				'#text': totals.tax.toFixed(2),
			},
			'cac:TaxCategory': {
				'cbc:Percent': rate,
				'cac:TaxScheme': {
					'cbc:Name': 'KDV',
					'cbc:TaxTypeCode': '0015',
				},
			},
		}))

		return subtotals.length === 1 ? subtotals[0] : subtotals
	}

	private formatDate(date: Date | string | null | undefined) {
		if (!date) {
			return new Date().toISOString().split('T')[0]
		}
		return new Date(date).toISOString().split('T')[0]
	}

	private formatTime(date: Date | string | null | undefined) {
		if (!date) {
			return new Date().toISOString().split('T')[1]?.split('.')[0] || '00:00:00'
		}
		return new Date(date).toISOString().split('T')[1]?.split('.')[0] || '00:00:00'
	}

	private calculateHash(xml: string) {
		return crypto.createHash('sha256').update(xml, 'utf-8').digest('hex')
	}

	private safeNumber(value: number | null | undefined, fallback = 0) {
		if (value === null || value === undefined || Number.isNaN(Number(value))) {
			return fallback
		}
		return Number(value)
	}
}

export default new EInvoiceService()
