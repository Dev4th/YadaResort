import type { ReactNode } from 'react';
import SiteNavbar from '@/components/SiteNavbar';
import SiteFooter from '@/components/SiteFooter';
import LineFab from '@/components/LineFab';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-yada-sand">
      <SiteNavbar />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <LineFab />
    </div>
  );
}
