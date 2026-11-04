import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { computeElo, getK, START_ELO } from '../../elo';
import { today } from '../../lib/format';
import PageHeader from '../../components/PageHeader';
import MatchSettings from './MatchSettings';
import MatchResult from './MatchResult';

export default function NewMatch() {
  const { data, reload, askPin, names } = useApp();
  const navigate = useNavigate();
  const wanted = useSearchParams()[0].get('jeu'); // /partie?jeu=<id> depuis la page d'un jeu
  const [gameId, setGameId] = useState(data.games.some((g) => g.id === wanted) ? wanted : data.games[0]?.id ?? '');
  const [date, setDate] = useState(today());
  const [picked, setPicked] = useState([]); // [{ id, rang }]
  const game = data.games.find((g) => g.id === gameId);

  const toggle = (id) =>
    setPicked((p) =>
      p.some((x) => x.id === id)
        ? p.filter((x) => x.id !== id).map((x) => ({ ...x, rang: Math.min(x.rang, p.length - 1) }))
        : [...p, { id, rang: p.length + 1 }]
    );
  const setRang = (id, rang) => setPicked((p) => p.map((x) => (x.id === id ? { ...x, rang: Number(rang) } : x)));

  const k = game && picked.length >= 2 ? getK(game, data.ks, picked.length) : null;
  const preview = useMemo(() => {
    if (k == null) return [];
    const withElo = picked.map((p) => ({
      ...p,
      elo: Number(data.ratings.find((r) => r.game_id === gameId && r.player_id === p.id)?.elo ?? START_ELO),
    }));
    return computeElo(withElo, k);
  }, [picked, k, gameId, data.ratings]);

  const save = () =>
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_match', {
        p_pin: pin,
        p_game_id: gameId,
        p_played_at: date,
        p_results: preview.map((p) => ({ player_id: p.id, rang: p.rang, elo_before: p.before, elo_after: p.after })),
      });
      if (error) throw error;
      await reload();
      navigate(`/jeu/${gameId}`); // on affiche directement le nouveau classement
    });

  return (
    <>
      <PageHeader title="Nouvelle partie" lead="Saisir le résultat d’une partie et mettre à jour le classement" />
      <div className="cols">
        <MatchSettings
          games={data.games} players={data.players} gameId={gameId} onGame={setGameId}
          date={date} onDate={setDate} picked={picked} onToggle={toggle}
        />
        <MatchResult
          picked={picked} names={names} calc={Object.fromEntries(preview.map((p) => [p.id, p]))} k={k}
          canSave={Boolean(game) && picked.length >= 2 && Boolean(date)} onRang={setRang} onSave={save}
        />
      </div>
    </>
  );
}
