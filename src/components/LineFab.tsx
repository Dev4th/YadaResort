import { MessageCircle } from 'lucide-react';
import { useSettingsStore } from '@/stores/store';

export default function LineFab() {
  const { settings } = useSettingsStore();
  const lineUrl = settings.lineUrl;

  if (!lineUrl) return null;

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-yada-primary text-white shadow-yada ring-2 ring-white/80 transition hover:scale-105 hover:bg-yada-primary-hover hover:shadow-lg"
      aria-label="ติดต่อผ่าน LINE"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
