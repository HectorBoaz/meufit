import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { router, type Href } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Alert, Pressable, View } from 'react-native';

import { Button, Card, Row, Screen, T } from '@/components/ui';
import { useColors } from '@/constants/theme';
import { normalizeState, useStore } from '@/lib/store';
import { computeTargets } from '@/lib/targets';
import { dateKey, formatNumber } from '@/lib/utils';

function MenuItem({ icon, title, subtitle, href, last }: { icon: string; title: string; subtitle: string; href: Href; last?: boolean }) {
  const c = useColors();
  return (
    <Pressable onPress={() => router.push(href)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <Row style={{ paddingVertical: 14, borderBottomWidth: last ? 0 : 1, borderBottomColor: c.border, gap: 12 }}>
        <T style={{ fontSize: 24 }}>{icon}</T>
        <View style={{ flex: 1 }}>
          <T style={{ fontWeight: '600' }}>{title}</T>
          <T kind="small">{subtitle}</T>
        </View>
        <T kind="muted">›</T>
      </Row>
    </Pressable>
  );
}

export default function Mais() {
  const { state, replace } = useStore();
  const t = computeTargets(state);
  const activeReminders = state.reminders.filter((r) => r.enabled).length;

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
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
      if (res.canceled || !res.assets?.[0]) return;
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

  return (
    <Screen>
      <Card style={{ gap: 0, paddingVertical: 0 }}>
        <MenuItem
          icon="👤"
          title="Perfil e metas"
          subtitle={
            state.profile.configured
              ? `${t.kcal} kcal/dia · ${t.cups} copos de água`
              : 'Preencha para calcular calorias e água'
          }
          href="/mais/perfil"
        />
        <MenuItem
          icon="📈"
          title="Evolução"
          subtitle={`Peso atual: ${formatNumber(t.weight)} kg · ${state.body.length} registros`}
          href="/mais/evolucao"
        />
        <MenuItem
          icon="🔔"
          title="Lembretes"
          subtitle={activeReminders ? `${activeReminders} ativos` : 'Água, treino, refeições, suplemento…'}
          href="/mais/lembretes"
          last
        />
      </Card>

      <Card>
        <T kind="heading">Backup</T>
        <T kind="muted">
          Os dados ficam só neste iPhone. Exporte uma cópia de vez em quando (no app Arquivos ou no iCloud Drive) e
          sempre antes de instalar uma atualização do app.
        </T>
        <Row>
          <Button title="Exportar" variant="soft" style={{ flex: 1 }} onPress={exportBackup} />
          <Button title="Restaurar" variant="soft" style={{ flex: 1 }} onPress={importBackup} />
        </Row>
      </Card>

      <T kind="small" style={{ textAlign: 'center' }}>
        Maiza Fit · os cálculos são estimativas e não substituem orientação de nutricionista ou médico.
      </T>
    </Screen>
  );
}
