import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { dateKey } from './utils';

/**
 * Data de hoje (AAAA-MM-DD) que se atualiza quando o app volta para a tela
 * e à meia-noite – o iOS mantém o app suspenso em vez de fechá-lo.
 */
export function useToday() {
  const [today, setToday] = useState(() => dateKey());

  useEffect(() => {
    const refresh = () => setToday(dateKey());
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2);
    const timer = setTimeout(refresh, midnight.getTime() - now.getTime());
    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, [today]);

  return today;
}

/** Relógio que atualiza a cada `ms` enquanto `enabled` for verdadeiro. */
export function useNow(enabled: boolean, ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setNow(Date.now());
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') tick();
    });
    const t = setInterval(tick, ms);
    return () => {
      clearInterval(t);
      sub.remove();
    };
  }, [enabled, ms]);
  return now;
}
