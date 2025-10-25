import { prisma } from '../index';
import { log } from '../config/logger';
import { invoiceService } from './invoice.service';
import { addDays, addMonths } from 'date-fns';

interface CreateOfferParams {
  customerId: number;
  items: Array<{
    equipmentId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    days: number;
    discountPercentage?: number;
  }>;
  validityDays?: number;
  notes?: string;
}

interface UpdateOfferParams {
  items?: Array<{
    equipmentId: number;
    description: string;
    quantity: number;
    unitPrice: number;
    days: number;
    discountPercentage?: number;
  }>;
  validUntil?: Date;
  status?: string;
  notes?: string;
}

/**
 * Offer Service
 * Teklif yönetimi servisi
 */
export class OfferService {
  /**
   * Yeni teklif oluştur
   */
  async createOffer(params: CreateOfferParams) {
    const { customerId, items, validityDays = 30, notes } = params;

    try {
      log.info('Offer Service: Yeni teklif oluşturuluyor...', { customerId });

      // Müşteri kontrolü
      const customer = await prisma.user.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      // Toplam tutarları hesapla
      const totalAmount = items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.unitPrice * item.days;
        const discount = item.discountPercentage 
          ? (itemTotal * item.discountPercentage) / 100 
          : 0;
        return sum + (itemTotal - discount);
      }, 0);

      const vatAmount = (totalAmount * 18) / 100;
      const grandTotal = totalAmount + vatAmount;

      // Teklif numarası oluştur (OF-YYYYMMDD-XXX formatında)
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const count = await prisma.offer.count({
        where: {
          offerDate: {
            gte: new Date(today.setHours(0, 0, 0, 0)),
            lt: new Date(today.setHours(23, 59, 59, 999)),
          },
        },
      });
      const offerNumber = `OF-${dateStr}-${String(count + 1).padStart(3, '0')}`;

      // Geçerlilik tarihi
      const validUntil = addDays(new Date(), validityDays);

