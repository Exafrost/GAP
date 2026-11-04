import { plural } from '../../lib/format';

export default function MatchSettings({ games, players, gameId, onGame, date, onDate, picked, onToggle }) {
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

      <label>Joueurs <span className="muted">{plural(picked.length, 'sélectionné')}</span></label>
      {!players.length && <p className="note">Aucun joueur. Ajoutez-en dans « Gestion ».</p>}
      <div className="pgrid">
        {players.map((p) => {
          const on = picked.some((x) => x.id === p.id);
          return (
            <button key={p.id} type="button" className={'player' + (on ? ' on' : '')} aria-pressed={on} onClick={() => onToggle(p.id)}>
              {p.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
