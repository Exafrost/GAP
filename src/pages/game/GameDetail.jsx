import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GameCover from '../../components/GameCover';
import { gameStats, kSummary } from '../../lib/games';
import { plural } from '../../lib/format';
import RankingTable from './RankingTable';
import MatchHistory from './MatchHistory';
import OwnersEditor from './OwnersEditor';
import { supabase } from '../../supabase';

export default function GameDetail() {
  const { gameId } = useParams();
  const { data, names } = useApp();
  const { askPin, reload } = useApp();
  const game = data.games.find((g) => g.id === gameId);
  const owners = game.game_owners.map((o) => o.players.name).sort();
  
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
  const last = matches.reduce((best, m) => (m.created_at > best.created_at ? m : best));
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
          <p className="muted">{kSummary(game, data.ks)}</p>
          
        </div>
      </header>
      <div className="btn-row">
        <OwnersEditor key={game.id} game={game} />
        <Link className="button button-primary inline" to={`/partie?jeu=${game.id}`}>Nouvelle partie</Link>
      </div>
      <div className="cols">
        <section className="panel">
          <h2 className="panel-title">Classement actuel</h2>
          <RankingTable rows={ranking} names={names} />
        </section>
        <section className="panel pad">
          <h2>Historique des parties</h2>
          {last && (
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
