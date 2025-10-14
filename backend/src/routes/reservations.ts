import express from 'express';
import { ReservationService } from '../services/ReservationService';

const router = express.Router();
const reservationService = new ReservationService();

/**
 * POST /api/reservations/check-availability
 * Check equipment availability for date range
 */
router.post('/check-availability', async (req, res) => {
  try {
    const { equipmentId, startDate, endDate, quantity, excludeReservationId } =
      req.body;

    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID, start date, and end date are required',
      });
    }

    const availability = await reservationService.checkAvailability(
      parseInt(equipmentId),
      new Date(startDate),
      new Date(endDate),
      excludeReservationId ? parseInt(excludeReservationId) : undefined
    );

    const requestedQuantity = quantity || 1;
    const canReserve = availability.availableQuantity >= requestedQuantity;

    res.json({
      success: true,
      available: canReserve,
      availableQuantity: availability.availableQuantity,
      requestedQuantity,
      conflicts: availability.conflicts,
    });
  } catch (error: any) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check availability',
    });
  }
});

/**
 * POST /api/reservations/check-bulk-availability
 * Check availability for multiple equipment items
 */
router.post('/check-bulk-availability', async (req, res) => {
  try {
    const { items, startDate, endDate, excludeReservationId } = req.body;

    if (!items || !Array.isArray(items) || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Items array, start date, and end date are required',
      });
    }

    const availability = await reservationService.checkBulkAvailability(
      items.map((item: any) => ({
        equipmentId: parseInt(item.equipmentId),
        quantity: parseInt(item.quantity) || 1,
      })),
      new Date(startDate),
      new Date(endDate),
      excludeReservationId ? parseInt(excludeReservationId) : undefined
    );

    res.json({
      success: true,
      ...availability,
    });
  } catch (error: any) {
    console.error('Check bulk availability error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to check availability',
    });
  }
});

/**
 * POST /api/reservations/calculate-price
 * Calculate pricing for reservation
 */
router.post('/calculate-price', async (req, res) => {
  try {
    const { companyId, items, startDate, endDate, discountCode } = req.body;

    if (!companyId || !items || !Array.isArray(items) || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, items, start date, and end date are required',
      });
    }

    const pricing = await reservationService.calculateReservationPrice(
      parseInt(companyId),
      items.map((item: any) => ({
        equipmentId: parseInt(item.equipmentId),
        quantity: parseInt(item.quantity) || 1,
      })),
      new Date(startDate),
      new Date(endDate),
      discountCode
    );

    res.json({
      success: true,
      ...pricing,
    });
  } catch (error: any) {
    console.error('Calculate price error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate price',
    });
  }
});

/**
 * POST /api/reservations
 * Create a new reservation
 */
router.post('/', async (req, res) => {
  try {
    const {
      companyId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      startDate,
      endDate,
      pickupTime,
      returnTime,
      pickupLocation,
      returnLocation,
      deliveryRequired,
      deliveryAddress,
      deliveryFee,
      discountCode,
      notes,
      specialRequests,
      createdBy,
      autoApprove,
    } = req.body;

    // Validation
    if (!companyId || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'Company ID, customer name, email, and phone are required',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one equipment item is required',
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required',
      });
    }

    const reservation = await reservationService.createReservation({
      companyId: parseInt(companyId),
      customerId: customerId ? parseInt(customerId) : undefined,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items: items.map((item: any) => ({
        equipmentId: parseInt(item.equipmentId),
        quantity: parseInt(item.quantity) || 1,
      })),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      pickupTime,
      returnTime,
      pickupLocation,
      returnLocation,
      deliveryRequired,
      deliveryAddress,
      deliveryFee: deliveryFee ? parseFloat(deliveryFee) : undefined,
      discountCode,
      notes,
      specialRequests,
      createdBy: createdBy ? parseInt(createdBy) : undefined,
      autoApprove,
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation,
    });
  } catch (error: any) {
    console.error('Create reservation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create reservation',
    });
  }
});

/**
 * GET /api/reservations
 * Get all reservations with filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      companyId,
      customerId,
      status,
      startDate,
      endDate,
      search,
      page,
      limit,
    } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required',
      });
    }

    const result = await reservationService.getReservations({
      companyId: parseInt(companyId as string),
      customerId: customerId ? parseInt(customerId as string) : undefined,
      status: status as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Get reservations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get reservations',
    });
  }
});

/**
 * GET /api/reservations/:id
 * Get reservation by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await reservationService.getReservation(parseInt(id));

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    res.json({
      success: true,
      reservation,
    });
  } catch (error: any) {
    console.error('Get reservation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get reservation',
    });
  }
});

/**
 * PUT /api/reservations/:id
 * Update reservation
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      startDate,
      endDate,
      pickupTime,
      returnTime,
      pickupLocation,
      returnLocation,
      deliveryRequired,
      deliveryAddress,
      deliveryFee,
      notes,
      internalNotes,
      specialRequests,
      items,
    } = req.body;

    const reservation = await reservationService.updateReservation(parseInt(id), {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      pickupTime,
      returnTime,
      pickupLocation,
      returnLocation,
      deliveryRequired,
      deliveryAddress,
      deliveryFee: deliveryFee ? parseFloat(deliveryFee) : undefined,
      notes,
      internalNotes,
      specialRequests,
      items: items
        ? items.map((item: any) => ({
            equipmentId: parseInt(item.equipmentId),
            quantity: parseInt(item.quantity) || 1,
          }))
        : undefined,
    });

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      reservation,
    });
  } catch (error: any) {
    console.error('Update reservation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update reservation',
    });
  }
});

/**
 * POST /api/reservations/:id/status
 * Update reservation status
 */
