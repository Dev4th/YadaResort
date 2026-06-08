import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', requireAuth, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, username: true, name: true, email: true,
        phone: true, role: true, permissions: true,
        is_active: true, status: true, last_login: true, created_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users
router.post('/', requireAuth, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const user = await prisma.user.create({
      data: { ...rest, password: hashedPassword },
      select: {
        id: true, username: true, name: true, email: true,
        phone: true, role: true, permissions: true,
        is_active: true, status: true, created_at: true,
      },
    });
    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const data: any = { ...rest };
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true, username: true, name: true, email: true,
        phone: true, role: true, permissions: true,
        is_active: true, status: true, created_at: true,
      },
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/password
router.patch('/:id/password', requireAuth, async (req, res) => {
  try {
    const { password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashed } });
    res.json({ message: 'Password updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'inactive', is_active: false } });
    res.json({ message: 'Deactivated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
