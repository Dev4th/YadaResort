import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', requireAuth, async (_req, res) => {
  try {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      occupiedRooms,
      availableRooms,
      pendingOrders,
      todayRevenueAgg,
      monthlyRevenueAgg,
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: { check_in: { gte: todayStart, lt: todayEnd }, status: 'confirmed' },
      }),
      prisma.booking.count({
        where: { check_out: { gte: todayStart, lt: todayEnd }, status: 'checked-in' },
      }),
      prisma.room.count({ where: { status: 'occupied' } }),
      prisma.room.count({ where: { status: 'available' } }),
      prisma.order.count({ where: { status: { not: 'paid' } } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'completed', created_at: { gte: todayStart, lt: todayEnd } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'completed', created_at: { gte: monthStart, lt: monthEnd } },
      }),
    ]);

    res.json({
      totalBookings,
      todayCheckIns,
      todayCheckOuts,
      occupiedRooms,
      availableRooms,
      pendingOrders,
      todayRevenue: Number(todayRevenueAgg._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenueAgg._sum.amount || 0),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
