import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabase';
import PinModal from '../components/PinModal';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Charge toutes les données une fois, les partage à toutes les pages et gère la demande de PIN.
export function AppProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pinAsk, setPinAsk] = useState(null);

  const load = useCallback(async () => {
    const res = await Promise.all([
      supabase.from('players').select('*').order('name'),
      supabase.from('games').select('*, game_owners(player_id, players(name))').order('name'),
      supabase.from('game_k_factors').select('*'),
      supabase.from('ratings').select('*'),
      supabase
        .from('matches')
        .select('id, played_at, created_at, game_id, details, match_players(player_id, rang, elo_before, elo_after, details)')
        .order('played_at', { ascending: false })
        .order('created_at', { ascending: false }),
    ]);
    const failed = res.find((r) => r.error);
    if (failed) return setError(failed.error.message);
    setError('');
    setData({ players: res[0].data, games: res[1].data, ks: res[2].data, ratings: res[3].data, matches: res[4].data });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const names = useMemo(() => Object.fromEntries((data?.players ?? []).map((p) => [p.id, p.name])), [data]);
  // askPin(run, { title, message, confirmLabel }) : ouvre la fenêtre PIN puis exécute run(pin)
  const askPin = useCallback((run, options = {}) => setPinAsk({ run, ...options }), []);
  const value = useMemo(() => ({ data, error, names, reload: load, askPin }), [data, error, names, load, askPin]);

  return (
    <AppContext.Provider value={value}>
      {children}
      {pinAsk && <PinModal ask={pinAsk} onClose={() => setPinAsk(null)} />}
    </AppContext.Provider>
  );
}
