import { plural } from '../../lib/format';

export default function MatchSettings({ games, players, gameId, onGame, date, onDate, picked, onToggle }) {
  const game = games.find((g) => g.id === gameId);

  return (
    <section className="panel pad">
      <h2>Paramètres</h2>
      <label htmlFor="game">Jeu</label>
      <select id="game" value={gameId} onChange={(e) => onGame(e.target.value)}>
        {games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      {!games.length && <p className="note">Aucun jeu. Ajoutez-en un dans « Gestion ».</p>}

      <label htmlFor="date">Date de la partie</label>
      <input id="date" type="date" value={date} onChange={(e) => onDate(e.target.value)} />

      <label>Joueurs <span className="muted">{plural(picked.length, 'sélectionné')} (min : {game.min_player}, max : {game.max_player})</span></label>
      {!players.length && <p className="note">Aucun joueur. Ajoutez-en dans « Gestion ».</p>}
      <div className="pgrid">
        {players.map((player) => {
          const selected = picked.some((x) => x.id === player.id);
          return (
            <button key={player.id} type="button" className={'button toggable-button' + (selected ? ' toggled' : '')} aria-pressed={selected} onClick={() => onToggle(player.id)}>
              {player.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
