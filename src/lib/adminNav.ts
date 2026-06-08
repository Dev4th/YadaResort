export type AdminNavCommand = {
  path: string;
  label: string;
  keywords?: string[];
};

export const adminNavCommands: AdminNavCommand[] = [
  { path: '', label: 'แดชบอร์ด', keywords: ['dashboard', 'home'] },
  { path: 'operations', label: 'คิวงาน', keywords: ['queue', 'operations'] },
  { path: 'bookings', label: 'การจอง', keywords: ['booking', 'จอง'] },
  { path: 'calendar', label: 'ปฏิทินการจอง', keywords: ['calendar'] },
  { path: 'pos', label: 'Check-in / Check-out', keywords: ['pos', 'checkin'] },
  { path: 'rooms', label: 'ห้องพัก', keywords: ['rooms', 'bed'] },
  { path: 'cleaning', label: 'ทำความสะอาด', keywords: ['cleaning', 'housekeeping'] },
  { path: 'maintenance', label: 'ซ่อมบำรุง', keywords: ['maintenance', 'repair'] },
  { path: 'guests', label: 'ลูกค้า', keywords: ['guests', 'crm'] },
  { path: 'bar', label: 'บาร์ & เครื่องดื่ม', keywords: ['bar', 'minibar'] },
  { path: 'inventory', label: 'คลังสินค้า', keywords: ['inventory', 'stock'] },
  { path: 'billing', label: 'การเงิน', keywords: ['billing', 'invoice'] },
  { path: 'payment-verify', label: 'ตรวจสอบการชำระ', keywords: ['slip', 'payment'] },
  { path: 'reports', label: 'รายงาน', keywords: ['reports', 'analytics'] },
  { path: 'staff', label: 'พนักงาน', keywords: ['staff', 'users'] },
  { path: 'settings', label: 'ตั้งค่า', keywords: ['settings', 'config'] },
];
