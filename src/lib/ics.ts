function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function downloadBookingIcs(params: {
  title: string;
  checkIn: string;
  checkOut: string;
  location?: string;
  description?: string;
}) {
  const uid = `${Date.now()}@yadahomestay.com`;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yada Homestay//Booking//TH',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART;VALUE=DATE:${params.checkIn.replace(/-/g, '')}`,
    `DTEND;VALUE=DATE:${params.checkOut.replace(/-/g, '')}`,
    `SUMMARY:${params.title}`,
    params.location ? `LOCATION:${params.location}` : '',
    params.description ? `DESCRIPTION:${params.description}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'yada-booking.ics';
  link.click();
  URL.revokeObjectURL(url);
}
