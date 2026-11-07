import * as Notifications from 'expo-notifications';

import type { Reminder } from './types';

/** O iOS guarda no máximo 64 notificações agendadas por app. Deixamos folga para o descanso. */
export const MAX_SCHEDULED = 60;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensurePermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const res = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return res.granted;
}

/** Quantas notificações um lembrete ocupa (uma por dia da semana, ou uma se for diário). */
export function slotsFor(r: Reminder) {
  if (!r.enabled) return 0;
  return r.weekdays.length === 0 || r.weekdays.length === 7 ? 1 : r.weekdays.length;
}

export function totalSlots(reminders: Reminder[]) {
  return reminders.reduce((sum, r) => sum + slotsFor(r), 0);
}

/** Cancela todos os lembretes agendados e agenda de novo a partir da lista. */
export async function syncReminders(reminders: Reminder[]) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === 'reminder')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );

  let used = 0;
  for (const r of reminders) {
    if (!r.enabled) continue;
    const content = {
      title: r.title,
      body: r.body || undefined,
      sound: true,
      data: { kind: 'reminder', reminderId: r.id },
    };
    const daily = r.weekdays.length === 0 || r.weekdays.length === 7;
    if (daily) {
      if (used >= MAX_SCHEDULED) break;
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: r.hour, minute: r.minute },
      });
      used++;
    } else {
      for (const weekday of r.weekdays) {
        if (used >= MAX_SCHEDULED) break;
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour: r.hour,
            minute: r.minute,
          },
        });
        used++;
      }
    }
  }
  return used;
}

/** Notificação única para o fim do descanso (funciona com o app em segundo plano). */
export async function scheduleRestEnd(seconds: number) {
  await cancelRestEnd();
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Descanso acabou! 💪',
      body: 'Bora para a próxima série.',
      sound: true,
      data: { kind: 'rest' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, seconds) },
  });
  return id;
}

export async function cancelRestEnd() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === 'rest')
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}
