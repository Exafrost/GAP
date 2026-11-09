import { Link } from 'react-router-dom';
import { fmtDate, sign } from '../../lib/format';

export default function MatchHistory({ matches, names, game }) {
  if (!matches.length) return <p className="muted">Aucune partie enregistrée.</p>;
  
  const byRang = (m) => [...m.match_players].sort((a, b) => a.rang - b.rang);
  
  return (
    <div className="history mcards">
      {matches.map((m) => (
        <Link to={`/jeu/${game.id}/${m.id}`} className="mcard">
          <div className="match mcard-body" key={m.id}>
            <div className="match-head">
              <span>{fmtDate(m.played_at)}</span>
            </div>
            {byRang(m).map((p) => {
              const d = Math.round((p.elo_after - p.elo_before) * 10) / 10;
              return (
                <div className="line" key={p.player_id}>
                  <span className="ranking-token sm">{p.rang}</span>
                  <span className="grow">{names[p.player_id]}</span>
                  <span>{Math.round(p.elo_after)}</span>
                  <b className={'delta ' + (d >= 0 ? 'up' : 'down')}>{sign(d)}</b>
                </div>
              );
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
