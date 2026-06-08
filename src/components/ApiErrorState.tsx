import { AlertCircle, RefreshCw, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ApiErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  phone?: string;
  lineUrl?: string;
};

export default function ApiErrorState({
  title = 'ไม่สามารถโหลดข้อมูลได้',
  message = 'ระบบอาจไม่พร้อมใช้งานชั่วคราว ลองใหม่อีกครั้งหรือติดต่อที่พักโดยตรง',
  onRetry,
  phone,
  lineUrl,
}: ApiErrorStateProps) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
      <AlertCircle className="mx-auto mb-3 h-10 w-10 text-rose-500" />
      <h3 className="font-semibold text-yada-text">{title}</h3>
      <p className="mt-2 text-sm text-yada-text-secondary">{message}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button variant="yada-outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            ลองใหม่
          </Button>
        )}
        {phone && (
          <Button variant="yada" size="sm" asChild>
            <a href={`tel:${phone}`}>
              <Phone className="mr-2 h-4 w-4" />
              โทร {phone}
            </a>
          </Button>
        )}
        {lineUrl && (
          <Button variant="yada-outline" size="sm" asChild>
            <a href={lineUrl} target="_blank" rel="noopener noreferrer">
              ติดต่อ LINE
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
