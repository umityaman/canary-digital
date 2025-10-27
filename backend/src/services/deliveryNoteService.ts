import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DeliveryNoteItemInput {
  productId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  taxAmount?: number;
}

interface DeliveryNoteInput {
  customerId: number;
  deliveryDate: Date;
  notes?: string;
  status?: string;
  items: DeliveryNoteItemInput[];
}

export class DeliveryNoteService {
  /**
   * İrsaliye oluştur
   */
  async create(data: DeliveryNoteInput, companyId: number, userId: number) {
    try {
      // Otomatik irsaliye numarası oluştur
      const lastNote = await prisma.deliveryNote.findFirst({
        where: { companyId },
        orderBy: { id: 'desc' }
      });

      const deliveryNumber = lastNote
        ? `IRS-${new Date().getFullYear()}-${String(lastNote.id + 1).padStart(4, '0')}`
        : `IRS-${new Date().getFullYear()}-0001`;

      // İrsaliye oluştur
      const deliveryNote = await prisma.deliveryNote.create({
        data: {
          deliveryNumber,
          customerId: data.customerId,
          companyId,
          createdBy: userId,
          deliveryDate: data.deliveryDate,
          description: data.notes || '',
          status: data.status || 'draft',
          items: {
            create: data.items.map(item => ({
              equipmentId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total,
              taxRate: item.taxRate || 20.0
            }))
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              equipment: true
            }
          }
        }
      });

      return deliveryNote;
    } catch (error) {
      console.error('Error creating delivery note:', error);
      throw new Error('İrsaliye oluşturulamadı');
    }
  }

  /**
   * Tüm irsaliyeleri listele
   */
  async list(companyId: number, filters?: {
    status?: string;
    customerId?: number;
    startDate?: Date;
    endDate?: Date;
  }) {
    try {
      const where: any = { companyId };

      if (filters?.status) {
        where.status = filters.status;
      }

      if (filters?.customerId) {
        where.customerId = filters.customerId;
      }

      if (filters?.startDate || filters?.endDate) {
        where.deliveryDate = {};
        if (filters.startDate) {
          where.deliveryDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.deliveryDate.lte = filters.endDate;
        }
      }

      const deliveryNotes = await prisma.deliveryNote.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              equipment: true
            }
          }
        },
        orderBy: { deliveryDate: 'desc' }
      });

      return deliveryNotes;
    } catch (error) {
      console.error('Error listing delivery notes:', error);
      throw new Error('İrsaliyeler listelenemedi');
    }
  }

  /**
   * İrsaliye detayı getir
   */
  async getById(id: number, companyId: number) {
    try {
      const deliveryNote = await prisma.deliveryNote.findFirst({
        where: {
          id,
          companyId
        },
        include: {
          customer: true,
          items: {
            include: {
              equipment: true
            }
          },
          invoice: true
        }
      });

      if (!deliveryNote) {
        throw new Error('İrsaliye bulunamadı');
      }

      return deliveryNote;
    } catch (error) {
      console.error('Error getting delivery note:', error);
      throw error;
    }
  }

  /**
   * İrsaliye güncelle
   */
  async update(id: number, data: Partial<DeliveryNoteInput>, companyId: number) {
    try {
      // Mevcut irsaliyeyi kontrol et
      const existing = await prisma.deliveryNote.findFirst({
        where: { id, companyId }
      });

      if (!existing) {
        throw new Error('İrsaliye bulunamadı');
      }

      if (existing.status === 'invoiced') {
        throw new Error('Faturaya dönüştürülmüş irsaliye güncellenemez');
      }

      // Update data hazırla
      let updateData: any = {
        deliveryDate: data.deliveryDate,
        description: data.notes,
        status: data.status
      };

      if (data.items && data.items.length > 0) {
        // Eski item'ları sil, yenilerini ekle
        await prisma.deliveryNoteItem.deleteMany({
          where: { deliveryNoteId: id }
        });

        updateData.items = {
          create: data.items.map(item => ({
            equipmentId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            taxRate: item.taxRate || 20.0
          }))
        };
      }

      const deliveryNote = await prisma.deliveryNote.update({
        where: { id },
        data: updateData,
        include: {
          customer: true,
          items: {
            include: {
              equipment: true
            }
          }
        }
      });

      return deliveryNote;
    } catch (error) {
      console.error('Error updating delivery note:', error);
      throw error;
    }
  }

  /**
   * İrsaliye sil
   */
  async delete(id: number, companyId: number) {
    try {
      const existing = await prisma.deliveryNote.findFirst({
        where: { id, companyId }
      });

      if (!existing) {
        throw new Error('İrsaliye bulunamadı');
      }

      if (existing.status === 'invoiced') {
        throw new Error('Faturaya dönüştürülmüş irsaliye silinemez');
      }

      // Item'ları sil
      await prisma.deliveryNoteItem.deleteMany({
        where: { deliveryNoteId: id }
      });

      // İrsaliyeyi sil
      await prisma.deliveryNote.delete({
        where: { id }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting delivery note:', error);
      throw error;
    }
  }

  /**
   * İrsaliyeyi faturaya dönüştür
   */
  async convertToInvoice(id: number, companyId: number, userId: number) {
    try {
      const deliveryNote = await this.getById(id, companyId);

      if (deliveryNote.status === 'invoiced') {
        throw new Error('Bu irsaliye zaten faturaya dönüştürülmüş');
      }

      if (!deliveryNote.items || deliveryNote.items.length === 0) {
        throw new Error('İrsaliyede ürün bulunmuyor');
      }

      // Toplam hesapla
      const subtotal = deliveryNote.items.reduce((sum: number, item: any) => 
        sum + (item.quantity * item.unitPrice), 0);
      const taxTotal = deliveryNote.items.reduce((sum: number, item: any) => 
        sum + ((item.quantity * item.unitPrice * item.taxRate) / 100), 0);
      const total = subtotal + taxTotal;

      // Otomatik fatura numarası oluştur
      const lastInvoice = await prisma.invoice.findFirst({
        orderBy: { id: 'desc' }
      });

      const invoiceNumber = lastInvoice
        ? `FAT-${new Date().getFullYear()}-${String(lastInvoice.id + 1).padStart(4, '0')}`
        : `FAT-${new Date().getFullYear()}-0001`;

      // Fatura oluştur
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: deliveryNote.customerId,
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün sonra
          subtotal,
          taxTotal,
          total,
          status: 'draft',
          notes: `İrsaliye No: ${deliveryNote.deliveryNumber}\n${deliveryNote.description || ''}`,
          createdBy: userId
        },
        include: {
          customer: true
        }
      });

      // İrsaliye durumunu güncelle
      await prisma.deliveryNote.update({
        where: { id },
        data: { 
          status: 'invoiced',
          invoiceId: invoice.id
        }
      });

      return invoice;
    } catch (error) {
      console.error('Error converting delivery note to invoice:', error);
      throw error;
    }
  }

  /**
   * İrsaliye durumunu güncelle
   */
  async updateStatus(id: number, status: string, companyId: number) {
    try {
      const deliveryNote = await prisma.deliveryNote.findFirst({
        where: { id, companyId }
      });

      if (!deliveryNote) {
        throw new Error('İrsaliye bulunamadı');
      }

      const updated = await prisma.deliveryNote.update({
        where: { id },
        data: { status }
      });

      return updated;
    } catch (error) {
      console.error('Error updating delivery note status:', error);
      throw error;
    }
  }

  /**
   * İstatistikler
   */
  async getStats(companyId: number) {
    try {
      const total = await prisma.deliveryNote.count({ where: { companyId } });
      const draft = await prisma.deliveryNote.count({ 
        where: { companyId, status: 'draft' } 
      });
      const approved = await prisma.deliveryNote.count({ 
        where: { companyId, status: 'approved' } 
      });
      const invoiced = await prisma.deliveryNote.count({ 
        where: { companyId, status: 'invoiced' } 
      });

      return { total, draft, approved, invoiced };
    } catch (error) {
      console.error('Error getting delivery note stats:', error);
      throw new Error('İstatistikler alınamadı');
    }
  }
}

export default new DeliveryNoteService();
