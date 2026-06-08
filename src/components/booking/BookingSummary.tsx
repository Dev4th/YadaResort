import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import type { Room } from '@/stores/store';

type BookingSummaryProps = {
  checkIn: string;
  checkOut: string;
  adults: string;
  children: string;
  nights: number;
  selectedRoom?: Room;
  totalAmount: number;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showNext?: boolean;
};

export default function BookingSummary({
  checkIn,
  checkOut,
  adults,
  children,
  nights,
  selectedRoom,
  totalAmount,
  onNext,
  nextLabel = 'ถัดไป',
  nextDisabled,
  showNext,
}: BookingSummaryProps) {
  return (
    <div className="sticky top-24 rounded-xl border border-yada-border bg-yada-surface p-6 shadow-yada">
      <h3 className="font-display text-lg font-semibold text-yada-text">สรุปการจอง</h3>
      <div className="mt-4 space-y-3 text-sm">
        {checkIn && checkOut && nights > 0 && (
          <div className="flex justify-between gap-2">
            <span className="text-yada-text-secondary">วันที่</span>
            <span className="text-right font-medium text-yada-text">
              {format(new Date(checkIn), 'd MMM', { locale: th })} – {format(new Date(checkOut), 'd MMM yyyy', { locale: th })}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-yada-text-secondary">ผู้เข้าพัก</span>
          <span className="font-medium">{adults} ผู้ใหญ่{parseInt(children) > 0 ? `, ${children} เด็ก` : ''}</span>
        </div>
        {nights > 0 && (
          <div className="flex justify-between">
            <span className="text-yada-text-secondary">จำนวนคืน</span>
            <span className="font-medium">{nights} คืน</span>
          </div>
        )}
        {selectedRoom && (
          <div className="flex justify-between gap-2">
            <span className="text-yada-text-secondary">ห้อง</span>
            <span className="text-right font-medium">{selectedRoom.name_th || selectedRoom.name}</span>
          </div>
        )}
        {totalAmount > 0 && (
          <div className="border-t border-yada-border pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>ยอดรวม</span>
              <span className="text-yada-primary">฿{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
      {showNext && onNext && (
        <Button variant="yada" className="mt-6 hidden w-full lg:flex" onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </Button>
      )}
    </div>
  );
}
