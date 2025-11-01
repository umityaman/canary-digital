import axios from 'axios'
import { create } from 'xmlbuilder2'
import crypto from 'crypto'

/**
 * GIB (Gelir İdaresi Başkanlığı) SOAP Client Service
 * 
 * Bu servis e-Fatura ve e-Arşiv fatura entegrasyonu için
 * GIB SOAP web servislerine bağlanır.
 * 
 * Özellikler:
 * - UBL-TR 1.2 formatında XML fatura oluşturma
 * - SOAP envelope ve authentication
 * - e-Fatura gönderme (SendInvoice)
 * - e-Arşiv fatura gönderme (SendArchiveInvoice)
 * - Fatura durumu sorgulama (QueryInvoiceStatus)
 * - Fatura iptal etme (CancelInvoice)
 */

// GIB Environment Configuration
const GIB_CONFIG = {
  test: {
    efaturaUrl: 'https://efaturatest.gbinteraktif.com.tr/FaturaCcpServices/service.svc',
    earsivUrl: 'https://efaturatest.gbinteraktif.com.tr/EarsivFaturaCcpServices/service.svc',
    username: process.env.GIB_TEST_USERNAME || '',
    password: process.env.GIB_TEST_PASSWORD || ''
  },
  production: {
    efaturaUrl: 'https://efatura.gbinteraktif.com.tr/FaturaCcpServices/service.svc',
    earsivUrl: 'https://efatura.gbinteraktif.com.tr/EarsivFaturaCcpServices/service.svc',
    username: process.env.GIB_PROD_USERNAME || '',
    password: process.env.GIB_PROD_PASSWORD || ''
  }
}

// Current environment (can be switched)
const isProduction = process.env.NODE_ENV === 'production'
const currentConfig = isProduction ? GIB_CONFIG.production : GIB_CONFIG.test

interface InvoiceData {
  invoiceId: string
  uuid: string
  issueDate: string
  invoiceTypeCode: string // 'SATIS' or 'IADE'
  documentCurrencyCode: string // 'TRY', 'USD', 'EUR'
  
  // Supplier (Satıcı - Bizim şirket)
  supplier: {
    partyName: string
    taxOffice: string
    taxNumber: string
    address: string
    citySubdivisionName: string
    cityName: string
    postalZone: string
    country: string
    telephone?: string
    email?: string
    website?: string
  }
  
  // Customer (Alıcı)
  customer: {
    partyName: string
    taxOffice?: string
    taxNumber?: string
    tcKimlikNo?: string
    address: string
    citySubdivisionName: string
    cityName: string
    postalZone: string
    country: string
    telephone?: string
    email?: string
  }
  
  // Invoice Lines (Fatura satırları)
  lines: Array<{
    lineId: string
    itemName: string
    quantity: number
    unitCode: string // 'C62' (adet), 'DAY' (gün), vb.
    priceAmount: number
    taxPercent: number
    taxAmount: number
    lineExtensionAmount: number
    allowanceCharge?: {
      chargeIndicator: boolean
      amount: number
      reason: string
    }
  }>
  
  // Totals
  lineExtensionAmount: number // KDV Hariç tutar
  taxExclusiveAmount: number // KDV Hariç tutar
  taxInclusiveAmount: number // KDV Dahil tutar
  allowanceTotalAmount?: number // İndirim toplamı
  chargeTotalAmount?: number // Masraf toplamı
  payableAmount: number // Ödenecek tutar
  
  // Notes
  note?: string
}

/**
 * UBL-TR 1.2 formatında e-Fatura XML'i oluşturur
 */
