import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({ orderBy: { price: 'asc' } });
    res.json(rooms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
router.get('/available', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query as { checkIn?: string; checkOut?: string };

    if (checkIn && checkOut) {
      const bookedRoomIds = await prisma.booking.findMany({
        where: {
          status: { in: ['pending', 'confirmed', 'checked-in'] },
          check_in: { lte: new Date(checkOut) },
          check_out: { gte: new Date(checkIn) },
        },
        select: { room_id: true },
      });
      const ids = bookedRoomIds.map((b) => b.room_id);

      const rooms = await prisma.room.findMany({
        where: {
          status: 'available',
          id: { notIn: ids },
        },
        orderBy: { price: 'asc' },
      });
      return res.json(rooms);
    }

    const rooms = await prisma.room.findMany({
      where: { status: 'available' },
      orderBy: { price: 'asc' },
    });
    return res.json(rooms);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms/availability/:roomId?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
router.get('/availability/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { checkIn, checkOut } = req.query as { checkIn: string; checkOut: string };

    const conflicts = await prisma.booking.findMany({
      where: {
        room_id: roomId,
        status: { in: ['pending', 'confirmed', 'checked-in'] },
        check_in: { lt: new Date(checkOut) },
        check_out: { gt: new Date(checkIn) },
      },
      select: { id: true, guest_name: true, check_in: true, check_out: true, status: true },
    });

    res.json({ available: conflicts.length === 0, conflictingBookings: conflicts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.id } });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    return res.json(room);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/rooms
router.post('/', requireAuth, async (req, res) => {
  try {
    const room = await prisma.room.create({ data: req.body });
    res.status(201).json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/rooms/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/rooms/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(room);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/rooms/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
