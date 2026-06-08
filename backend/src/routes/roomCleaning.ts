import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/room-cleaning
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, roomId } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (roomId) where.room_id = roomId;

    const records = await prisma.roomCleaning.findMany({
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

// POST /api/room-cleaning
router.post('/', requireAuth, async (req, res) => {
  try {
    const record = await prisma.roomCleaning.create({
      data: req.body,
      include: { room: { select: { name: true, name_th: true } } },
    });
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/room-cleaning/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const data = req.body;
    if (data.status === 'in_progress' && !data.started_at) data.started_at = new Date();
    if (data.status === 'completed' && !data.completed_at) data.completed_at = new Date();

    const record = await prisma.roomCleaning.update({ where: { id: req.params.id }, data });
    res.json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/room-cleaning/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.roomCleaning.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
