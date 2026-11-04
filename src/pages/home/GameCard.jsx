import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GameCover from '../../components/GameCover';
import { gameStats } from '../../lib/games';
import { plural } from '../../lib/format';

export default function GameCard({ game }) {
  const { data, names } = useApp();
  const { ranking, matches } = gameStats(data, game.id);
  const leader = ranking[0];
  return (
    <Link to={`/jeu/${game.id}`} className="gcard">
      <GameCover key={game.id} game={game} />
      <div className="gcard-body">
        <h2>{game.name}</h2>
        <p className="muted">{plural(matches.length, 'partie')} · {plural(ranking.length, 'joueur')}</p>
        {leader && (
          <p className="leader">
            <span className="token t1 sm">1</span> {names[leader.player_id]} <b>{Math.round(leader.elo)}</b>
          </p>
        )}
      </div>
    </Link>
  );
}
