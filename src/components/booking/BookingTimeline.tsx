import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = { key: string; label: string; done: boolean; active: boolean };

function buildSteps(status: string, paymentStatus: string): Step[] {
  const paid = paymentStatus === 'paid';
  const confirmed = ['confirmed', 'checked-in', 'checked-out'].includes(status);
  const checkedIn = ['checked-in', 'checked-out'].includes(status);
  const checkedOut = status === 'checked-out';
  const cancelled = status === 'cancelled';

  if (cancelled) {
    return [
      { key: 'booked', label: 'ส่งคำขอจอง', done: true, active: false },
      { key: 'cancelled', label: 'ยกเลิกแล้ว', done: true, active: true },
    ];
  }

  return [
    { key: 'booked', label: 'ส่งคำขอจอง', done: true, active: status === 'pending' && !paid },
    { key: 'paid', label: 'ชำระเงิน', done: paid, active: status === 'pending' && !paid },
    { key: 'confirmed', label: 'ยืนยันการจอง', done: confirmed, active: status === 'pending' && paid },
    { key: 'checkin', label: 'เข้าพัก', done: checkedIn, active: status === 'confirmed' },
    { key: 'checkout', label: 'เช็คเอาท์', done: checkedOut, active: status === 'checked-in' },
  ];
}

export default function BookingTimeline({
  status,
  paymentStatus,
}: {
  status: string;
  paymentStatus: string;
}) {
  const steps = buildSteps(status, paymentStatus);

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li key={step.key} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2',
                step.done && 'border-yada-primary bg-yada-primary text-white',
                step.active && !step.done && 'border-yada-accent bg-yada-accent/10 text-yada-accent',
                !step.done && !step.active && 'border-yada-border text-yada-text-secondary'
              )}
            >
              {step.done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-current" />}
            </div>
            {index < steps.length - 1 && (
              <div className={cn('my-1 h-8 w-0.5', step.done ? 'bg-yada-primary' : 'bg-yada-border')} />
            )}
          </div>
          <div className="pb-6 pt-1">
            <p
              className={cn(
                'text-sm font-medium',
                step.active ? 'text-yada-primary' : step.done ? 'text-yada-text' : 'text-yada-text-secondary'
              )}
            >
              {step.label}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
