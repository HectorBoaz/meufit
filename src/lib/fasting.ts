export const PROTOCOLS = [
  { hours: 12, label: '12h', hint: 'Ótimo para começar' },
  { hours: 14, label: '14h', hint: 'Intermediário' },
  { hours: 16, label: '16h', hint: 'O popular 16:8' },
  { hours: 18, label: '18h', hint: 'Avançado' },
  { hours: 20, label: '20h', hint: 'Avançado' },
];

const HOUR = 3600 * 1000;

export function hoursToMs(h: number) {
  return h * HOUR;
}

export function formatDuration(ms: number, withSeconds = false) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return withSeconds ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${h}h${pad(m)}`;
}

/** "20:00", "ontem 20:00" ou "06/11 20:00" em relação a agora. */
export function formatClock(ts: number, now: number) {
  const d = new Date(ts);
  const n = new Date(now);
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(n)) / (24 * HOUR));
  if (diffDays === 0) return `hoje ${time}`;
  if (diffDays === -1) return `ontem ${time}`;
  if (diffDays === 1) return `amanhã ${time}`;
  return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${time}`;
}
