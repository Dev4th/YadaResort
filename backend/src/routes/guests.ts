import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/guests
router.get('/', requireAuth, async (_req, res) => {
  try {
    const guests = await prisma.guest.findMany({ orderBy: { created_at: 'desc' } });
    res.json(guests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/guests  — upsert by phone
router.post('/', async (req, res) => {
  try {
    const guestData = req.body;
    const existing = await prisma.guest.findUnique({ where: { phone: guestData.phone } });

    let guest;
    if (existing) {
      guest = await prisma.guest.update({ where: { phone: guestData.phone }, data: guestData });
    } else {
      guest = await prisma.guest.create({ data: guestData });
    }
    res.status(201).json(guest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/guests/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const guest = await prisma.guest.update({ where: { id: req.params.id }, data: req.body });
    res.json(guest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
