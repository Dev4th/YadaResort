export const roomStatusConfig = {
  available: { label: 'ว่าง', color: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500' },
  occupied: { label: 'มีผู้เข้าพัก', color: 'bg-yada-primary/15 text-yada-primary', dot: 'bg-yada-primary' },
  cleaning: { label: 'ทำความสะอาด', color: 'bg-amber-100 text-amber-800', dot: 'bg-yada-accent' },
  maintenance: { label: 'ซ่อมบำรุง', color: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500' },
  reserved: { label: 'จองแล้ว', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
} as const;

export const bookingStatusConfig = {
  pending: { label: 'รอยืนยัน', color: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'ยืนยันแล้ว', color: 'bg-slate-100 text-slate-800' },
  'checked-in': { label: 'เข้าพักแล้ว', color: 'bg-emerald-100 text-emerald-800' },
  'checked-out': { label: 'เช็คเอาท์แล้ว', color: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'ยกเลิก', color: 'bg-rose-100 text-rose-800' },
} as const;

export const paymentStatusConfig = {
  pending: { label: 'รอชำระ', color: 'bg-amber-100 text-amber-800' },
  paid: { label: 'ชำระแล้ว', color: 'bg-emerald-100 text-emerald-800' },
  partial: { label: 'ชำระบางส่วน', color: 'bg-blue-100 text-blue-800' },
  refunded: { label: 'คืนเงินแล้ว', color: 'bg-gray-100 text-gray-700' },
} as const;

export const slipStatusConfig = {
  pending: { label: 'รอตรวจ', color: 'bg-amber-100 text-amber-800' },
  approved: { label: 'อนุมัติแล้ว', color: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'ปฏิเสธ', color: 'bg-rose-100 text-rose-800' },
} as const;
