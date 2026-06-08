import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { writeAuditLog } from '../lib/audit';

const router = Router();
const paymentMethods = ['cash', 'card', 'transfer', 'qr', 'promptpay'];
const paymentStatuses = ['pending', 'completed', 'failed', 'refunded'];

function validatePaymentPayload(body: any) {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) return 'amount must be greater than zero';
  if (!body.booking_id && !body.order_id) return 'booking_id or order_id is required';
  if (body.method && !paymentMethods.includes(body.method)) return 'Invalid payment method';
  if (body.status && !paymentStatuses.includes(body.status)) return 'Invalid payment status';
  return null;
}

// GET /api/payments
router.get('/', requireAuth, async (req, res) => {
  try {
    const { bookingId, orderId, dateFrom, dateTo } = req.query as Record<string, string>;
    const where: any = {};
    if (bookingId) where.booking_id = bookingId;
    if (orderId) where.order_id = orderId;
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at.gte = new Date(dateFrom);
      if (dateTo) where.created_at.lte = new Date(dateTo);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { booking: { select: { guest_name: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payments
router.post('/', async (req, res) => {
  try {
    const validationError = validatePaymentPayload(req.body);
    if (validationError) return res.status(400).json({ error: validationError });

    if (req.body.booking_id) {
      const booking = await prisma.booking.findUnique({ where: { id: req.body.booking_id } });
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
    }
    if (req.body.order_id) {
      const order = await prisma.order.findUnique({ where: { id: req.body.order_id } });
      if (!order) return res.status(404).json({ error: 'Order not found' });
    }

    const payment = await prisma.payment.create({
      data: {
        ...req.body,
        amount: Number(req.body.amount),
      },
    });
    await writeAuditLog({
      action: 'payment.created',
      tableName: 'payments',
      recordId: payment.id,
      newData: payment,
      ipAddress: req.ip,
    });
    return res.status(201).json(payment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/payments/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    if (req.body.amount !== undefined && Number(req.body.amount) <= 0) {
      return res.status(400).json({ error: 'amount must be greater than zero' });
    }
    if (req.body.method && !paymentMethods.includes(req.body.method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
    if (req.body.status && !paymentStatuses.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    const previous = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!previous) return res.status(404).json({ error: 'Not found' });

    const payment = await prisma.payment.update({ where: { id: req.params.id }, data: req.body });
    await writeAuditLog({
      userId: req.user?.userId,
      action: 'payment.updated',
      tableName: 'payments',
      recordId: payment.id,
      oldData: previous,
      newData: payment,
      ipAddress: req.ip,
    });
    return res.json(payment);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
