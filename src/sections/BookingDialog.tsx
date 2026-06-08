import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Room } from '@/stores/store';

interface BookingDialogProps {
  room: Room | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookingDialog({ room, open, onOpenChange }: BookingDialogProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;

    const target = room?.id ? `/booking?room=${room.id}` : '/booking';
    navigate(target);
    onOpenChange(false);
  }, [navigate, onOpenChange, open, room?.id]);

  return null;
}