export const generateInvoiceXML = (data: InvoiceData): string => {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('Invoice', {
      xmlns: 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
      'xmlns:ccts': 'urn:un:unece:uncefact:documentation:2',
      'xmlns:qdt': 'urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2',
      'xmlns:udt': 'urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2',
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2 UBL-Invoice-2.1.xsd'
    })

  // UBL Version
  doc.ele('cbc:UBLVersionID').txt('2.1').up()
  doc.ele('cbc:CustomizationID').txt('TR1.2').up()
  
  // Profile ID (e-Fatura için TICARIFATURA, e-Arşiv için EARSIVFATURA)
  const profileId = data.customer.taxNumber ? 'TICARIFATURA' : 'EARSIVFATURA'
  doc.ele('cbc:ProfileID').txt(profileId).up()
  
  // Invoice identifiers
  doc.ele('cbc:ID').txt(data.invoiceId).up()
  doc.ele('cbc:CopyIndicator').txt('false').up()
  doc.ele('cbc:UUID').txt(data.uuid).up()
  doc.ele('cbc:IssueDate').txt(data.issueDate).up()
  doc.ele('cbc:IssueTime').txt(new Date().toISOString().split('T')[1].split('.')[0]).up()
  
  // Invoice Type Code
  doc.ele('cbc:InvoiceTypeCode').txt(data.invoiceTypeCode).up()
  
  // Note
  if (data.note) {
    doc.ele('cbc:Note').txt(data.note).up()
  }
  
  // Document Currency Code
  doc.ele('cbc:DocumentCurrencyCode').txt(data.documentCurrencyCode).up()
  
  // Supplier Party (Satıcı)
  const supplierParty = doc.ele('cac:AccountingSupplierParty').ele('cac:Party')
  
  supplierParty.ele('cac:PartyIdentification')
    .ele('cbc:ID', { schemeID: 'VKN' }).txt(data.supplier.taxNumber).up().up()
  
  supplierParty.ele('cac:PartyName')
    .ele('cbc:Name').txt(data.supplier.partyName).up().up()
  
  const supplierAddress = supplierParty.ele('cac:PostalAddress')
  supplierAddress.ele('cbc:StreetName').txt(data.supplier.address).up()
  supplierAddress.ele('cbc:CitySubdivisionName').txt(data.supplier.citySubdivisionName).up()
  supplierAddress.ele('cbc:CityName').txt(data.supplier.cityName).up()
  supplierAddress.ele('cbc:PostalZone').txt(data.supplier.postalZone).up()
  supplierAddress.ele('cac:Country').ele('cbc:Name').txt(data.supplier.country).up().up()
  
  const supplierTaxScheme = supplierParty.ele('cac:PartyTaxScheme')
  supplierTaxScheme.ele('cac:TaxScheme').ele('cbc:Name').txt(data.supplier.taxOffice).up().up()
  
  if (data.supplier.telephone) {
    supplierParty.ele('cac:Contact').ele('cbc:Telephone').txt(data.supplier.telephone).up().up()
  }
  
  // Customer Party (Alıcı)
  const customerParty = doc.ele('cac:AccountingCustomerParty').ele('cac:Party')
  
  // Tax or TC Kimlik No
  if (data.customer.taxNumber) {
    customerParty.ele('cac:PartyIdentification')
      .ele('cbc:ID', { schemeID: 'VKN' }).txt(data.customer.taxNumber).up().up()
  } else if (data.customer.tcKimlikNo) {
    customerParty.ele('cac:PartyIdentification')
      .ele('cbc:ID', { schemeID: 'TCKN' }).txt(data.customer.tcKimlikNo).up().up()
  }
  
  customerParty.ele('cac:PartyName')
    .ele('cbc:Name').txt(data.customer.partyName).up().up()
  
  const customerAddress = customerParty.ele('cac:PostalAddress')
  customerAddress.ele('cbc:StreetName').txt(data.customer.address).up()
  customerAddress.ele('cbc:CitySubdivisionName').txt(data.customer.citySubdivisionName).up()
  customerAddress.ele('cbc:CityName').txt(data.customer.cityName).up()
  customerAddress.ele('cbc:PostalZone').txt(data.customer.postalZone).up()
  customerAddress.ele('cac:Country').ele('cbc:Name').txt(data.customer.country).up().up()
  
  if (data.customer.taxOffice) {
    const customerTaxScheme = customerParty.ele('cac:PartyTaxScheme')
    customerTaxScheme.ele('cac:TaxScheme').ele('cbc:Name').txt(data.customer.taxOffice).up().up()
  }
  
  // Invoice Lines
  data.lines.forEach((line) => {
    const invoiceLine = doc.ele('cac:InvoiceLine')
    invoiceLine.ele('cbc:ID').txt(line.lineId).up()
    invoiceLine.ele('cbc:InvoicedQuantity', { unitCode: line.unitCode }).txt(line.quantity.toString()).up()
    invoiceLine.ele('cbc:LineExtensionAmount', { currencyID: data.documentCurrencyCode }).txt(line.lineExtensionAmount.toFixed(2)).up()
    
    // Allowance/Charge (İndirim/Masraf)
    if (line.allowanceCharge) {
      const allowance = invoiceLine.ele('cac:AllowanceCharge')
      allowance.ele('cbc:ChargeIndicator').txt(line.allowanceCharge.chargeIndicator.toString()).up()
      allowance.ele('cbc:Amount', { currencyID: data.documentCurrencyCode }).txt(line.allowanceCharge.amount.toFixed(2)).up()
      allowance.ele('cbc:BaseAmount', { currencyID: data.documentCurrencyCode }).txt(line.priceAmount.toFixed(2)).up()
    }
    
    // Tax Total
    const taxTotal = invoiceLine.ele('cac:TaxTotal')
    taxTotal.ele('cbc:TaxAmount', { currencyID: data.documentCurrencyCode }).txt(line.taxAmount.toFixed(2)).up()
    
    const taxSubtotal = taxTotal.ele('cac:TaxSubtotal')
    taxSubtotal.ele('cbc:TaxableAmount', { currencyID: data.documentCurrencyCode }).txt(line.lineExtensionAmount.toFixed(2)).up()
    taxSubtotal.ele('cbc:TaxAmount', { currencyID: data.documentCurrencyCode }).txt(line.taxAmount.toFixed(2)).up()
    taxSubtotal.ele('cbc:Percent').txt(line.taxPercent.toString()).up()
    taxSubtotal.ele('cac:TaxCategory').ele('cac:TaxScheme').ele('cbc:Name').txt('KDV').up().up().up()
    
    // Item
    const item = invoiceLine.ele('cac:Item')
    item.ele('cbc:Name').txt(line.itemName).up()
    
    // Price
    invoiceLine.ele('cac:Price')
      .ele('cbc:PriceAmount', { currencyID: data.documentCurrencyCode }).txt(line.priceAmount.toFixed(2)).up()
  })
  
  // Tax Total (Genel)
  const totalTax = data.taxInclusiveAmount - data.taxExclusiveAmount
  const taxTotal = doc.ele('cac:TaxTotal')
  taxTotal.ele('cbc:TaxAmount', { currencyID: data.documentCurrencyCode }).txt(totalTax.toFixed(2)).up()
  
  // Legal Monetary Total
  const monetaryTotal = doc.ele('cac:LegalMonetaryTotal')
  monetaryTotal.ele('cbc:LineExtensionAmount', { currencyID: data.documentCurrencyCode }).txt(data.lineExtensionAmount.toFixed(2)).up()
  monetaryTotal.ele('cbc:TaxExclusiveAmount', { currencyID: data.documentCurrencyCode }).txt(data.taxExclusiveAmount.toFixed(2)).up()
  monetaryTotal.ele('cbc:TaxInclusiveAmount', { currencyID: data.documentCurrencyCode }).txt(data.taxInclusiveAmount.toFixed(2)).up()
  
  if (data.allowanceTotalAmount) {
    monetaryTotal.ele('cbc:AllowanceTotalAmount', { currencyID: data.documentCurrencyCode }).txt(data.allowanceTotalAmount.toFixed(2)).up()
  }
  if (data.chargeTotalAmount) {
    monetaryTotal.ele('cbc:ChargeTotalAmount', { currencyID: data.documentCurrencyCode }).txt(data.chargeTotalAmount.toFixed(2)).up()
  }
  
  monetaryTotal.ele('cbc:PayableAmount', { currencyID: data.documentCurrencyCode }).txt(data.payableAmount.toFixed(2)).up()
  
  return doc.end({ prettyPrint: true })
}

