import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/maintenance
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, roomId, priority } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (roomId) where.room_id = roomId;
    if (priority) where.priority = priority;

    const records = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        room: { select: { name: true, name_th: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/maintenance
router.post('/', requireAuth, async (req, res) => {
  try {
    const record = await prisma.maintenanceRequest.create({
      data: req.body,
      include: { room: { select: { name: true, name_th: true } } },
    });
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/maintenance/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    if (data.status === 'completed' && !data.completed_at) data.completed_at = new Date();

    const record = await prisma.maintenanceRequest.update({
      where: { id: req.params.id },
      data,
    });
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/maintenance/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.maintenanceRequest.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
