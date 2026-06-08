import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { adminNavCommands } from '@/lib/adminNav';

type AdminCommandPaletteProps = {
  onWalkIn: () => void;
};

export default function AdminCommandPalette({ onWalkIn }: AdminCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const go = (path: string) => {
    navigate(path.startsWith('/admin') ? path : `/admin/${path}`);
    setOpen(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="ค้นหาและไปยังหน้า" description="กด Ctrl+K เพื่อเปิดเมนูนี้">
      <CommandInput placeholder="ค้นหาหน้า, จอง walk-in..." />
      <CommandList>
        <CommandEmpty>ไม่พบคำสั่ง</CommandEmpty>
        <CommandGroup heading="การดำเนินการ">
          <CommandItem
            onSelect={() => {
              onWalkIn();
              setOpen(false);
            }}
          >
            + จอง Walk-in
          </CommandItem>
          <CommandItem onSelect={() => go('payment-verify')}>ตรวจสอบสลิปโอนเงิน</CommandItem>
          <CommandItem onSelect={() => go('pos')}>Check-in / Check-out</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="เมนูทั้งหมด">
          {adminNavCommands.map((item) => (
            <CommandItem
              key={item.path}
              value={`${item.label} ${item.keywords?.join(' ') || ''}`}
              onSelect={() => go(item.path)}
            >
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
