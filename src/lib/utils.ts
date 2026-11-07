export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function dateKey(d: Date = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDate(key: string) {
  const [y, m, d] = key.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

export function formatTime(hour: number, minute: number) {
  return `${pad(hour)}:${pad(minute)}`;
}

export function formatSeconds(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${pad(s)}`;
}

export const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; // índice 0 = domingo

export function weekdaysLabel(days: number[]) {
  if (days.length === 0 || days.length === 7) return 'Todos os dias';
  const names = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const sorted = [...days].sort();
  if (sorted.join() === '2,3,4,5,6') return 'Seg a Sex';
  return sorted.map((d) => names[d - 1]).join(', ');
}

/** Aceita "12,5" ou "12.5". */
export function parseNumber(text: string) {
  const n = parseFloat(text.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function formatNumber(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}

/** Dias (chave AAAA-MM-DD) da semana de `todayKey`, começando no domingo. */
export function currentWeekKeys(todayKey: string) {
  const [y, m, d] = todayKey.split('-').map(Number);
  const now = new Date(y, m - 1, d);
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return dateKey(d);
  });
}
