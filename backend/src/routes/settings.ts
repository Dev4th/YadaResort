import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/settings
router.get('/', async (_req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'main' } });
    res.json(settings?.data || {});
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings
router.put('/', requireAuth, async (req, res) => {
  try {
    const settings = await prisma.settings.upsert({
      where: { id: 'main' },
      update: { data: req.body, updated_at: new Date() },
      create: { id: 'main', data: req.body },
    });
    res.json(settings.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
