import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { getIO } from '../lib/socket';

const router = Router();

// GET /api/payment-slips
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, bookingId } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (bookingId) where.booking_id = bookingId;

    const slips = await prisma.paymentSlip.findMany({
      where,
      include: {
        booking: {
          select: {
            guest_name: true,
            guest_phone: true,
            total_amount: true,
            check_in: true,
            check_out: true,
            room: { select: { name: true, name_th: true } },
          },
        },
      },
      orderBy: { uploaded_at: 'desc' },
    });
    res.json(slips);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/payment-slips  — public (guest uploads slip)
router.post('/', async (req, res) => {
  try {
    const slip = await prisma.paymentSlip.create({ data: req.body });
    try {
      getIO().emit('payment-slip:created', {
        id: slip.id,
        booking_id: slip.booking_id,
        amount: slip.amount,
      });
    } catch { /* socket not ready */ }
    res.status(201).json(slip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/payment-slips/:id  — approve / reject
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const slip = await prisma.paymentSlip.update({
      where: { id: req.params.id },
      data: {
        status,
        notes,
        verified_at: new Date(),
        verified_by: req.user!.userId,
      },
    });

    // If approved, mark booking payment_status as paid
    if (status === 'approved' && slip.booking_id) {
      await prisma.booking.update({
        where: { id: slip.booking_id },
        data: { payment_status: 'paid' },
      });
    }
    res.json(slip);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
