import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEMO = '[seed-demo]';

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function dateOnly(d: Date) {
  return new Date(d.toISOString().slice(0, 10));
}

async function ensureRoom(data: {
  name: string;
  name_th: string;
  description: string;
  description_th: string;
  price: number;
  size: number;
  capacity: number;
  amenities: string[];
  images: string[];
  status: string;
  bed_type: string;
  view: string;
}) {
  const existing = await prisma.room.findFirst({ where: { name: data.name } });
  if (existing) {
    return prisma.room.update({ where: { id: existing.id }, data: { status: data.status, price: data.price } });
  }
  return prisma.room.create({ data });
}

async function ensureGuest(data: {
  name: string;
  phone: string;
  email?: string;
  total_visits?: number;
  notes?: string;
}) {
  return prisma.guest.upsert({
    where: { phone: data.phone },
    update: {
      name: data.name,
      email: data.email,
      total_visits: data.total_visits ?? 1,
      notes: data.notes,
    },
    create: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      total_visits: data.total_visits ?? 1,
      notes: data.notes,
    },
  });
}

async function ensureProduct(data: {
  name: string;
  name_th: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
}) {
  const existing = await prisma.product.findFirst({ where: { name: data.name } });
  if (existing) {
    return prisma.product.update({ where: { id: existing.id }, data: { stock: data.stock, price: data.price } });
  }
  return prisma.product.create({ data: { ...data, is_active: true } });
}

