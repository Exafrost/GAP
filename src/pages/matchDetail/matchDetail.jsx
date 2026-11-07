import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import GameCover from '../../components/GameCover';
import { gameStats } from '../../lib/games';
import { fmtDate, sign } from '../../lib/format';
import DetailOutput from './DetailOutput';
import { FieldLabel } from '../match/DetailInput';

export default function MatchDetail() {
  const { gameId, matchId } = useParams();
  const { data, names } = useApp();
  const game = data.games.find((g) => g.id === gameId);
  
  if (!game) {
    return (
      <>
        <p className="muted">Ce jeu n’existe pas.</p>
        <Link to="/" className="back">← Tous les jeux</Link>
      </>
    );
  }

  const { matches } = gameStats(data, game.id);
  const match = matches.find((m) => m.id === matchId);
  const match_players = match.match_players;
  
  // Informations linked to fields
  const fields = game?.detail_fields ?? [];
  const playerFields = fields.filter((f) => (f.scope ?? 'player') === 'player');
  const matchFields = fields.filter((f) => f.scope === 'match');

  return (
    <>
        <Link to={`/jeu/${game.id}`} className="back">← {game.name}</Link>
        <header className="hero">
            <GameCover key={game.id} game={game} className="hero-cover" />
            <div>
                <h1>Historique de la partie</h1>
                <p className="lead">Date : {fmtDate(match.played_at)}</p>
            </div>
        </header>

        <section className="panel pad">
            <h2>Résultats</h2>
            
            <div className="table-scroll">
                <table className="matrix">
                <thead>
                    <tr>
                    <td />
                    {match_players.map((player) => <th key={player.id} scope="col">{names[player.player_id]}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th scope="row">Rang</th>
                        {match_players.map((player) => (
                            <td key={player.player_id}>
                                <span className={'ranking-token p' + player.rang}>{player.rang}</span>
                            </td>
                        ))}
                    </tr>
                    <tr>
                        <th scope="row">Elo avant</th>
                            {match_players.map((player) => (
                                <td key={player.player_id}>
                                    <span>{Math.round(player.elo_before)}</span>
                                </td>
                            ))}
                    </tr>
                    <tr>
                        <th scope="row">Elo après</th>
                            {match_players.map((player) => (
                                <td key={player.player_id}>
                                    <span>{Math.round(player.elo_after)}</span>
                                </td>
                            ))}
                    </tr>
                    <tr>
                        <th scope="row">Variation</th>
                        {match_players.map((player) => {
                            const d = Math.round((player.elo_after - player.elo_before) * 10) / 10;
                            return (<td key={player.player_id}>
                                <b className={'delta ' + (d >= 0 ? 'up' : 'down')}>{sign(d)}</b>
                            </td>
                        )})}
                    </tr>
                    {playerFields.map((field) => (
                    <tr key={field.key}>
                        <th scope="row"><FieldLabel game={game} field={field} /></th>
                        {match_players.map((player) => (
                            <td key={player.player_id}>
                                <DetailOutput
                                field={field}
                                label={`${field.label} de ${names[player.id]}`}
                                value={player.details[field.key] ?? ''}
                                />
                            </td>
                        ))}
                    </tr>
                    ))} 
                </tbody>
                </table>
            </div>

            {matchFields.length > 0 && (
            <>
                <h3>Détails de la partie</h3>
                {matchFields.map((field) => (
                <div key={field.key}>
                    <label htmlFor={'m-' + field.key}><span><FieldLabel game={game} field={field} /></span></label>
                    <DetailOutput id={'m-' + field.key} field={field} value={matchFields[field.key] ?? ''}/>
                </div>
                ))}
            </>
            )}

        </section>
    </>
  );
}