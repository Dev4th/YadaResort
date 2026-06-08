import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/products
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { is_active: true },
      orderBy: { category: 'asc' },
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/all  — includes inactive (admin)
router.get('/all', requireAuth, async (_req, res) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { category: 'asc' } });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Not found' });
    return res.json(product);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/products
router.post('/', requireAuth, async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/products/:id/stock  — update_stock equivalent
router.patch('/:id/stock', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body as { quantity: number };
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock: product.stock + quantity },
    });
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { is_active: false } });
    res.json({ message: 'Deactivated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
