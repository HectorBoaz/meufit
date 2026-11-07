import { Alert, View } from 'react-native';

import { Ring } from '@/components/ring';
import { Button, Card, Chip, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { formatClock, formatDuration, hoursToMs, PROTOCOLS } from '@/lib/fasting';
import { useNow } from '@/lib/hooks';
import { cancelFastEnd, ensurePermission, scheduleFastEnd } from '@/lib/notifications';
import { useStore } from '@/lib/store';
import type { Fast } from '@/lib/types';
import { uid } from '@/lib/utils';

export default function Jejum() {
  const c = useColors();
  const { state, update } = useStore();
  const { active, protocolHours, history } = state.fasting;
  const now = useNow(true, 1000);

  const sortedHistory = [...history].sort((a, b) => b.end - a.end);
  const lastEnd = sortedHistory[0]?.end;

  const start = async () => {
    const startAt = Date.now();
    update((s) => ({ ...s, fasting: { ...s.fasting, active: { start: startAt, targetHours: protocolHours } } }));
    if (await ensurePermission()) await scheduleFastEnd(startAt + hoursToMs(protocolHours), protocolHours);
  };

  const adjustStart = (minutes: number) => {
    if (!active) return;
    const newStart = Math.min(Date.now(), active.start + minutes * 60 * 1000);
    update((s) => ({ ...s, fasting: { ...s.fasting, active: { ...active, start: newStart } } }));
    scheduleFastEnd(newStart + hoursToMs(active.targetHours), active.targetHours);
  };

  const changeTarget = (hours: number) => {
    update((s) => ({
      ...s,
      fasting: { ...s.fasting, protocolHours: hours, active: s.fasting.active ? { ...s.fasting.active, targetHours: hours } : null },
    }));
    if (active) scheduleFastEnd(active.start + hoursToMs(hours), hours);
  };

  const finish = () => {
    if (!active) return;
    const doFinish = () => {
      const fast: Fast = { id: uid(), start: active.start, end: Date.now(), targetHours: active.targetHours };
      update((s) => ({ ...s, fasting: { ...s.fasting, active: null, history: [...s.fasting.history, fast] } }));
      cancelFastEnd();
    };
    const remaining = active.start + hoursToMs(active.targetHours) - Date.now();
    if (remaining > 0) {
      Alert.alert('Encerrar o jejum?', `Ainda faltam ${formatDuration(remaining)} para a meta de ${active.targetHours}h.`, [
        { text: 'Continuar jejum', style: 'cancel' },
        { text: 'Encerrar', style: 'destructive', onPress: doFinish },
      ]);
    } else {
      doFinish();
      Alert.alert('Parabéns! 🎉', `Jejum de ${formatDuration(Date.now() - active.start)} concluído.`);
    }
  };

  const cancel = () =>
    Alert.alert('Descartar este jejum?', 'Ele não será salvo no histórico.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          update((s) => ({ ...s, fasting: { ...s.fasting, active: null } }));
          cancelFastEnd();
        },
      },
    ]);

  const removeFast = (f: Fast) =>
    Alert.alert('Apagar do histórico?', formatDuration(f.end - f.start), [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => update((s) => ({ ...s, fasting: { ...s.fasting, history: s.fasting.history.filter((x) => x.id !== f.id) } })),
      },
    ]);

  const completed = history.filter((f) => f.end - f.start >= hoursToMs(f.targetHours));
  const longest = history.reduce((m, f) => Math.max(m, f.end - f.start), 0);

  // Valores do jejum em andamento
  const elapsed = active ? now - active.start : 0;
  const target = active ? hoursToMs(active.targetHours) : 0;
  const progress = active ? elapsed / target : 0;
  const reached = active && elapsed >= target;

  return (
    <Screen>
      <T kind="title">Jejum</T>

      <Card style={{ alignItems: 'center', gap: 16 }}>
        {active ? (
          <>
            <Ring progress={progress} color={reached ? c.success : c.accent}>
              <T kind="small">{reached ? 'Meta batida! 🎉' : 'Em jejum'}</T>
              <T kind="big" style={{ fontSize: 38 }}>{formatDuration(elapsed, true)}</T>
              <T kind="small">
                {reached ? `+${formatDuration(elapsed - target)} além da meta` : `faltam ${formatDuration(target - elapsed)}`}
              </T>
            </Ring>
            <Row style={{ justifyContent: 'space-around', alignSelf: 'stretch' }}>
              <View style={{ alignItems: 'center' }}>
                <T kind="small">Início</T>
                <T style={{ fontWeight: '700' }}>{formatClock(active.start, now)}</T>
              </View>
              <View style={{ alignItems: 'center' }}>
                <T kind="small">Meta ({active.targetHours}h)</T>
                <T style={{ fontWeight: '700' }}>{formatClock(active.start + target, now)}</T>
              </View>
            </Row>
            <Row>
              <T kind="small">Ajustar início:</T>
              <Button title="−30 min" variant="soft" small onPress={() => adjustStart(-30)} />
              <Button title="+30 min" variant="soft" small onPress={() => adjustStart(30)} />
            </Row>
            <Button title="Encerrar jejum" onPress={finish} style={{ alignSelf: 'stretch' }} />
            <Button title="Descartar" variant="danger" small onPress={cancel} />
          </>
        ) : (
          <>
            <Ring progress={0}>
              <T kind="small">Meta escolhida</T>
              <T kind="big" style={{ fontSize: 44 }}>{protocolHours}h</T>
              {lastEnd ? <T kind="small">última refeição há {formatDuration(now - lastEnd)}</T> : null}
            </Ring>
            <Button title="Iniciar jejum agora" onPress={start} style={{ alignSelf: 'stretch' }} />
            <T kind="small" style={{ textAlign: 'center' }}>
              Comeu há pouco e esqueceu de iniciar? Inicie agora e use “−30 min” para ajustar o horário.
            </T>
          </>
        )}
      </Card>

      <Card>
        <T kind="heading">Duração do jejum</T>
        <Row style={{ flexWrap: 'wrap' }}>
          {PROTOCOLS.map((p) => (
            <Chip
              key={p.hours}
              label={p.label}
              active={(active?.targetHours ?? protocolHours) === p.hours}
              onPress={() => changeTarget(p.hours)}
            />
          ))}
        </Row>
        <T kind="small">{PROTOCOLS.find((p) => p.hours === (active?.targetHours ?? protocolHours))?.hint}</T>
        <T kind="muted">
          Quanto tempo de jejum fazer depende de cada pessoa. Se está começando, 12h (incluindo a noite de sono) é um
          bom início, aumentando aos poucos. Para jejuns longos, ou se tiver alguma condição de saúde, converse antes
          com um(a) nutricionista ou médico(a). Beba bastante água durante o jejum.
        </T>
      </Card>

      {history.length > 0 ? (
        <>
          <Card>
            <Row style={{ justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <T kind="heading">{history.length}</T>
                <T kind="small">jejuns</T>
              </View>
              <View style={{ alignItems: 'center' }}>
                <T kind="heading">{completed.length}</T>
                <T kind="small">metas batidas</T>
              </View>
              <View style={{ alignItems: 'center' }}>
                <T kind="heading">{formatDuration(longest)}</T>
                <T kind="small">mais longo</T>
              </View>
            </Row>
          </Card>
          <View style={{ gap: 8 }}>
            <T kind="heading">Histórico</T>
            <Card style={{ gap: 0, paddingVertical: 4 }}>
              {sortedHistory.slice(0, 15).map((f, i) => {
                const ok = f.end - f.start >= hoursToMs(f.targetHours);
                return (
                  <Row
                    key={f.id}
                    style={{ paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.border }}>
                    <T style={{ width: 28 }}>{ok ? '✅' : '⏸️'}</T>
                    <View style={{ flex: 1 }}>
                      <T style={{ fontWeight: '700' }}>
                        {formatDuration(f.end - f.start)} <T kind="small">/ meta {f.targetHours}h</T>
                      </T>
                      <T kind="small">
                        {formatClock(f.start, now)} → {formatClock(f.end, now)}
                      </T>
                    </View>
                    <Button title="✕" variant="ghost" small onPress={() => removeFast(f)} />
                  </Row>
                );
              })}
            </Card>
          </View>
        </>
      ) : null}
    </Screen>
  );
}
