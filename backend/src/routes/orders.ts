import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { getIO } from '../lib/socket';

const router = Router();

function emitOrderUpdate(event: string, data: any) {
  try { getIO().emit(event, data); } catch { /* socket not ready */ }
}

// GET /api/orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, bookingId } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (bookingId) where.booking_id = bookingId;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Not found' });
    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/orders
router.post('/', requireAuth, async (req, res) => {
  try {
    const orderData = req.body;
    const items: Array<{ product_id: string; quantity: number; product_name: string; price: number; total: number }> = orderData.items || [];

    // Create order
    const order = await prisma.order.create({ data: orderData });

    // Decrease stock for each item (decrease_stock equivalent)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.product_id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    emitOrderUpdate('order:created', order);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status, updated_at: new Date() },
    });
    emitOrderUpdate('order:updated', { ...order, newStatus: status });
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const order = await prisma.order.update({ where: { id: req.params.id }, data: req.body });
    emitOrderUpdate('order:updated', order);
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
