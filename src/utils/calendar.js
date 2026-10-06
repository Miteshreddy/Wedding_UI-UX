import { WEDDING } from '../data/weddingData';

const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Downloads an .ics file so guests can add the wedding to any calendar app.
export function downloadCalendarInvite() {
  const start = new Date(WEDDING.date.iso);
  const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);
  const { person1, person2 } = WEDDING.couple;
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Enchanted Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${fmt(start)}-${person1}-${person2}@wedding`.toLowerCase(),
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Wedding of ${person1} & ${person2}`,
    `LOCATION:${WEDDING.details.venue.name}\\, ${WEDDING.details.venue.address.replace(/,/g, '\\,')}`,
    `DESCRIPTION:Ceremony at ${WEDDING.schedule[0].time}. Please arrive by 3:30 PM.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${person1}-and-${person2}-wedding.ics`.toLowerCase();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
