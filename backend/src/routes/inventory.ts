import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/inventory
router.get('/', requireAuth, async (req, res) => {
  try {
    const { productId } = req.query as Record<string, string>;
    const where: any = {};
    if (productId) where.product_id = productId;

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: { product: { select: { name: true, name_th: true, unit: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory  — adjust_stock equivalent
router.post('/', requireAuth, async (req, res) => {
  try {
    const { product_id, type, quantity, reason, reference } = req.body;

    // Record transaction
    const transaction = await prisma.inventoryTransaction.create({
      data: {
        product_id,
        type,
        quantity,
        reason,
        reference,
        created_by: req.user!.userId,
      },
    });

    // Adjust product stock
    const delta = type === 'in' ? quantity : type === 'out' ? -quantity : quantity; // adjustment sets absolute diff
    await prisma.product.update({
      where: { id: product_id },
      data: { stock: { increment: delta } },
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
