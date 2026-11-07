import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';

import { Button, Card, Chip, Input, Row, Screen, Stepper, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { ensurePermission, MAX_SCHEDULED, slotsFor, totalSlots } from '@/lib/notifications';
import { normalizeState, useStore } from '@/lib/store';
import type { Reminder } from '@/lib/types';
import { dateKey, formatTime, uid, WEEKDAYS_SHORT, weekdaysLabel } from '@/lib/utils';

type Preset = { label: string; make: () => Reminder[] };

const r = (title: string, body: string, hour: number, minute = 0, weekdays: number[] = []): Reminder => ({
  id: uid(),
  title,
  body,
  hour,
  minute,
  weekdays,
  enabled: true,
});

const PRESETS: Preset[] = [
  {
    label: '💧 Água a cada 2h',
    make: () => [8, 10, 12, 14, 16, 18, 20].map((h) => r('Hora de beber água 💧', 'Um copinho agora!', h)),
  },
  {
    label: '🏋️ Treino (seg a sex)',
    make: () => [r('Hora do treino! 🏋️', 'Bora se mexer hoje 💪', 18, 0, [2, 3, 4, 5, 6])],
  },
  {
    label: '🍽️ Refeições',
    make: () => [
      r('Café da manhã ☕', 'Comece o dia bem!', 7, 30),
      r('Lanche da manhã 🍎', '', 10, 0),
      r('Almoço 🍽️', '', 12, 30),
      r('Lanche da tarde 🥪', '', 16, 0),
      r('Jantar 🥗', '', 19, 30),
    ],
  },
  { label: '💊 Suplemento', make: () => [r('Suplemento 💊', 'Não esqueça de tomar!', 9, 0)] },
];

const emptyForm = () => r('', '', 8, 0);

export default function Lembretes() {
  const c = useColors();
  const { state, update, replace } = useStore();
  const [form, setForm] = useState<Reminder | null>(null);
  const used = totalSlots(state.reminders);

  const fits = (extra: number) => {
    if (used + extra <= MAX_SCHEDULED) return true;
    Alert.alert(
      'Limite de lembretes',
      `O iPhone permite até ${MAX_SCHEDULED} notificações agendadas por app. Você está usando ${used}. Desative ou apague alguns lembretes.`,
    );
    return false;
  };

  const askPermission = async () => {
    const ok = await ensurePermission();
    if (!ok) {
      Alert.alert(
        'Notificações desativadas',
        'Para receber os lembretes, ative as notificações em Ajustes → Notificações → Maiza Fit.',
      );
    }
  };

  const addPreset = async (p: Preset) => {
    const items = p.make();
    if (!fits(items.reduce((s, x) => s + slotsFor(x), 0))) return;
    await askPermission();
    update((s) => ({ ...s, reminders: [...s.reminders, ...items] }));
  };

  const saveForm = async () => {
    if (!form) return;
    const item = { ...form, title: form.title.trim() || 'Lembrete' };
    const isNew = !state.reminders.some((x) => x.id === item.id);
    const prevSlots = isNew ? 0 : slotsFor(state.reminders.find((x) => x.id === item.id)!);
    if (!fits(slotsFor(item) - prevSlots)) return;
    await askPermission();
    update((s) => ({
      ...s,
      reminders: isNew ? [...s.reminders, item] : s.reminders.map((x) => (x.id === item.id ? item : x)),
    }));
    setForm(null);
  };

  const toggle = async (item: Reminder, enabled: boolean) => {
    if (enabled && !fits(slotsFor({ ...item, enabled: true }))) return;
    if (enabled) await askPermission();
    update((s) => ({ ...s, reminders: s.reminders.map((x) => (x.id === item.id ? { ...x, enabled } : x)) }));
  };

  const remove = (item: Reminder) =>
    Alert.alert('Apagar lembrete?', item.title, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => {
          update((s) => ({ ...s, reminders: s.reminders.filter((x) => x.id !== item.id) }));
          if (form?.id === item.id) setForm(null);
        },
      },
    ]);

  const exportBackup = async () => {
    try {
      const file = new File(Paths.cache, `maizafit-backup-${dateKey()}.json`);
      file.create({ overwrite: true });
      await file.write(JSON.stringify(state, null, 2));
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
    } catch (e) {
      Alert.alert('Erro ao exportar', String(e));
    }
  };

  const importBackup = async () => {
    const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (res.canceled || !res.assets?.[0]) return;
    try {
      const text = await new File(res.assets[0].uri).text();
      const data = normalizeState(JSON.parse(text));
      Alert.alert('Restaurar backup?', 'Os dados atuais do app serão substituídos pelos do arquivo.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', style: 'destructive', onPress: () => replace(data) },
      ]);
    } catch {
      Alert.alert('Arquivo inválido', 'Não consegui ler esse backup.');
    }
  };

  const sorted = [...state.reminders].sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));

  return (
    <Screen>
      <T kind="title">Lembretes</T>

      {/* Formulário */}
      {form ? (
        <Card>
          <T kind="heading">{state.reminders.some((x) => x.id === form.id) ? 'Editar lembrete' : 'Novo lembrete'}</T>
          <Input
            label="Título"
            placeholder="Ex.: Tomar creatina"
            value={form.title}
            onChangeText={(title) => setForm({ ...form, title })}
          />
          <Input
            label="Mensagem (opcional)"
            value={form.body}
            onChangeText={(body) => setForm({ ...form, body })}
          />
          <Row style={{ justifyContent: 'space-between' }}>
            <T kind="muted">Hora</T>
            <Stepper value={form.hour} min={0} max={23} onChange={(hour) => setForm({ ...form, hour })} format={(v) => String(v).padStart(2, '0')} />
          </Row>
          <Row style={{ justifyContent: 'space-between' }}>
            <T kind="muted">Minuto</T>
            <Stepper value={form.minute} min={0} max={55} step={5} onChange={(minute) => setForm({ ...form, minute })} format={(v) => String(v).padStart(2, '0')} />
          </Row>
          <T kind="muted">Dias (nenhum marcado = todos os dias)</T>
          <Row style={{ justifyContent: 'space-between' }}>
            {WEEKDAYS_SHORT.map((label, i) => {
              const day = i + 1;
              const active = form.weekdays.includes(day);
              return (
                <Chip
                  key={day}
                  label={label}
                  active={active}
                  onPress={() =>
                    setForm({
                      ...form,
                      weekdays: active ? form.weekdays.filter((d) => d !== day) : [...form.weekdays, day],
                    })
                  }
                />
              );
            })}
          </Row>
          <Row>
            <Button title="Cancelar" variant="soft" style={{ flex: 1 }} onPress={() => setForm(null)} />
            <Button title="Salvar" style={{ flex: 1 }} onPress={saveForm} />
          </Row>
        </Card>
      ) : (
        <Button title="+ Novo lembrete" onPress={() => setForm(emptyForm())} />
      )}

      {/* Lista */}
      {sorted.length > 0 ? (
        <Card style={{ gap: 0, paddingVertical: 4 }}>
          {sorted.map((item, i) => (
            <Pressable key={item.id} onPress={() => setForm({ ...item })} onLongPress={() => remove(item)}>
              <Row
                style={{
                  paddingVertical: 12,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: c.border,
                  opacity: item.enabled ? 1 : 0.5,
                }}>
                <T kind="heading" style={{ width: 64, fontVariant: ['tabular-nums'] }}>
                  {formatTime(item.hour, item.minute)}
                </T>
                <View style={{ flex: 1 }}>
                  <T numberOfLines={1}>{item.title}</T>
                  <T kind="small">{weekdaysLabel(item.weekdays)}</T>
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={(v) => toggle(item, v)}
                  trackColor={{ true: c.accent, false: c.border }}
                />
              </Row>
            </Pressable>
          ))}
        </Card>
      ) : (
        <T kind="muted">Nenhum lembrete ainda. Comece com um dos modelos abaixo 👇</T>
      )}
      {sorted.length > 0 ? (
        <T kind="small">
          Toque para editar · segure para apagar · {used}/{MAX_SCHEDULED} notificações agendadas
        </T>
      ) : null}

      {/* Modelos */}
      <Card>
        <T kind="heading">Modelos rápidos</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map((p) => (
            <Button key={p.label} title={p.label} variant="soft" small onPress={() => addPreset(p)} />
          ))}
        </View>
      </Card>

      {/* Ajustes */}
      <Card>
        <T kind="heading">Ajustes</T>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Meta de água (copos)</T>
          <Stepper value={state.waterGoal} min={1} max={20} onChange={(waterGoal) => update((s) => ({ ...s, waterGoal }))} />
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <T kind="muted">Tamanho do copo</T>
          <Stepper
            value={state.cupMl}
            min={100}
            max={1000}
            step={50}
            format={(v) => `${v}ml`}
            onChange={(cupMl) => update((s) => ({ ...s, cupMl }))}
          />
        </Row>
      </Card>

      {/* Backup */}
      <Card>
        <T kind="heading">Backup</T>
        <T kind="muted">
          Salve uma cópia dos seus dados de vez em quando (no app Arquivos ou no iCloud Drive). Se o app precisar ser
          reinstalado, é só restaurar.
        </T>
        <Row>
          <Button title="Exportar" variant="soft" style={{ flex: 1 }} onPress={exportBackup} />
          <Button title="Restaurar" variant="soft" style={{ flex: 1 }} onPress={importBackup} />
        </Row>
      </Card>
    </Screen>
  );
}
