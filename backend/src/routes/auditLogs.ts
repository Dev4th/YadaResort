import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 50), 100);
    const logs = await prisma.auditLog.findMany({
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            username: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return res.json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
