import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { getIO } from '../lib/socket';
import { writeAuditLog } from '../lib/audit';

const router = Router();

function emitBookingUpdate(event: string, data: any) {
  try { getIO().emit(event, data); } catch { /* socket not ready */ }
}

const activeBookingStatuses = ['pending', 'confirmed', 'checked-in'];
const bookingStatuses = ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'partial', 'refunded'];

function parseStayDates(checkIn: unknown, checkOut: unknown) {
  const inDate = typeof checkIn === 'string' ? new Date(checkIn) : null;
  const outDate = typeof checkOut === 'string' ? new Date(checkOut) : null;

  if (!inDate || !outDate || Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    return { error: 'Invalid check-in or check-out date' };
  }

  if (outDate <= inDate) {
    return { error: 'Check-out date must be after check-in date' };
  }

  return { checkInDate: inDate, checkOutDate: outDate };
}

async function findConflictingBooking(roomId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string) {
  return prisma.booking.findFirst({
    where: {
      room_id: roomId,
      status: { in: activeBookingStatuses },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      AND: [
        { check_in: { lt: checkOut } },
        { check_out: { gt: checkIn } },
      ],
    },
    select: { id: true, check_in: true, check_out: true, status: true },
  });
}

// GET /api/bookings
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query as Record<string, string>;

    const where: any = {};
    if (status) where.status = status;
    if (dateFrom) where.check_in = { ...(where.check_in || {}), gte: new Date(dateFrom) };
    if (dateTo) where.check_out = { ...(where.check_out || {}), lte: new Date(dateTo) };

    const bookings = await prisma.booking.findMany({
      where,
      include: { room: { select: { name_th: true, price: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: { room: true },
    });
    if (!booking) return res.status(404).json({ error: 'Not found' });
    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/bookings/by-phone/:phone  — public, used by CheckBookingPage
router.get('/by-phone/:phone', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { guest_phone: req.params.phone },
      include: { room: true, payment_slips: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/bookings  — public (guest makes booking)
router.post('/', async (req, res) => {
  try {
    const { check_in, check_out, room_id, guest_name, guest_phone, adults, children, total_amount, ...rest } = req.body;
    const parsedDates = parseStayDates(check_in, check_out);
    if (parsedDates.error || !parsedDates.checkInDate || !parsedDates.checkOutDate) {
      return res.status(400).json({ error: parsedDates.error });
    }

    if (!room_id || !guest_name || !guest_phone) {
      return res.status(400).json({ error: 'room_id, guest_name, and guest_phone are required' });
    }

    const room = await prisma.room.findUnique({ where: { id: room_id } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.status === 'maintenance') {
      return res.status(409).json({ error: 'Room is under maintenance' });
    }

    const guestCount = Number(adults || 1) + Number(children || 0);
    if (guestCount > room.capacity) {
      return res.status(400).json({ error: `Room capacity is ${room.capacity} guests` });
    }

    const conflict = await findConflictingBooking(room_id, parsedDates.checkInDate, parsedDates.checkOutDate);
    if (conflict) {
      return res.status(409).json({ error: 'Room is not available for the selected dates', conflict });
    }

    const amount = Number(total_amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'total_amount must be greater than zero' });
    }

    const booking = await prisma.booking.create({
      data: {
        ...rest,
        room_id,
        guest_name,
        guest_phone,
        adults: Number(adults || 1),
        children: Number(children || 0),
        total_amount: amount,
        check_in: parsedDates.checkInDate,
        check_out: parsedDates.checkOutDate,
      },
      include: { room: { select: { name_th: true, price: true } } },
    });
    await writeAuditLog({
      action: 'booking.created',
      tableName: 'bookings',
      recordId: booking.id,
      newData: booking,
      ipAddress: req.ip,
    });
    emitBookingUpdate('booking:created', booking);
    return res.status(201).json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, payment_status, payment_method } = req.body;
    if (status !== undefined && !bookingStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }
    if (payment_status !== undefined && !paymentStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }

    const previous = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!previous) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updateData: any = { updated_at: new Date() };
    if (status !== undefined) updateData.status = status;
    if (payment_status !== undefined) updateData.payment_status = payment_status;
    if (payment_method !== undefined) updateData.payment_method = payment_method;

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: updateData,
    });

    // Update room status based on booking status
    const roomStatusMap: Record<string, string> = {
      'checked-in': 'occupied',
      'checked-out': 'cleaning',
      'cancelled': 'available',
    };
    if (status && roomStatusMap[status]) {
      await prisma.room.update({
        where: { id: booking.room_id },
        data: { status: roomStatusMap[status] },
      });
    }

    emitBookingUpdate('booking:updated', { ...booking, newStatus: status });
    await writeAuditLog({
      userId: req.user?.userId,
      action: 'booking.status_updated',
      tableName: 'bookings',
      recordId: booking.id,
      oldData: previous,
      newData: booking,
      ipAddress: req.ip,
    });
    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/bookings/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { check_in, check_out, ...rest } = req.body;
    const previous = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!previous) return res.status(404).json({ error: 'Not found' });

    const data: any = { ...rest };
    if (check_in) data.check_in = new Date(check_in);
    if (check_out) data.check_out = new Date(check_out);

    const nextCheckIn = data.check_in || previous.check_in;
    const nextCheckOut = data.check_out || previous.check_out;
    const nextRoomId = data.room_id || previous.room_id;
    if (nextCheckOut <= nextCheckIn) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }
    const conflict = await findConflictingBooking(nextRoomId, nextCheckIn, nextCheckOut, req.params.id);
    if (conflict) {
      return res.status(409).json({ error: 'Room is not available for the selected dates', conflict });
    }

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data,
    });
    emitBookingUpdate('booking:updated', booking);
    await writeAuditLog({
      userId: req.user?.userId,
      action: 'booking.updated',
      tableName: 'bookings',
      recordId: booking.id,
      oldData: previous,
      newData: booking,
      ipAddress: req.ip,
    });
    return res.json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const previous = await prisma.booking.delete({ where: { id: req.params.id } });
    await writeAuditLog({
      userId: req.user?.userId,
      action: 'booking.deleted',
      tableName: 'bookings',
      recordId: previous.id,
      oldData: previous,
      ipAddress: req.ip,
    });
    return res.json({ message: 'Deleted' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
