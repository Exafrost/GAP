import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getK } from '../../lib/Helper/eloHelper';
import { today } from '../../lib/format';
import PageHeader from '../../components/PageHeader';
import MatchSettings from './MatchSettings';
import MatchResult from './MatchResult';
import { cleanDetails, computeFields } from '../../lib/games';
import { GetFieldsOfScope } from '../../lib/Helper/fieldsHelper';
import { useMatchPreview } from '../../hooks/useMatchPreview';
import { saveMatch } from '../../lib/supabaseCaller';


export default function NewMatch() {
  const { data, reload, askPin, names } = useApp();
  const navigate = useNavigate();
  const wanted = useSearchParams()[0].get('jeu'); // /partie?jeu=<id> depuis la page d'un jeu
  const [gameId, setGameId] = useState(data.games.some((g) => g.id === wanted) ? wanted : data.games[0]?.id ?? '');
  const [date, setDate] = useState(today());
  const [picked, setPicked] = useState([]); // [{ id, rang }]
  const [playerDetails, setPlayerDetails] = useState({}); // { [playerId]: { [key]: valeur } }
  const [matchDetails, setMatchDetails] = useState({});   // { [key]: valeur }
  const game = data.games.find((g) => g.id === gameId);
  const fields = game?.detail_fields ?? [];
  const playerFields = GetFieldsOfScope('player', fields);
  const matchFields = GetFieldsOfScope('match', fields);
  const rankField = playerFields.find((f) => f.ranks);

  const setPlayerDetail = (id, key, value) =>
    setPlayerDetails((d) => ({ ...d, [id]: { ...d[id], [key]: value } }));
  const setMatchDetail = (key, value) => setMatchDetails((d) => ({ ...d, [key]: value }));
  const changeGame = (id) => {
    setGameId(id);
    setPlayerDetails(Object.fromEntries(picked.map((p) => [p.id, {}])));
    setMatchDetails({});
  };
  
  const toggle = (id) => {
    const removing = picked.some((x) => x.id === id);
    setPicked((p) =>
      removing
        ? p.filter((x) => x.id !== id).map((x) => ({ ...x, rang: Math.min(x.rang, p.length - 1) }))
        : [...p, { id, rang: p.length + 1 }]
    );
    setPlayerDetails((d) => {
      if (removing) {
        const { [id]: _removed, ...rest } = d; // un joueur retiré perd ses saisies
        return rest;
      }
      return { ...d, [id]: {} }; // un joueur ajouté démarre avec des détails vides
    });
  };
  const setRang = (id, rang) => setPicked((p) => p.map((x) => (x.id === id ? { ...x, rang: Number(rang) } : x)));
  const rankByPoints = () =>
    setPicked((p) => {
      const total = (id) => computeFields(playerDetails[id], playerFields)[rankField.key] ?? 0;
      return p.map((x) => ({ ...x, rang: 1 + p.filter((o) => total(o.id) > total(x.id)).length }));
    });

  const k = getK(game, data.ks, picked.length);
  const preview = useMatchPreview(game, data.ks, picked, data.ratings);

  const save = () =>
    askPin(async (pin) => {
      await saveMatch(pin, gameId, date, preview, playerDetails, playerFields, matchDetails, matchFields);
      await reload();
      navigate(`/jeu/${gameId}`);
    });

  return (
    <>
      <PageHeader title="Nouvelle partie" lead="Saisir le résultat d’une partie et mettre à jour le classement" />
      <div className="rows">
        <MatchSettings
          games={data.games} players={data.players} gameId={gameId} onGame={changeGame}
          date={date} onDate={setDate} picked={picked} onToggle={toggle}
        />
        {rankField && picked.length >= 2 && <button type="button" className="button button-primary inline" onClick={rankByPoints}>Classer selon « {rankField.label} »</button>}
        <MatchResult
          game={game} picked={picked} names={names}
          calc={Object.fromEntries(preview.map((p) => [p.id, p]))} k={k}
          canSave={Boolean(game) && picked.length >= 2 && Boolean(date)}
          onRang={setRang} onSave={save}
          playerDetails={playerDetails} matchDetails={matchDetails}
          onPlayerDetail={setPlayerDetail} onMatchDetail={setMatchDetail}
        />
      </div>
    </>
  );
}
