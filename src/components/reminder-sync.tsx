import { useEffect } from 'react';

import { syncReminders } from '@/lib/notifications';
import { useStore } from '@/lib/store';

/** Mantém as notificações agendadas no iPhone iguais à lista de lembretes. */
export function ReminderSync() {
  const { state, ready } = useStore();
  const key = JSON.stringify(state.reminders);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      syncReminders(state.reminders).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ready]);

  return null;
}
