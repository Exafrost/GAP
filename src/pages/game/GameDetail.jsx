import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GameCover from '../../components/GameCover';
import { gameStats, kSummary } from '../../lib/games';
import { plural } from '../../lib/format';
import RankingTable from './RankingTable';
import MatchHistory from './MatchHistory';
import OwnersEditor from './OwnersEditor';
import { supabase } from '../../supabase';
import { useState } from 'react';
import FieldEditor from '../../components/FieldEditor';
import { GetScoreFieldFormatted } from '../../lib/Helper/fieldsHelper';

export default function GameDetail() {
  const { gameId } = useParams();
  const { data, names } = useApp();
  const { askPin, reload } = useApp();
  const [displayScoreField, setDisplayScoreField] = useState(null);
  const [displayOwnerEditor, setDisplayOwnerEditor] = useState(null);
  const game = data.games.find((g) => g.id === gameId);
  const owners = game.game_owners.map((o) => o.players.name).sort();

 const initScoreFields = () =>
  (game?.detail_fields ?? []).map((field, i) => ({
    id: i + 1,
    key: field.key,
    name: field.label ?? '',
    required: field.required !== false,
    type: field.type === 'computed' ? 'computed' : 'player',
    computeFunction: field.calculator ?? '',
    iconPath: field.icon ?? '',
    ranks: Boolean(field.ranks),
  }));

  const [scoreField, setScoreFields] = useState(initScoreFields());
  
  if (!game) {
    return (
      <>
        <p className="muted">Ce jeu n’existe pas.</p>
        <Link to="/" className="back">← Tous les jeux</Link>
      </>
    );
  }
  const { ranking, matches } = gameStats(data, game.id);
  const byRang = (m) => [...m.match_players].sort((a, b) => a.rang - b.rang);

  // La « dernière » partie est la dernière SAISIE (created_at), pas forcément la plus récente en date :
  // c'est elle qui détermine l'Elo courant, donc la seule qu'on peut annuler sans fausser les suivantes.
  const last = matches.reduce((best, m) => (m.created_at > best.created_at ? m : best), {created_at:"1999-01-01"});
  const removeLastMatch = () =>
      askPin(
        async (pin) => {
          const { error } = await supabase.rpc('delete_last_match', { p_pin: pin, p_match_id: last.id });
          if (error) throw error;
          await reload();
        },
        {
          title: 'Supprimer cette partie ?',
          message:
            'Les points seront annulés : ' +
            byRang(last).map((p) => `${names[p.player_id]} ${Math.round(p.elo_after)} → ${Math.round(p.elo_before)}`).join(', ') +
            '.',
          confirmLabel: 'Supprimer la partie',
        }
      );

  const updateScoreFields = () => {
    askPin(
      async (pin) => {
        const { error } = await supabase.rpc('set_game_fields', {
          p_pin: pin,
          p_game_id: game.id,
          p_detail_fields: GetScoreFieldFormatted(scoreField),
        });
        if (error) throw error;
        await reload();
        setDisplayScoreField(null);
      }
    )
  }

  return (
    <>
      <Link to="/" className="back">← Tous les jeux</Link>
      <header className="hero">
        <GameCover key={game.id} game={game} className="hero-cover" />
        <div>
          <h1>{game.name}</h1>
          <p className="lead">{plural(matches.length, 'partie')} · {plural(ranking.length, 'joueur')}</p>
          {owners.length === 1 && <p className="muted">Détenteur : {owners[0]}</p>}
          {owners.length > 1 && <p className="muted">Détenteurs : {owners.join(', ')}</p>}
          <p className='muted'>Minimum de joueurs : {game.min_player}</p>
          <p className='muted'>Maximum de joueurs : {game.max_player}</p>
          <p className="muted">{kSummary(game, data.ks)}</p>
          
        </div>
      </header>
      {displayScoreField && 
      <div className='panel pad'>
        <h2>Modifier les champs de score</h2>
        <FieldEditor scoreField={scoreField} setScoreFields={setScoreFields}/>
        <div className="btn-row">
          <button type='button' className='button button-primary inline' onClick={() => updateScoreFields()}>Confirmer</button>
          <button type='button' className='button button-secondary inline' onClick={() => setDisplayScoreField(null)}>Annuler</button>
        </div>
      </div>}
      <div className="btn-row">
        {!displayScoreField && <OwnersEditor key={game.id} game={game} setOpenEditor={setDisplayOwnerEditor} />}
        {!displayScoreField && !displayOwnerEditor && <button type='button' className='button button-primary inline' onClick={() => setDisplayScoreField(true)}>Modifier les champs de score</button>}
        
        {!displayScoreField && !displayOwnerEditor && <Link className="button button-primary inline" to={`/partie?jeu=${game.id}`}>Nouvelle partie</Link>}
      </div>
      <div className="cols">
        <section className="panel">
          <h2 className="panel-title">Classement actuel</h2>
          <RankingTable rows={ranking} names={names} />
        </section>
        <section className="panel pad">
          <h2>Historique des parties</h2>
          {last?.id && (
                <button className="textbtn" title="Dernière partie saisie : ses points seront annulés" onClick={() => removeLastMatch()}>
                  Supprimer la dernière partie
                </button>
              )}
          <MatchHistory matches={matches} names={names} game={game} />
        </section>
      </div>
    </>
  );
}