      // Teklif oluştur
      const offer = await prisma.offer.create({
        data: {
          customerId,
          offerNumber,
          offerDate: new Date(),
          validUntil,
          items: JSON.stringify(items),
          totalAmount,
          vatAmount,
          grandTotal,
          status: 'draft',
          notes,
        },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              company: true,
            },
          },
        },
      });

      log.info('Offer Service: Teklif oluşturuldu:', { offerId: offer.id, offerNumber });

      return offer;
    } catch (error) {
      log.error('Offer Service: Teklif oluşturulamadı:', error);
      throw error;
    }
  }

  /**
   * Tüm teklifleri listele
   */
  async getAllOffers(filters?: {
    status?: string;
    customerId?: number;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        status,
        customerId,
        search,
        startDate,
        endDate,
        page = 1,
        limit = 20,
      } = filters || {};

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (search) {
        where.OR = [
          {
            offerNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            customer: {
              fullName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ];
      }

      if (startDate || endDate) {
        where.offerDate = {};
        if (startDate) {
          where.offerDate.gte = startDate;
        }
        if (endDate) {
          where.offerDate.lte = endDate;
        }
      }

      const skip = (page - 1) * limit;

      const [offers, total] = await Promise.all([
        prisma.offer.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                company: true,
              },
            },
          },
          orderBy: {
            offerDate: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.offer.count({ where }),
      ]);

      // JSON items'ı parse et
      const parsedOffers = offers.map(offer => ({
        ...offer,
        items: typeof offer.items === 'string' ? JSON.parse(offer.items as string) : offer.items,
      }));

      return {
        offers: parsedOffers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      log.error('Offer Service: Teklifler listelenemedi:', error);
      throw error;
    }
  }

  /**
   * Teklif detayını getir
   */
  async getOfferById(id: number) {
    try {
      const offer = await prisma.offer.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              company: true,
              address: true,
              taxNumber: true,
              taxOffice: true,
            },
          },
        },
      });

      if (!offer) {
        throw new Error('Offer not found');
      }

      // JSON items'ı parse et
      const parsedOffer = {
        ...offer,
        items: typeof offer.items === 'string' ? JSON.parse(offer.items as string) : offer.items,
      };

      // Geçerlilik kontrolü - süresi dolmuşsa otomatik expired yap
      if (parsedOffer.status === 'sent' && new Date() > parsedOffer.validUntil) {
        await prisma.offer.update({
          where: { id },
          data: { status: 'expired' },
        });
        parsedOffer.status = 'expired';
      }

      return parsedOffer;
    } catch (error) {
      log.error('Offer Service: Teklif detayı alınamadı:', error);
      throw error;
    }
  }

  /**
   * Teklifi güncelle
   */
  async updateOffer(id: number, params: UpdateOfferParams) {
    try {
      log.info('Offer Service: Teklif güncelleniyor...', { offerId: id });

      const offer = await prisma.offer.findUnique({
        where: { id },
      });

      if (!offer) {
        throw new Error('Offer not found');
      }

      if (offer.status === 'converted') {
        throw new Error('Cannot update converted offer');
      }

      const updateData: any = {};

      if (params.items) {
        // Toplam tutarları yeniden hesapla
        const totalAmount = params.items.reduce((sum, item) => {
          const itemTotal = item.quantity * item.unitPrice * item.days;
          const discount = item.discountPercentage 
            ? (itemTotal * item.discountPercentage) / 100 
            : 0;
          return sum + (itemTotal - discount);
        }, 0);

        const vatAmount = (totalAmount * 18) / 100;
        const grandTotal = totalAmount + vatAmount;

        updateData.items = JSON.stringify(params.items);
        updateData.totalAmount = totalAmount;
        updateData.vatAmount = vatAmount;
        updateData.grandTotal = grandTotal;
      }

      if (params.validUntil) {
        updateData.validUntil = params.validUntil;
      }

      if (params.status) {
        updateData.status = params.status;
      }

      if (params.notes !== undefined) {
        updateData.notes = params.notes;
      }

      const updatedOffer = await prisma.offer.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
        },
      });

      log.info('Offer Service: Teklif güncellendi:', { offerId: id });

      return {
        ...updatedOffer,
        items: typeof updatedOffer.items === 'string' ? JSON.parse(updatedOffer.items as string) : updatedOffer.items,
      };
    } catch (error) {
      log.error('Offer Service: Teklif güncellenemedi:', error);
      throw error;
    }
  }

  /**
   * Teklifi sil
   */
  async deleteOffer(id: number) {
    try {
      log.info('Offer Service: Teklif siliniyor...', { offerId: id });

      const offer = await prisma.offer.findUnique({
        where: { id },
      });

      if (!offer) {
        throw new Error('Offer not found');
      }

      if (offer.status === 'converted') {
        throw new Error('Cannot delete converted offer');
      }

      await prisma.offer.delete({
        where: { id },
      });

      log.info('Offer Service: Teklif silindi:', { offerId: id });

      return { success: true, message: 'Offer deleted successfully' };
    } catch (error) {
      log.error('Offer Service: Teklif silinemedi:', error);
      throw error;
    }
  }

  /**
   * Teklifi faturaya dönüştür
   */
  async convertToInvoice(offerId: number, params: {
    orderId: number;
    startDate: Date;
    endDate: Date;
    notes?: string;
  }) {
    try {
      log.info('Offer Service: Teklif faturaya dönüştürülüyor...', { offerId });

      const offer = await this.getOfferById(offerId);

      if (offer.status === 'converted') {
        throw new Error('Offer already converted to invoice');
      }

      if (offer.status === 'rejected') {
        throw new Error('Cannot convert rejected offer');
      }

      if (offer.status === 'expired') {
        throw new Error('Cannot convert expired offer');
      }

      // Teklif items'larını parse et
      const items = typeof offer.items === 'string' 
        ? JSON.parse(offer.items as string) 
        : offer.items;

      // Fatura oluştur
      const invoice = await invoiceService.createRentalInvoice({
        orderId: params.orderId,
        customerId: offer.customerId,
        items,
        startDate: params.startDate,
        endDate: params.endDate,
        notes: params.notes || `Teklif ${offer.offerNumber}'dan oluşturuldu`,
      });

      // Teklif durumunu güncelle
      await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: 'converted',
          notes: `${offer.notes || ''}\n\nFatura #${invoice.id} olarak dönüştürüldü (${new Date().toISOString()})`,
        },
      });

      log.info('Offer Service: Teklif faturaya dönüştürüldü:', {
        offerId,
        invoiceId: invoice.id,
      });

      return {
        offer: await this.getOfferById(offerId),
        invoice,
      };
    } catch (error) {
      log.error('Offer Service: Teklif faturaya dönüştürülemedi:', error);
      throw error;
    }
  }

  /**
   * Teklif istatistikleri
   */
  async getOfferStats(filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const { startDate, endDate } = filters || {};

      const where: any = {};

      if (startDate || endDate) {
        where.offerDate = {};
        if (startDate) where.offerDate.gte = startDate;
        if (endDate) where.offerDate.lte = endDate;
      }

      const [
        totalOffers,
        draftOffers,
        sentOffers,
        acceptedOffers,
        rejectedOffers,
        convertedOffers,
        expiredOffers,
      ] = await Promise.all([
        prisma.offer.count({ where }),
        prisma.offer.count({ where: { ...where, status: 'draft' } }),
        prisma.offer.count({ where: { ...where, status: 'sent' } }),
        prisma.offer.count({ where: { ...where, status: 'accepted' } }),
        prisma.offer.count({ where: { ...where, status: 'rejected' } }),
        prisma.offer.count({ where: { ...where, status: 'converted' } }),
        prisma.offer.count({ where: { ...where, status: 'expired' } }),
      ]);

      const totalValue = await prisma.offer.aggregate({
        where,
        _sum: {
          grandTotal: true,
        },
      });

      const conversionRate = totalOffers > 0 
        ? (convertedOffers / totalOffers) * 100 
        : 0;

      return {
        totalOffers,
        statusBreakdown: {
          draft: draftOffers,
          sent: sentOffers,
          accepted: acceptedOffers,
          rejected: rejectedOffers,
          converted: convertedOffers,
          expired: expiredOffers,
        },
        totalValue: totalValue._sum.grandTotal || 0,
        conversionRate: Math.round(conversionRate * 100) / 100,
      };
    } catch (error) {
      log.error('Offer Service: İstatistikler alınamadı:', error);
      throw error;
    }
  }
}

export const offerService = new OfferService();
