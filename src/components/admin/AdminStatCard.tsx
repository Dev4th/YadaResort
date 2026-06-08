import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminStatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  gradient?: string;
  onClick?: () => void;
};

export default function AdminStatCard({ label, value, icon: Icon, gradient = 'admin-card-primary', onClick }: AdminStatCardProps) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'rounded-xl p-5 text-white shadow-sm transition',
        gradient,
        onClick && 'hover:-translate-y-0.5 hover:shadow-md text-left w-full'
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className="h-6 w-6 opacity-90" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="mt-2 text-sm font-medium opacity-90">{label}</p>
    </Comp>
  );
}
