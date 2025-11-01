import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateDeliveryNoteDTO {
  deliveryType: 'sevk' | 'tahsilat';
  orderId?: number;
  customerId: number;
  companyId?: number;
  items: {
    equipmentId?: number;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate?: number;
    unit?: string;
  }[];
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  fromAddress?: string;
  toAddress?: string;
  notes?: string;
  createdById?: number;
}

interface UpdateDeliveryNoteDTO {
  deliveryType?: 'sevk' | 'tahsilat';
  status?: 'pending' | 'delivered' | 'invoiced' | 'cancelled';
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  fromAddress?: string;
  toAddress?: string;
  notes?: string;
}

export class DeliveryNoteService {
  /**
   * Generate unique delivery number
   */
  async generateDeliveryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.deliveryNote.count({
      where: {
        deliveryNumber: {
          startsWith: `IR${year}`
        }
      }
    });
    
    const nextNumber = (count + 1).toString().padStart(5, '0');
    return `IR${year}${nextNumber}`;
  }

  /**
   * Create delivery note
   */
  async create(data: CreateDeliveryNoteDTO) {
    const deliveryNumber = await this.generateDeliveryNumber();
    
    const deliveryNote = await prisma.deliveryNote.create({
      data: {
        deliveryNumber,
        deliveryType: data.deliveryType,
        deliveryDate: new Date(),
        orderId: data.orderId,
        customerId: data.customerId,
        companyId: data.companyId,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        vehiclePlate: data.vehiclePlate,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        notes: data.notes,
        createdById: data.createdById,
        items: {
          create: data.items.map(item => ({
            equipmentId: item.equipmentId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            vatRate: item.vatRate || 20,
            unit: item.unit || 'Adet'
          }))
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true
          }
        },
        items: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return deliveryNote;
  }

  /**
   * Get all delivery notes with filters
   */
  async findAll(filters: {
    customerId?: number;
    orderId?: number;
    status?: string;
    deliveryType?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  } = {}) {
    const {
      customerId,
      orderId,
      status,
      deliveryType,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (orderId) where.orderId = orderId;
    if (status) where.status = status;
    if (deliveryType) where.deliveryType = deliveryType;
    
    if (startDate || endDate) {
      where.deliveryDate = {};
      if (startDate) where.deliveryDate.gte = startDate;
      if (endDate) where.deliveryDate.lte = endDate;
    }

    const [deliveryNotes, total] = await Promise.all([
      prisma.deliveryNote.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          order: {
            select: {
              id: true,
              orderNumber: true
            }
          },
          items: {
            include: {
              equipment: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              invoiceDate: true
            }
          }
        },
        orderBy: {
          deliveryDate: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.deliveryNote.count({ where })
    ]);

    return {
      data: deliveryNotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get delivery note by ID
   */
  async findById(id: number) {
    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            taxNumber: true,
            taxOffice: true
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            startDate: true,
            endDate: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            email: true,
            taxNumber: true,
            taxOffice: true
          }
        },
        items: {
          include: {
            equipment: {
              select: {
                id: true,
                name: true,
                code: true,
                brand: true,
                model: true
              }
            }
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            invoiceDate: true,
            grandTotal: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!deliveryNote) {
      throw new Error('Delivery note not found');
    }

    return deliveryNote;
  }

  /**
   * Update delivery note
   */
  async update(id: number, data: UpdateDeliveryNoteDTO) {
    const deliveryNote = await prisma.deliveryNote.update({
      where: { id },
      data: {
        deliveryType: data.deliveryType,
        status: data.status,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        vehiclePlate: data.vehiclePlate,
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        notes: data.notes,
        updatedAt: new Date()
      },
      include: {
        customer: true,
        order: true,
        items: {
          include: {
            equipment: true
          }
        }
      }
    });

    return deliveryNote;
  }

  /**
   * Delete delivery note
   */
  async delete(id: number) {
    // Check if already converted to invoice
    const deliveryNote = await prisma.deliveryNote.findUnique({
      where: { id },
      select: { invoiceId: true, status: true }
    });

    if (!deliveryNote) {
      throw new Error('Delivery note not found');
    }

    if (deliveryNote.invoiceId) {
      throw new Error('Cannot delete delivery note that has been converted to invoice');
    }

    if (deliveryNote.status === 'delivered') {
      throw new Error('Cannot delete delivered delivery note. Cancel it first.');
    }

    await prisma.deliveryNote.delete({
      where: { id }
    });

    return { success: true, message: 'Delivery note deleted successfully' };
  }

  /**
   * Cancel delivery note
   */
  async cancel(id: number) {
    const deliveryNote = await prisma.deliveryNote.update({
      where: { id },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    return deliveryNote;
  }

  /**
   * Mark delivery note as delivered
   */
  async markAsDelivered(id: number) {
    const deliveryNote = await prisma.deliveryNote.update({
      where: { id },
      data: {
        status: 'delivered',
        updatedAt: new Date()
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
  }

  /**
   * Get delivery note statistics
   */
  async getStatistics(filters: {
    customerId?: number;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const where: any = {};

    if (filters.customerId) where.customerId = filters.customerId;
    
    if (filters.startDate || filters.endDate) {
      where.deliveryDate = {};
      if (filters.startDate) where.deliveryDate.gte = filters.startDate;
      if (filters.endDate) where.deliveryDate.lte = filters.endDate;
    }

    const [total, pending, delivered, invoiced, cancelled] = await Promise.all([
      prisma.deliveryNote.count({ where }),
      prisma.deliveryNote.count({ where: { ...where, status: 'pending' } }),
      prisma.deliveryNote.count({ where: { ...where, status: 'delivered' } }),
      prisma.deliveryNote.count({ where: { ...where, status: 'invoiced' } }),
      prisma.deliveryNote.count({ where: { ...where, status: 'cancelled' } })
    ]);

    return {
      total,
      pending,
      delivered,
      invoiced,
      cancelled
    };
  }
}

export default new DeliveryNoteService();
