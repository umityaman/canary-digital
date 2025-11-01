import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService';
import { PricingService } from './pricingService';

const prisma = new PrismaClient() as any;
const p = prisma as any;

export class ReservationService {
  /**
   * Generate unique reservation number
   * Format: RES-YYYY-XXXX (e.g., RES-2025-0001)
   */
  async generateReservationNumber(companyId: number): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `RES-${year}-`;

    // Get the last reservation for this year
    const lastReservation = await p.reservation.findFirst({
      where: {
        companyId,
        reservationNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        reservationNo: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastReservation) {
      const lastNumber = parseInt(lastReservation.reservationNo.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Check equipment availability for given date range
   * Returns list of conflicts if any
   */
  async checkAvailability(
    equipmentId: number,
    startDate: Date,
    endDate: Date,
    excludeReservationId?: number
  ): Promise<{
    available: boolean;
    conflicts: any[];
    availableQuantity: number;
  }> {
    // Get equipment total quantity
    const equipment = await p.equipment.findUnique({
      where: { id: equipmentId },
      select: { quantity: true },
    });

    if (!equipment) {
      throw new Error('Equipment not found');
    }

    const totalQuantity = equipment.quantity || 1;

    // Find overlapping reservations
    const overlappingReservations = await p.reservationItem.findMany({
      where: {
        equipmentId,
        reservation: {
          id: excludeReservationId ? { not: excludeReservationId } : undefined,
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
          OR: [
            // Reservation starts during the period
            {
              startDate: { lte: endDate },
              endDate: { gte: startDate },
            },
          ],
        },
      },
      include: {
        reservation: {
          select: {
            id: true,
            reservationNo: true,
            customerName: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    // Calculate total reserved quantity
    const reservedQuantity = overlappingReservations.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const availableQuantity = totalQuantity - reservedQuantity;

    return {
      available: availableQuantity > 0,
      availableQuantity,
      conflicts: overlappingReservations.map((item) => ({
        reservationId: item.reservation.id,
        reservationNo: item.reservation.reservationNo,
        customerName: item.reservation.customerName,
        startDate: item.reservation.startDate,
        endDate: item.reservation.endDate,
        quantity: item.quantity,
        status: item.reservation.status,
      })),
    };
  }

  /**
   * Check availability for multiple equipment items
   */
  async checkBulkAvailability(
    items: { equipmentId: number; quantity: number }[],
    startDate: Date,
    endDate: Date,
    excludeReservationId?: number
  ): Promise<{
    allAvailable: boolean;
    items: {
      equipmentId: number;
      requestedQuantity: number;
      availableQuantity: number;
      available: boolean;
      conflicts: any[];
    }[];
  }> {
    const results = await Promise.all(
      items.map(async (item) => {
        const availability = await this.checkAvailability(
          item.equipmentId,
          startDate,
          endDate,
          excludeReservationId
        );

        return {
          equipmentId: item.equipmentId,
          requestedQuantity: item.quantity,
          availableQuantity: availability.availableQuantity,
          available: availability.availableQuantity >= item.quantity,
          conflicts: availability.conflicts,
        };
      })
    );

    return {
      allAvailable: results.every((r) => r.available),
      items: results,
    };
  }

  /**
   * Calculate reservation pricing
   */
  async calculateReservationPrice(
    companyId: number,
    items: {
      equipmentId: number;
      quantity: number;
    }[],
    startDate: Date,
    endDate: Date,
    discountCode?: string
  ): Promise<{
    items: any[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    appliedDiscount?: any;
  }> {
    const itemPrices = await Promise.all(
      items.map(async (item) => {
        const equipment = await p.equipment.findUnique({
          where: { id: item.equipmentId },
        });

        if (!equipment) {
          throw new Error(`Equipment ${item.equipmentId} not found`);
        }

        // Calculate price using pricing service
        const priceCalc: any = await PricingService.calculatePrice({
          equipmentId: item.equipmentId,
          startDate,
          endDate,
          quantity: item.quantity,
        });

        return {
          equipmentId: item.equipmentId,
          equipmentName: equipment.name,
          equipmentCode: equipment.code,
          quantity: item.quantity,
          unitPrice: priceCalc.basePrice / item.quantity,
          duration: priceCalc.duration,
          pricingType: priceCalc.pricingType,
          subtotal: priceCalc.basePrice,
          itemDiscount: priceCalc.totalDiscount,
          totalPrice: priceCalc.finalPrice,
          appliedRules: priceCalc.appliedRules,
        };
      })
    );

    let subtotal = itemPrices.reduce((sum, item) => sum + item.subtotal, 0);
    let totalDiscount = itemPrices.reduce((sum, item) => sum + item.itemDiscount, 0);

    // Apply discount code if provided
    let appliedDiscount = null;
    if (discountCode) {
      const discountValidation = await (PricingService as any).validateDiscountCode(
        discountCode,
        companyId
      );

      if (discountValidation.valid && discountValidation.discount) {
        const discount = discountValidation.discount;
        let codeDiscount = 0;

        if (discount.discountType === 'PERCENTAGE') {
          codeDiscount = (subtotal * discount.discountValue) / 100;
          if (discount.maxDiscount && codeDiscount > discount.maxDiscount) {
            codeDiscount = discount.maxDiscount;
          }
        } else if (discount.discountType === 'FIXED_AMOUNT') {
          codeDiscount = discount.discountValue;
        }

        totalDiscount += codeDiscount;
        appliedDiscount = {
          code: discount.code,
          type: discount.discountType,
          value: discount.discountValue,
          amount: codeDiscount,
        };
      }
    }

    const afterDiscount = subtotal - totalDiscount;
    const taxAmount = (afterDiscount * 20) / 100; // 20% VAT
    const totalAmount = afterDiscount + taxAmount;

    return {
      items: itemPrices,
      subtotal,
      discountAmount: totalDiscount,
      taxAmount,
      totalAmount,
      appliedDiscount,
    };
  }

  /**
   * Create a new reservation
   */
  async createReservation(data: {
    companyId: number;
    customerId?: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    items: {
      equipmentId: number;
      quantity: number;
    }[];
    startDate: Date;
    endDate: Date;
    pickupTime?: string;
    returnTime?: string;
    pickupLocation?: string;
    returnLocation?: string;
    deliveryRequired?: boolean;
    deliveryAddress?: string;
    deliveryFee?: number;
    discountCode?: string;
    notes?: string;
    specialRequests?: string;
    createdBy?: number;
    autoApprove?: boolean;
  }): Promise<any> {
    // 1. Check availability for all items
    const availability = await this.checkBulkAvailability(
      data.items,
      data.startDate,
      data.endDate
    );

    if (!availability.allAvailable) {
      const unavailableItems = availability.items
        .filter((item) => !item.available)
        .map((item) => ({
          equipmentId: item.equipmentId,
          requested: item.requestedQuantity,
          available: item.availableQuantity,
          conflicts: item.conflicts,
        }));

      throw new Error(
        `Some equipment is not available: ${JSON.stringify(unavailableItems)}`
      );
    }

    // 2. Calculate pricing
    const pricing = await this.calculateReservationPrice(
      data.companyId,
      data.items,
      data.startDate,
      data.endDate,
      data.discountCode
    );

    // 3. Generate reservation number
    const reservationNo = await this.generateReservationNumber(data.companyId);

    // 4. Calculate deposit (30% of total)
    const depositAmount = pricing.totalAmount * 0.3;
    const remainingAmount = pricing.totalAmount - depositAmount;

    // 5. Create reservation with items
    const reservation = await p.reservation.create({
      data: {
        reservationNo,
        companyId: data.companyId,
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        startDate: data.startDate,
        endDate: data.endDate,
        pickupTime: data.pickupTime || '09:00',
        returnTime: data.returnTime || '18:00',
        pickupLocation: data.pickupLocation,
        returnLocation: data.returnLocation,
        deliveryRequired: data.deliveryRequired || false,
        deliveryAddress: data.deliveryAddress,
        deliveryFee: data.deliveryFee || 0,
        status: data.autoApprove ? 'CONFIRMED' : 'PENDING',
        subtotal: pricing.subtotal,
        discountAmount: pricing.discountAmount,
        discountCode: data.discountCode,
        taxAmount: pricing.taxAmount,
        taxRate: 20,
        totalAmount: pricing.totalAmount,
        depositAmount,
        remainingAmount,
        notes: data.notes,
        specialRequests: data.specialRequests,
        createdBy: data.createdBy,
        items: {
          create: pricing.items.map((item) => ({
            equipmentId: item.equipmentId,
            equipmentName: item.equipmentName,
            equipmentCode: item.equipmentCode,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            pricingType: item.pricingType,
            duration: item.duration,
            itemDiscount: item.itemDiscount,
            subtotal: item.subtotal,
            totalPrice: item.totalPrice,
          })),
        },
        statusHistory: {
          create: {
            toStatus: data.autoApprove ? 'CONFIRMED' : 'PENDING',
            changedBy: data.createdBy,
            reason: data.autoApprove
              ? 'Auto-approved reservation'
              : 'New reservation created',
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    // 6. Send notification to customer
    try {
      await (NotificationService as any).sendNotification({
        companyId: data.companyId,
        type: 'RESERVATION',
        userId: data.customerId,
        title: `Reservation ${reservationNo} Created`,
        message: `Your reservation for ${data.items.length} item(s) has been ${
          data.autoApprove ? 'confirmed' : 'received and is pending approval'
        }.`,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          reservationId: reservation.id,
          reservationNo,
          startDate: data.startDate,
          endDate: data.endDate,
          totalAmount: pricing.totalAmount,
        }),
      });

      // Send email notification
      if (data.customerEmail) {
        await (NotificationService as any).sendEmail({
          to: data.customerEmail,
          templateId: 'RESERVATION_CREATED',
          variables: {
            customerName: data.customerName,
            reservationNo,
            startDate: data.startDate.toLocaleDateString('tr-TR'),
            endDate: data.endDate.toLocaleDateString('tr-TR'),
            totalAmount: pricing.totalAmount.toFixed(2),
            depositAmount: depositAmount.toFixed(2),
            status: data.autoApprove ? 'CONFIRMED' : 'PENDING',
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to send reservation notification:', notifError);
      // Don't fail the reservation creation if notification fails
    }

    return reservation;
  }

  /**
   * Update reservation status
   */
  async updateReservationStatus(
    reservationId: number,
    newStatus: string,
    userId?: number,
    reason?: string,
    notes?: string
  ): Promise<any> {
    const reservation = await p.reservation.findUnique({
      where: { id: reservationId },
      include: { items: true },
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    const oldStatus = reservation.status;

    // Update reservation status
    const updated = await p.reservation.update({
      where: { id: reservationId },
      data: {
        status: newStatus,
        previousStatus: oldStatus,
        ...(newStatus === 'CONFIRMED' && {
          approvedBy: userId,
          approvedAt: new Date(),
        }),
        ...(newStatus === 'REJECTED' && {
          rejectedBy: userId,
          rejectedAt: new Date(),
          rejectionReason: reason,
        }),
        statusHistory: {
          create: {
            fromStatus: oldStatus,
            toStatus: newStatus,
            changedBy: userId,
            reason,
            notes,
          },
        },
      },
      include: {
        items: true,
        statusHistory: true,
      },
    });

    // Send notification to customer
    try {
      let notificationTitle = '';
      let notificationMessage = '';

      switch (newStatus) {
        case 'CONFIRMED':
          notificationTitle = `Reservation ${reservation.reservationNo} Confirmed`;
          notificationMessage = `Your reservation has been confirmed. Please proceed with the deposit payment.`;
          break;
        case 'REJECTED':
          notificationTitle = `Reservation ${reservation.reservationNo} Rejected`;
          notificationMessage = `Unfortunately, your reservation could not be confirmed. Reason: ${reason}`;
          break;
        case 'IN_PROGRESS':
          notificationTitle = `Reservation ${reservation.reservationNo} In Progress`;
          notificationMessage = `Your rental period has started. Enjoy your equipment!`;
          break;
        case 'COMPLETED':
          notificationTitle = `Reservation ${reservation.reservationNo} Completed`;
          notificationMessage = `Thank you for your rental! We hope to serve you again.`;
          break;
        case 'CANCELLED':
          notificationTitle = `Reservation ${reservation.reservationNo} Cancelled`;
          notificationMessage = `Your reservation has been cancelled. ${reason || ''}`;
          break;
      }

      await (NotificationService as any).sendNotification({
        companyId: reservation.companyId,
        type: 'RESERVATION',
        userId: reservation.customerId || undefined,
        title: notificationTitle,
        message: notificationMessage,
        priority: 'HIGH',
        metadata: JSON.stringify({
          reservationId: reservation.id,
          reservationNo: reservation.reservationNo,
          oldStatus,
          newStatus,
        }),
      });

      // Send email
      if (reservation.customerEmail) {
        await (NotificationService as any).sendEmail({
          to: reservation.customerEmail,
          templateId: 'RESERVATION_STATUS_CHANGED',
          variables: {
            customerName: reservation.customerName,
            reservationNo: reservation.reservationNo,
            oldStatus,
            newStatus,
            reason: reason || 'N/A',
          },
        });
      }
    } catch (notifError) {
      console.error('Failed to send status change notification:', notifError);
    }

    return updated;
  }

  /**
   * Record a payment for reservation
   */
  async recordPayment(data: {
    reservationId: number;
    amount: number;
    paymentType: string; // DEPOSIT, PARTIAL, FULL, REFUND
    paymentMethod: string; // CASH, CARD, TRANSFER, ONLINE
    transactionId?: string;
    cardLastFour?: string;
    cardBrand?: string;
    transferRef?: string;
    bankName?: string;
    paidBy?: string;
    receivedBy?: number;
    receiptNumber?: string;
    notes?: string;
  }): Promise<any> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // Create payment record
    const payment = await p.reservationPayment.create({
      data: {
        reservationId: data.reservationId,
        amount: data.amount,
        paymentType: data.paymentType,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        cardLastFour: data.cardLastFour,
        cardBrand: data.cardBrand,
        transferRef: data.transferRef,
        bankName: data.bankName,
        paidBy: data.paidBy,
        receivedBy: data.receivedBy,
        receiptNumber: data.receiptNumber,
        notes: data.notes,
        status: 'COMPLETED',
      },
    });

    // Update reservation payment status
    const updateData: any = {};

    if (data.paymentType === 'DEPOSIT') {
      updateData.depositPaid = true;
      updateData.depositPaidAt = new Date();
      updateData.depositMethod = data.paymentMethod;
    }

    if (data.paymentType === 'FULL') {
      updateData.fullPayment = true;
      updateData.fullPaymentAt = new Date();
      updateData.fullPaymentMethod = data.paymentMethod;
      updateData.depositPaid = true;
      updateData.depositPaidAt = updateData.depositPaidAt || new Date();
    }

    await p.reservation.update({
      where: { id: data.reservationId },
      data: updateData,
    });

    // Send payment confirmation
    try {
      await (NotificationService as any).sendNotification({
        companyId: reservation.companyId,
        type: 'PAYMENT',
        userId: reservation.customerId || undefined,
        title: `Payment Received - ${reservation.reservationNo}`,
        message: `Payment of ${data.amount.toFixed(2)} TL received for your reservation.`,
        priority: 'NORMAL',
        metadata: JSON.stringify({
          reservationId: reservation.id,
          paymentId: payment.id,
          amount: data.amount,
          paymentType: data.paymentType,
        }),
      });
    } catch (notifError) {
      console.error('Failed to send payment notification:', notifError);
    }

    return payment;
  }

  /**
   * Get reservation by ID
   */
  async getReservation(reservationId: number): Promise<any> {
    return await p.reservation.findUnique({
      where: { id: reservationId },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get all reservations with filters
   */
  async getReservations(params: {
    companyId: number;
    customerId?: number;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    reservations: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      companyId: params.companyId,
    };

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.startDate || params.endDate) {
      where.AND = [];
      if (params.startDate) {
        where.AND.push({ startDate: { gte: params.startDate } });
      }
      if (params.endDate) {
        where.AND.push({ endDate: { lte: params.endDate } });
      }
    }

    if (params.search) {
      where.OR = [
        { reservationNo: { contains: params.search } },
        { customerName: { contains: params.search } },
        { customerEmail: { contains: params.search } },
        { customerPhone: { contains: params.search } },
      ];
    }

    const [reservations, total] = await Promise.all([
      p.reservation.findMany({
        where,
        include: {
          items: true,
          _count: {
            select: {
              payments: true,
              statusHistory: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      p.reservation.count({ where }),
    ]);

    return {
      reservations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update reservation
   */
  async updateReservation(
    reservationId: number,
    data: {
      customerName?: string;
      customerEmail?: string;
      customerPhone?: string;
      customerAddress?: string;
      startDate?: Date;
      endDate?: Date;
      pickupTime?: string;
      returnTime?: string;
      pickupLocation?: string;
      returnLocation?: string;
      deliveryRequired?: boolean;
      deliveryAddress?: string;
      deliveryFee?: number;
      notes?: string;
      internalNotes?: string;
      specialRequests?: string;
      items?: {
        equipmentId: number;
        quantity: number;
      }[];
    }
  ): Promise<any> {
    const reservation = await p.reservation.findUnique({
      where: { id: reservationId },
      include: { items: true },
    });

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    // If dates or items are being changed, recalculate pricing
    if (data.startDate || data.endDate || data.items) {
      const startDate = data.startDate || reservation.startDate;
      const endDate = data.endDate || reservation.endDate;
      const items =
        data.items ||
        reservation.items.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity,
        }));

      // Check availability
      const availability = await this.checkBulkAvailability(
        items,
        startDate,
        endDate,
        reservationId
      );

      if (!availability.allAvailable) {
        throw new Error('Some equipment is not available for the new dates');
      }

      // Recalculate pricing
      const pricing = await this.calculateReservationPrice(
        reservation.companyId,
        items,
        startDate,
        endDate,
        reservation.discountCode || undefined
      );

      // Update reservation with new pricing
      const updated = await p.reservation.update({
        where: { id: reservationId },
        data: {
          ...data,
          subtotal: pricing.subtotal,
          discountAmount: pricing.discountAmount,
          taxAmount: pricing.taxAmount,
          totalAmount: pricing.totalAmount,
          depositAmount: pricing.totalAmount * 0.3,
          remainingAmount: pricing.totalAmount * 0.7,
          items: data.items
            ? {
                deleteMany: {},
                create: pricing.items.map((item) => ({
                  equipmentId: item.equipmentId,
                  equipmentName: item.equipmentName,
                  equipmentCode: item.equipmentCode,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  pricingType: item.pricingType,
                  duration: item.duration,
                  itemDiscount: item.itemDiscount,
                  subtotal: item.subtotal,
                  totalPrice: item.totalPrice,
                })),
              }
            : undefined,
        },
        include: {
          items: true,
          statusHistory: true,
          payments: true,
        },
      });

      return updated;
    }

    // Simple update without pricing recalculation
      return await p.reservation.update({
      where: { id: reservationId },
      data,
      include: {
        items: true,
        statusHistory: true,
        payments: true,
      },
    });
  }

  /**
   * Delete/Cancel reservation
   */
  async cancelReservation(
    reservationId: number,
    userId?: number,
    reason?: string
  ): Promise<any> {
    return await this.updateReservationStatus(
      reservationId,
      'CANCELLED',
      userId,
      reason
    );
  }

  /**
   * Get reservation statistics
   */
  async getReservationStats(params: {
    companyId: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const where: any = {
      companyId: params.companyId,
    };

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = params.startDate;
      }
      if (params.endDate) {
        where.createdAt.lte = params.endDate;
      }
    }

    const [
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      rejected,
      totalRevenue,
      paidDeposits,
      fullPayments,
    ] = await Promise.all([
      p.reservation.count({ where }),
      p.reservation.count({ where: { ...where, status: 'PENDING' } }),
      p.reservation.count({ where: { ...where, status: 'CONFIRMED' } }),
      p.reservation.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      p.reservation.count({ where: { ...where, status: 'COMPLETED' } }),
      p.reservation.count({ where: { ...where, status: 'CANCELLED' } }),
      p.reservation.count({ where: { ...where, status: 'REJECTED' } }),
      p.reservation.aggregate({
        where: { ...where, status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] } },
        _sum: { totalAmount: true },
      }),
      p.reservation.count({ where: { ...where, depositPaid: true } }),
      p.reservation.count({ where: { ...where, fullPayment: true } }),
    ]);

    return {
      total,
      byStatus: {
        pending,
        confirmed,
        inProgress,
        completed,
        cancelled,
        rejected,
      },
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
        paidDeposits,
        fullPayments,
      },
    };
  }

  /**
   * Get timeline data for Gantt chart view
   * Returns equipment list with their reservations
   */
  async getTimeline(params: {
    companyId: number;
    startDate?: Date;
    endDate?: Date;
    equipmentIds?: number[];
    status?: string;
  }): Promise<any> {
    try {
      // Default to current month if no dates provided
      const now = new Date();
      const startDate = params.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = params.endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Build equipment filter
      const equipmentWhere: any = {
        companyId: params.companyId,
      };

      if (params.equipmentIds && params.equipmentIds.length > 0) {
        equipmentWhere.id = { in: params.equipmentIds };
      }

      // Get all equipment
      const equipment = await p.equipment.findMany({
        where: equipmentWhere,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' },
        ],
        include: {
          _count: {
            select: {
              reservationItems: true,
            },
          },
        },
      });

      // Build reservation filter
      const reservationWhere: any = {
        companyId: params.companyId,
        OR: [
          // Reservations that start within the range
          {
            startDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          // Reservations that end within the range
          {
            endDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          // Reservations that span the entire range
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      };

      if (params.status) {
        reservationWhere.status = params.status;
      }

      // Get all reservations in date range
      const reservations = await p.reservation.findMany({
        where: reservationWhere,
        include: {
          items: {
            include: {
              equipment: true,
            },
          },
        },
        orderBy: {
          startDate: 'asc',
        },
      });

      // Build timeline data structure
      const timeline = equipment.map((equip) => {
        // Find all reservations for this equipment
        const equipmentReservations = reservations
          .filter((res) =>
            res.items.some((item) => item.equipmentId === equip.id)
          )
          .map((res) => {
            const item = res.items.find((i) => i.equipmentId === equip.id);
            return {
              id: res.id,
              reservationNo: res.reservationNo,
              customerName: res.customerName,
              customerEmail: res.customerEmail,
              customerPhone: res.customerPhone,
              startDate: res.startDate,
              endDate: res.endDate,
              status: res.status,
              quantity: item?.quantity || 1,
              totalAmount: res.totalAmount,
              depositPaid: res.depositPaid,
              fullPayment: res.fullPayment,
              notes: res.notes,
            };
          });

        // Calculate utilization
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const reservedDays = equipmentReservations.reduce((sum, res) => {
          const start = res.startDate < startDate ? startDate : res.startDate;
          const end = res.endDate > endDate ? endDate : res.endDate;
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);
        const utilization = totalDays > 0 ? (reservedDays / totalDays) * 100 : 0;

        return {
          equipmentId: equip.id,
          equipmentName: equip.name,
          equipmentCode: equip.code,
          equipmentCategory: equip.category,
          equipmentBrand: equip.brand,
          equipmentModel: equip.model,
          totalQuantity: equip.quantity,
          dailyPrice: equip.dailyPrice,
          reservations: equipmentReservations,
          reservationCount: equipmentReservations.length,
          utilization: Math.round(utilization * 100) / 100,
        };
      });

      return {
        startDate,
        endDate,
        totalEquipment: equipment.length,
        totalReservations: reservations.length,
        equipment: timeline,
      };
    } catch (error) {
      console.error('Get timeline error:', error);
      throw new Error('Failed to get timeline data');
    }
  }
}
