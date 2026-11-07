import * as Notifications from 'expo-notifications';

import type { Reminder } from './types';

/** O iOS guarda no máximo 64 notificações agendadas por app. Deixamos folga para descanso e jejum. */
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
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const res = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    });
    return res.granted;
  } catch {
    return false;
  }
}

/** Quantas notificações um lembrete ocupa (uma por dia da semana, ou uma se for diário). */
export function slotsFor(r: Reminder) {
  if (!r.enabled) return 0;
  return r.weekdays.length === 0 || r.weekdays.length === 7 ? 1 : r.weekdays.length;
}

export function totalSlots(reminders: Reminder[]) {
  return reminders.reduce((sum, r) => sum + slotsFor(r), 0);
}

async function cancelKind(kind: string) {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === kind)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {})),
  );
}

/** Cancela todos os lembretes agendados e agenda de novo a partir da lista. */
export async function syncReminders(reminders: Reminder[]) {
  await cancelKind('reminder');

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
    const triggers: Notifications.SchedulableNotificationTriggerInput[] = daily
      ? [{ type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: r.hour, minute: r.minute }]
      : r.weekdays.map((weekday) => ({
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: r.hour,
          minute: r.minute,
        }));
    for (const trigger of triggers) {
      if (used >= MAX_SCHEDULED) return used;
      try {
        await Notifications.scheduleNotificationAsync({ content, trigger });
        used++;
      } catch (e) {
        console.warn('Falha ao agendar lembrete', r.title, e);
      }
    }
  }
  return used;
}

/** Notificação única para o fim do descanso (funciona com o app em segundo plano). */
export async function scheduleRestEnd(seconds: number) {
  try {
    await cancelKind('rest');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Descanso acabou! 💪',
        body: 'Bora para a próxima série.',
        sound: true,
        data: { kind: 'rest' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, seconds) },
    });
  } catch (e) {
    console.warn('Falha ao agendar descanso', e);
  }
}

export async function cancelRestEnd() {
  try {
    await cancelKind('rest');
  } catch {}
}

/** Agenda o aviso de fim do jejum. Não agenda se o horário já passou. */
export async function scheduleFastEnd(endAt: number, targetHours: number) {
  try {
    await cancelKind('fast');
    if (endAt <= Date.now() + 5000) return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Jejum concluído! 🎉',
        body: `Você completou ${targetHours}h de jejum. Pode encerrar no app quando for comer.`,
        sound: true,
        data: { kind: 'fast' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endAt) },
    });
  } catch (e) {
    console.warn('Falha ao agendar jejum', e);
  }
}

export async function cancelFastEnd() {
  try {
    await cancelKind('fast');
  } catch {}
}
