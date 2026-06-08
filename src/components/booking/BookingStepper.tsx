import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { num: 1, label: 'เลือกวันที่' },
  { num: 2, label: 'เลือกห้อง' },
  { num: 3, label: 'ข้อมูลผู้จอง' },
  { num: 4, label: 'ชำระเงิน' },
];

export default function BookingStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <ol className="flex list-none items-center justify-center p-0" aria-label="ขั้นตอนการจอง">
        {steps.map((s, i) => (
          <li key={s.num} className="flex items-center" aria-current={currentStep === s.num ? 'step' : undefined}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all sm:h-12 sm:w-12',
                  currentStep === s.num && 'border-yada-primary bg-yada-primary text-white',
                  currentStep > s.num && 'border-yada-primary bg-yada-primary text-white',
                  currentStep < s.num && 'border-yada-border bg-yada-surface text-yada-text-secondary'
                )}
              >
                {currentStep > s.num ? <Check className="h-5 w-5" /> : s.num}
              </div>
              <span className={cn('mt-2 hidden text-xs font-medium sm:block sm:text-sm', currentStep >= s.num ? 'text-yada-text' : 'text-yada-text-secondary')}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn('mx-2 h-0.5 w-8 sm:w-16 -mt-6', currentStep > s.num ? 'bg-yada-primary' : 'bg-yada-border')} />
            )}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-center text-sm font-medium text-yada-text sm:hidden">
        {steps.find((s) => s.num === currentStep)?.label}
      </p>
    </div>
  );
}