/**
 * SOAP Envelope oluşturur
 */
const createSOAPEnvelope = (operation: string, body: string): string => {
  const timestamp = new Date().toISOString()
  const nonce = crypto.randomBytes(16).toString('base64')
  const password = currentConfig.username // Simplified - gerçekte hash'lenmiş olmalı
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:wsservice="http://schemas.i2i.com/ei/wsdl">
  <soapenv:Header>
    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <wsse:UsernameToken>
        <wsse:Username>${currentConfig.username}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">${currentConfig.password}</wsse:Password>
        <wsse:Nonce EncodingType="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary">${nonce}</wsse:Nonce>
        <wsu:Created xmlns:wsu="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">${timestamp}</wsu:Created>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <wsservice:${operation}>
      ${body}
    </wsservice:${operation}>
  </soapenv:Body>
</soapenv:Envelope>`
}

/**
 * e-Fatura gönderir (SOAP SendInvoice)
 */
export const sendInvoice = async (invoiceXML: string): Promise<any> => {
  const encodedXML = Buffer.from(invoiceXML).toString('base64')
  
  const soapBody = `
    <fileName>invoice.xml</fileName>
    <binaryData>${encodedXML}</binaryData>
    <hash>${crypto.createHash('md5').update(invoiceXML).digest('hex')}</hash>
  `
  
  const soapEnvelope = createSOAPEnvelope('sendInvoiceRequest', soapBody)
  
  try {
    const response = await axios.post(currentConfig.efaturaUrl, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'sendInvoice'
      }
    })
    
    return parseSOAPResponse(response.data)
  } catch (error: any) {
    throw new Error(`GIB e-Fatura gönderimi başarısız: ${error.message}`)
  }
}

/**
 * e-Arşiv fatura gönderir
 */
export const sendArchiveInvoice = async (invoiceXML: string): Promise<any> => {
  const encodedXML = Buffer.from(invoiceXML).toString('base64')
  
  const soapBody = `
    <fileName>archive_invoice.xml</fileName>
    <binaryData>${encodedXML}</binaryData>
    <hash>${crypto.createHash('md5').update(invoiceXML).digest('hex')}</hash>
  `
  
  const soapEnvelope = createSOAPEnvelope('sendArchiveInvoiceRequest', soapBody)
  
  try {
    const response = await axios.post(currentConfig.earsivUrl, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'sendArchiveInvoice'
      }
    })
    
    return parseSOAPResponse(response.data)
  } catch (error: any) {
    throw new Error(`GIB e-Arşiv fatura gönderimi başarısız: ${error.message}`)
  }
}

/**
 * Fatura durumu sorgular
 */
export const queryInvoiceStatus = async (uuid: string): Promise<any> => {
  const soapBody = `
    <uuid>${uuid}</uuid>
  `
  
  const soapEnvelope = createSOAPEnvelope('getInvoiceStatusRequest', soapBody)
  
  try {
    const response = await axios.post(currentConfig.efaturaUrl, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'getInvoiceStatus'
      }
    })
    
    return parseSOAPResponse(response.data)
  } catch (error: any) {
    throw new Error(`GIB fatura durumu sorgulaması başarısız: ${error.message}`)
  }
}

/**
 * Fatura iptal eder
 */
export const cancelInvoice = async (uuid: string, reason: string): Promise<any> => {
  const soapBody = `
    <uuid>${uuid}</uuid>
    <reason>${reason}</reason>
  `
  
  const soapEnvelope = createSOAPEnvelope('cancelInvoiceRequest', soapBody)
  
  try {
    const response = await axios.post(currentConfig.efaturaUrl, soapEnvelope, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'cancelInvoice'
      }
    })
    
    return parseSOAPResponse(response.data)
  } catch (error: any) {
    throw new Error(`GIB fatura iptali başarısız: ${error.message}`)
  }
}

/**
 * SOAP response'u parse eder
 */
const parseSOAPResponse = (xmlResponse: string): any => {
  // Basit XML parsing - Gerçek implementasyonda xml2js veya fast-xml-parser kullanılmalı
  const statusMatch = xmlResponse.match(/<status[^>]*>([^<]+)<\/status>/i)
  const messageMatch = xmlResponse.match(/<message[^>]*>([^<]+)<\/message>/i)
  const errorMatch = xmlResponse.match(/<error[^>]*>([^<]+)<\/error>/i)
  
  return {
    success: statusMatch ? statusMatch[1] === 'SUCCESS' : false,
    status: statusMatch ? statusMatch[1] : 'UNKNOWN',
    message: messageMatch ? messageMatch[1] : '',
    error: errorMatch ? errorMatch[1] : null
  }
}

/**
 * Test connection - GIB servislerinin erişilebilir olup olmadığını kontrol eder
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(currentConfig.efaturaUrl + '?wsdl', {
      timeout: 5000
    })
    return response.status === 200
  } catch (error) {
    return false
  }
}

export default {
  generateInvoiceXML,
  sendInvoice,
  sendArchiveInvoice,
  queryInvoiceStatus,
  cancelInvoice,
  testConnection
}
