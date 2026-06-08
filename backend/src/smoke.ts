import 'dotenv/config';

const API_BASE = process.env.SMOKE_API_BASE || `http://localhost:${process.env.PORT || 1606}`;

async function request(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { response, body };
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Smoke testing ${API_BASE}`);

  const health = await request('/health');
  assert(health.response.ok && health.body?.status === 'ok', 'health check failed');

  const dbHealth = await request('/health/db');
  assert(dbHealth.response.ok && dbHealth.body?.database === 'reachable', 'database health check failed');

  const login = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  assert(login.response.ok && login.body?.token, 'admin login failed');
  const authHeader = { Authorization: `Bearer ${login.body.token}` };

  const invalidBooking = await request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
      room_id: 'missing',
      guest_name: 'Smoke Test',
      guest_phone: '0810000000',
      check_in: '2026-06-21',
      check_out: '2026-06-20',
      total_amount: 1000,
    }),
  });
  assert(invalidBooking.response.status === 400, 'invalid booking should return 400');

  const invalidPayment = await request('/api/payments', {
    method: 'POST',
    body: JSON.stringify({ booking_id: 'missing', amount: 0, method: 'cash' }),
  });
  assert(invalidPayment.response.status === 400, 'invalid payment should return 400');

  const auditLogs = await request('/api/audit-logs?limit=3', { headers: authHeader });
  assert(auditLogs.response.ok && Array.isArray(auditLogs.body), 'audit logs endpoint failed');

  console.log('Smoke tests passed');
}

main().catch((error) => {
  console.error('Smoke tests failed:', error);
  process.exit(1);
});
