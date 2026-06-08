export const rolePermissions: Record<string, string[]> = {
  owner: [
    'dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage',
    'orders_manage', 'products_manage', 'reports_view', 'users_manage', 'settings_manage',
  ],
  admin: [
    'dashboard_view', 'bookings_manage', 'rooms_manage', 'guests_manage',
    'orders_manage', 'products_manage', 'reports_view', 'users_manage', 'settings_manage',
  ],
  receptionist: [
    'dashboard_view', 'bookings_manage', 'guests_manage', 'orders_manage',
  ],
  staff: ['dashboard_view', 'orders_manage'],
};

export const roleLabels: Record<string, string> = {
  owner: 'เจ้าของ',
  admin: 'ผู้ดูแลระบบ',
  receptionist: 'พนักงานต้อนรับ',
  staff: 'พนักงานทั่วไป',
};

export const permissionLabels: Record<string, string> = {
  dashboard_view: 'ดูแดชบอร์ด',
  bookings_manage: 'จัดการการจอง',
  rooms_manage: 'จัดการห้องพัก',
  guests_manage: 'จัดการลูกค้า',
  orders_manage: 'จัดการออเดอร์',
  products_manage: 'จัดการสินค้า',
  reports_view: 'ดูรายงาน',
  users_manage: 'จัดการผู้ใช้',
  settings_manage: 'ตั้งค่าระบบ',
};
