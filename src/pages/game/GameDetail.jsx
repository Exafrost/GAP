import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GameCover from '../../components/GameCover';
import { gameStats, kSummary } from '../../lib/games';
import { plural } from '../../lib/format';
import RankingTable from './RankingTable';
import MatchHistory from './MatchHistory';
import OwnersEditor from './OwnersEditor';

export default function GameDetail() {
  const { gameId } = useParams();
  const { data, names } = useApp();
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
          <MatchHistory matches={matches} names={names} />
        </section>
      </div>
    </>
  );
}