router.post('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId, reason, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'REJECTED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const reservation = await reservationService.updateReservationStatus(
      parseInt(id),
      status,
      userId ? parseInt(userId) : undefined,
      reason,
      notes
    );

    res.json({
      success: true,
      message: 'Reservation status updated successfully',
      reservation,
    });
  } catch (error: any) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update status',
    });
  }
});

/**
 * POST /api/reservations/:id/approve
 * Approve a reservation
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, notes } = req.body;

    const reservation = await reservationService.updateReservationStatus(
      parseInt(id),
      'CONFIRMED',
      userId ? parseInt(userId) : undefined,
      'Reservation approved',
      notes
    );

    res.json({
      success: true,
      message: 'Reservation approved successfully',
      reservation,
    });
  } catch (error: any) {
    console.error('Approve reservation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to approve reservation',
    });
  }
});

/**
 * POST /api/reservations/:id/reject
 * Reject a reservation
 */
router.post('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const reservation = await reservationService.updateReservationStatus(
      parseInt(id),
      'REJECTED',
      userId ? parseInt(userId) : undefined,
      reason
    );

    res.json({
      success: true,
      message: 'Reservation rejected successfully',
      reservation,
    });
  } catch (error: any) {
    console.error('Reject reservation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject reservation',
    });
  }
});

/**
 * POST /api/reservations/:id/cancel
 * Cancel a reservation
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, reason } = req.body;

    const reservation = await reservationService.cancelReservation(
      parseInt(id),
      userId ? parseInt(userId) : undefined,
      reason
    );

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error: any) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel reservation',
    });
  }
});

/**
 * POST /api/reservations/:id/payments
 * Record a payment for reservation
 */
router.post('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      paymentType,
      paymentMethod,
      transactionId,
      cardLastFour,
      cardBrand,
      transferRef,
      bankName,
      paidBy,
      receivedBy,
      receiptNumber,
      notes,
    } = req.body;

    if (!amount || !paymentType || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Amount, payment type, and payment method are required',
      });
    }

    const validPaymentTypes = ['DEPOSIT', 'PARTIAL', 'FULL', 'REFUND'];
    if (!validPaymentTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment type. Must be one of: ${validPaymentTypes.join(', ')}`,
      });
    }

    const validPaymentMethods = ['CASH', 'CARD', 'TRANSFER', 'ONLINE', 'CHECK'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`,
      });
    }

    const payment = await reservationService.recordPayment({
      reservationId: parseInt(id),
      amount: parseFloat(amount),
      paymentType,
      paymentMethod,
      transactionId,
      cardLastFour,
      cardBrand,
      transferRef,
      bankName,
      paidBy,
      receivedBy: receivedBy ? parseInt(receivedBy) : undefined,
      receiptNumber,
      notes,
    });

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error: any) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record payment',
    });
  }
});

/**
 * GET /api/reservations/:id/payments
 * Get all payments for a reservation
 */
router.get('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await reservationService.getReservation(parseInt(id));

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    res.json({
      success: true,
      payments: reservation.payments || [],
    });
  } catch (error: any) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payments',
    });
  }
});

/**
 * GET /api/reservations/stats
 * Get reservation statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required',
      });
    }

    const stats = await reservationService.getReservationStats({
      companyId: parseInt(companyId as string),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get statistics',
    });
  }
});

/**
 * GET /api/reservations/timeline
 * Get timeline data for Gantt chart view
 */
router.get('/timeline', async (req, res) => {
  try {
    const { companyId, startDate, endDate, equipmentIds, status } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required',
      });
    }

    const timeline = await reservationService.getTimeline({
      companyId: parseInt(companyId as string),
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      equipmentIds: equipmentIds
        ? (equipmentIds as string).split(',').map((id) => parseInt(id))
        : undefined,
      status: status as string | undefined,
    });

    res.json({
      success: true,
      timeline,
    });
  } catch (error: any) {
    console.error('Get timeline error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get timeline data',
    });
  }
});

export default router;