async function main() {
  console.log('🌱 Seeding database...\n');

  const adminPw = await bcrypt.hash('admin123', 10);
  const ownerPw = await bcrypt.hash('owner123', 10);
  const receptionPw = await bcrypt.hash('reception123', 10);
  const staffPw = await bcrypt.hash('staff123', 10);

  const adminPerms = [
    'dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage',
    'orders_manage', 'products_manage', 'reports_view', 'users_manage', 'settings_manage',
  ];

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: adminPw, status: 'active', permissions: adminPerms },
    create: {
      username: 'admin',
      name: 'ผู้ดูแลระบบ',
      email: 'admin@yadahomestay.com',
      phone: '081-234-5678',
      role: 'admin',
      password: adminPw,
      status: 'active',
      permissions: adminPerms,
    },
  });

  await prisma.user.upsert({
    where: { username: 'owner' },
    update: { password: ownerPw, status: 'active' },
    create: {
      username: 'owner',
      name: 'คุณยาดา',
      email: 'owner@yadahomestay.com',
      phone: '081-234-5679',
      role: 'owner',
      password: ownerPw,
      status: 'active',
      permissions: adminPerms,
    },
  });

  const reception = await prisma.user.upsert({
    where: { username: 'reception' },
    update: { password: receptionPw, status: 'active' },
    create: {
      username: 'reception',
      name: 'พนักงานต้อนรับ',
      email: 'reception@yadahomestay.com',
      phone: '081-234-5680',
      role: 'receptionist',
      password: receptionPw,
      status: 'active',
      permissions: ['dashboard_view', 'bookings_manage', 'guests_manage', 'orders_manage'],
    },
  });

  await prisma.user.upsert({
    where: { username: 'staff' },
    update: { password: staffPw, status: 'active' },
    create: {
      username: 'staff',
      name: 'พนักงานทั่วไป',
      email: 'staff@yadahomestay.com',
      phone: '081-234-5681',
      role: 'staff',
      password: staffPw,
      status: 'active',
      permissions: ['dashboard_view', 'orders_manage'],
    },
  });
  console.log('✅ Users (admin/owner/reception/staff)');

  const today = dateOnly(new Date());

  const standard = await ensureRoom({
    name: 'Standard Room 101',
    name_th: 'ห้องสแตนดาร์ด 101',
    description: 'Cozy room with garden view',
    description_th: 'ห้องพักสะดวกสบาย วิวสวน',
    price: 1200,
    size: 24,
    capacity: 2,
    amenities: ['wifi', 'aircon', 'tv'],
    images: ['/images/room-standard.jpg'],
    status: 'occupied',
    bed_type: 'Double',
    view: 'Garden',
  });

  const deluxe = await ensureRoom({
    name: 'Deluxe Room 201',
    name_th: 'ห้องดีลักซ์ 201',
    description: 'Spacious room with balcony',
    description_th: 'ห้องกว้างพร้อมระเบียง',
    price: 1800,
    size: 32,
    capacity: 2,
    amenities: ['wifi', 'aircon', 'tv', 'balcony', 'minibar'],
    images: ['/images/room-deluxe.jpg'],
    status: 'cleaning',
    bed_type: 'King',
    view: 'Pool',
  });

  const family = await ensureRoom({
    name: 'Family Suite 301',
    name_th: 'ห้องครอบครัว 301',
    description: 'Perfect for families',
    description_th: 'เหมาะสำหรับครอบครัว',
    price: 2500,
    size: 48,
    capacity: 4,
    amenities: ['wifi', 'aircon', 'tv', 'balcony', 'kitchenette'],
    images: ['/images/room-family.jpg'],
    status: 'available',
    bed_type: 'Twin + Sofa',
    view: 'Mountain',
  });

  const villa = await ensureRoom({
    name: 'Pool Villa 401',
    name_th: 'พูลวิลล่า 401',
    description: 'Private pool villa',
    description_th: 'วิลล่าส่วนตัวพร้อมสระว่ายน้ำ',
    price: 4500,
    size: 65,
    capacity: 2,
    amenities: ['wifi', 'aircon', 'tv', 'pool', 'kitchen'],
    images: ['/images/room-villa.jpg'],
    status: 'maintenance',
    bed_type: 'King',
    view: 'Private Pool',
  });

  const superior = await ensureRoom({
    name: 'Superior Room 102',
    name_th: 'ห้องซูพีเรียร์ 102',
    description: 'Upgraded comfort room',
    description_th: 'ห้องพักระดับสูง',
    price: 1500,
    size: 28,
    capacity: 2,
    amenities: ['wifi', 'aircon', 'tv', 'desk'],
    images: ['/images/room-standard.jpg'],
    status: 'available',
    bed_type: 'Queen',
    view: 'Garden',
  });
  console.log('✅ Rooms (5)');

  const products = await Promise.all([
    ensureProduct({ name: 'Coca Cola', name_th: 'โคคา-โคล่า', category: 'beverage', price: 35, cost: 15, stock: 50, unit: 'ขวด' }),
    ensureProduct({ name: 'Mineral Water', name_th: 'น้ำแร่', category: 'beverage', price: 25, cost: 8, stock: 3, unit: 'ขวด' }),
    ensureProduct({ name: 'Beer Chang', name_th: 'เบียร์ช้าง', category: 'alcohol', price: 70, cost: 35, stock: 40, unit: 'ขวด' }),
    ensureProduct({ name: 'Pringles', name_th: 'พริงเกิลส์', category: 'snack', price: 65, cost: 35, stock: 2, unit: 'กระป๋อง' }),
    ensureProduct({ name: "Lay's Chips", name_th: 'เลย์', category: 'snack', price: 35, cost: 18, stock: 30, unit: 'ถุง' }),
  ]);
  console.log('✅ Products (5, รวมสต็อกต่ำ)');

  await prisma.settings.upsert({
    where: { id: 'main' },
    update: {},
    create: { id: 'main', data: {} },
  });

  await prisma.settings.update({
    where: { id: 'main' },
    data: {
      data: {
        hotelName: 'Yada Homestay',
        hotelNameTh: 'ญาดาโฮมสเตย์',
        address: '80 ธงชัย ต.ธงชัย อ.เมือง จ.เพชรบุรี 76000',
        phone: '081-234-5678',
        email: 'info@yadahomestay.com',
        taxId: '1234567890123',
        checkInTime: '14:00',
        checkOutTime: '12:00',
        taxRate: 7,
        paymentMethods: [
          { id: 'cash', name: 'เงินสด', enabled: true },
          { id: 'transfer', name: 'โอนเงิน', enabled: true },
          { id: 'promptpay', name: 'PromptPay', enabled: true },
        ],
        bankAccounts: [
          { bankCode: '004', bankName: 'ธนาคารกสิกรไทย', accountName: 'ญาดาโฮมสเตย์', accountNumber: '123-4-56789-0' },
          { bankCode: '014', bankName: 'ธนาคารไทยพาณิชย์', accountName: 'ญาดาโฮมสเตย์', accountNumber: '987-6-54321-0' },
        ],
        promptPayNumber: '0812345678',
        promptPayName: 'ญาดาโฮมสเตย์',
        lineUrl: 'https://line.me/R/ti/p/@yadahomestay',
        notifications: {
          emailNewBooking: true,
          emailCheckIn: true,
          emailCheckOut: false,
          pushNewOrder: true,
          pushLowStock: true,
        },
      },
    },
  });
  console.log('✅ Settings (ธนาคาร, PromptPay, LINE)');

  await ensureGuest({ name: 'สมชาย ใจดี', phone: '0891112233', email: 'somchai@email.com', total_visits: 3 });
  await ensureGuest({ name: 'สมหญิง รักเที่ยว', phone: '0892223344', email: 'somying@email.com', total_visits: 1 });
  await ensureGuest({ name: 'John Smith', phone: '0893334455', email: 'john@email.com', total_visits: 2, notes: 'ลูกค้าต่างชาติ' });
  await ensureGuest({ name: 'วิไล มีสุข', phone: '0894445566', total_visits: 5, notes: 'ลูกค้าประจำ' });
  console.log('✅ Guests (4)');

  const demoExists = await prisma.booking.count({ where: { notes: { contains: DEMO } } });
  if (demoExists === 0) {
    const checkedIn = await prisma.booking.create({
      data: {
        room_id: standard.id,
        guest_name: 'สมชาย ใจดี',
        guest_phone: '0891112233',
        guest_email: 'somchai@email.com',
        check_in: today,
        check_out: dateOnly(addDays(today, 2)),
        adults: 2,
        children: 0,
        total_amount: 2400,
        status: 'checked-in',
        payment_status: 'paid',
        payment_method: 'transfer',
        notes: `${DEMO} เช็คอินแล้ววันนี้`,
      },
    });

    const pendingBooking = await prisma.booking.create({
      data: {
        room_id: family.id,
        guest_name: 'สมหญิง รักเที่ยว',
        guest_phone: '0892223344',
        guest_email: 'somying@email.com',
        check_in: dateOnly(addDays(today, 3)),
        check_out: dateOnly(addDays(today, 5)),
        adults: 2,
        children: 1,
        total_amount: 5000,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'transfer',
        notes: `${DEMO} รอชำระเงิน`,
      },
    });

    const confirmed = await prisma.booking.create({
      data: {
        room_id: superior.id,
        guest_name: 'วิไล มีสุข',
        guest_phone: '0894445566',
        check_in: dateOnly(addDays(today, 7)),
        check_out: dateOnly(addDays(today, 9)),
        adults: 2,
        children: 0,
        total_amount: 3000,
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'transfer',
        notes: `${DEMO} จองล่วงหน้า`,
      },
    });

    await prisma.booking.create({
      data: {
        room_id: deluxe.id,
        guest_name: 'John Smith',
        guest_phone: '0893334455',
        guest_email: 'john@email.com',
        check_in: dateOnly(addDays(today, -2)),
        check_out: today,
        adults: 1,
        children: 0,
        total_amount: 3600,
        status: 'checked-out',
        payment_status: 'paid',
        payment_method: 'cash',
        notes: `${DEMO} เช็คเอาท์วันนี้`,
      },
    });

    await prisma.paymentSlip.create({
      data: {
        booking_id: pendingBooking.id,
        image_url: '/images/gallery-lobby.jpg',
        amount: 5000,
        status: 'pending',
        notes: `${DEMO} สลิปรอตรวจ`,
      },
    });

    await prisma.paymentSlip.create({
      data: {
        booking_id: confirmed.id,
        image_url: '/images/gallery-lobby.jpg',
        amount: 3000,
        status: 'approved',
        notes: `${DEMO} สลิปอนุมัติแล้ว`,
        verified_at: new Date(),
        verified_by: admin.id,
      },
    });

    await prisma.payment.create({
      data: {
        booking_id: checkedIn.id,
        amount: 2400,
        method: 'transfer',
        status: 'paid',
        notes: `${DEMO} ชำระเต็มจำนวน`,
        created_by: reception.id,
      },
    });

    await prisma.roomCleaning.create({
      data: {
        room_id: deluxe.id,
        status: 'pending',
        assigned_to: reception.id,
        notes: `${DEMO} รอทำความสะอาดหลังเช็คเอาท์`,
      },
    });

    await prisma.roomCleaning.create({
      data: {
        room_id: deluxe.id,
        status: 'in_progress',
        assigned_to: reception.id,
        started_at: new Date(),
        notes: `${DEMO} กำลังทำความสะอาด`,
      },
    });

    await prisma.maintenanceRequest.create({
      data: {
        room_id: villa.id,
        title: 'สระว่ายน้ำรั่ว',
        description: `${DEMO} พบน้ำรั่วบริเวณปั๊มสระ ต้องเรียกช่าง`,
        priority: 'high',
        status: 'pending',
      },
    });

    await prisma.maintenanceRequest.create({
      data: {
        room_id: villa.id,
        title: 'เปลี่ยนหลอดไฟระเบียง',
        description: 'หลอดไฟดวงหนึ่งขาด',
        priority: 'low',
        status: 'in_progress',
        assigned_to: admin.id,
      },
    });

    await prisma.order.create({
      data: {
        booking_id: checkedIn.id,
        room_id: standard.id,
        guest_name: 'สมชาย ใจดี',
        items: [
          { product_id: products[0].id, name: 'โคคา-โคล่า', quantity: 2, price: 35 },
          { product_id: products[2].id, name: 'เบียร์ช้าง', quantity: 1, price: 70 },
        ],
        subtotal: 140,
        tax: 0,
        total: 140,
        status: 'pending',
        payment_method: 'room_charge',
      },
    });

    await prisma.auditLog.createMany({
      data: [
        { user_id: admin.id, action: 'booking.created', table_name: 'bookings', record_id: pendingBooking.id, new_data: { status: 'pending' } },
        { user_id: reception.id, action: 'booking.check_in', table_name: 'bookings', record_id: checkedIn.id, new_data: { status: 'checked-in' } },
        { user_id: admin.id, action: 'payment_slip.approved', table_name: 'payment_slips', new_data: { booking_id: confirmed.id } },
        { user_id: reception.id, action: 'room.status', table_name: 'rooms', record_id: deluxe.id, new_data: { status: 'cleaning' } },
        { user_id: admin.id, action: 'maintenance.created', table_name: 'maintenance_requests', record_id: villa.id, new_data: { title: 'สระว่ายน้ำรั่ว' } },
      ],
    });

    console.log('✅ Demo bookings, slips, cleaning, maintenance, orders, audit logs');
  } else {
    console.log('ℹ️  Demo data already exists — skipped transactional seed');
  }

  console.log('\n🎉 Seed complete!');
  console.log('   admin / admin123');
  console.log('   owner / owner123');
  console.log('   reception / reception123');
  console.log('   staff / staff123');
  console.log('\n📱 ทดสอบตรวจสอบการจอง: 0892223344 (รอชำระ) | 0891112233 (เข้าพักแล้ว)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
