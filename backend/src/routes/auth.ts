import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 8;

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอก username และ password' });
    }

    const attemptKey = `${req.ip || req.socket.remoteAddress || 'unknown'}:${String(username).toLowerCase()}`;
    const now = Date.now();
    const attempt = loginAttempts.get(attemptKey);

    if (attempt && now - attempt.firstAttempt < LOGIN_WINDOW_MS && attempt.count >= LOGIN_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่' });
    }

    const recordFailedAttempt = () => {
      const current = loginAttempts.get(attemptKey);
      const next =
        current && now - current.firstAttempt < LOGIN_WINDOW_MS
          ? { count: current.count + 1, firstAttempt: current.firstAttempt }
          : { count: 1, firstAttempt: now };
      loginAttempts.set(attemptKey, next);
    };

    const user = await prisma.user.findFirst({
      where: { username, status: 'active' },
    });

    if (!user) {
      recordFailedAttempt();
      return res.status(401).json({ error: 'ไม่พบผู้ใช้งานนี้' });
    }

    // Check password: support bcrypt hashed (starts with $2) and plain text (for migration)
    let passwordMatch = false;
    if (user.password) {
      if (user.password.startsWith('$2')) {
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // Plain text - direct compare (legacy)
        passwordMatch = user.password === password;
      }
    }

    if (!passwordMatch) {
      recordFailedAttempt();
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }

    loginAttempts.delete(attemptKey);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret is not configured' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
      jwtSecret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
    );

    const { password: _pw, ...userData } = user;
    return res.json({
      token,
      user: userData,
    });
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (_req, res) => {
  // JWT is stateless; client should discard token
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me  — verify current token & return fresh user data
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    });
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Session invalid' });
    }
    const { password: _pw, ...userData } = user;
    return res.json(userData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
