import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type SectionShellProps = {
  label?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
  centered?: boolean;
};

export default function SectionShell({
  label,
  title,
  subtitle,
  children,
  actions,
  className,
  centered = false,
}: SectionShellProps) {
  return (
    <div className={cn(centered && 'text-center', className)}>
      {label && <span className="section-label block">{label}</span>}
      <div className={cn('flex flex-col gap-4', !centered && 'md:flex-row md:items-end md:justify-between')}>
        <div className={cn(centered && 'mx-auto max-w-3xl')}>
          <h2 className="font-display text-3xl font-semibold text-yada-text lg:text-4xl">{title}</h2>
          {subtitle && (
            <p className={cn('mt-4 text-yada-text-secondary leading-relaxed', centered && 'mx-auto max-w-2xl')}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-10">{children}</div>}
    </div>
  );
}
