import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { initSocket } from './lib/socket';
import { prisma } from './lib/prisma';

// Routes
import authRouter from './routes/auth';
import roomsRouter from './routes/rooms';
import bookingsRouter from './routes/bookings';
import guestsRouter from './routes/guests';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import paymentsRouter from './routes/payments';
import paymentSlipsRouter from './routes/paymentSlips';
import usersRouter from './routes/users';
import roomCleaningRouter from './routes/roomCleaning';
import maintenanceRouter from './routes/maintenance';
import inventoryRouter from './routes/inventory';
import dashboardRouter from './routes/dashboard';
import settingsRouter from './routes/settings';
import auditLogsRouter from './routes/auditLogs';

const app = express();
const server = http.createServer(app);
const PORT = parseInt(process.env.PORT || '3002', 10);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
    // Allow configured FRONTEND_URL in production
    const allowed = process.env.FRONTEND_URL;
    if (allowed && origin === allowed) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'reachable', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(503).json({
      status: 'error',
      database: 'unreachable',
      message: error?.message || 'Database health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/payment-slips', paymentSlipsRouter);
app.use('/api/users', usersRouter);
app.use('/api/room-cleaning', roomCleaningRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/audit-logs', auditLogsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Yada Resort API running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
});
