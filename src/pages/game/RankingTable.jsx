export default function RankingTable({ rows, names }) {
  if (!rows.length) return <p className="muted pad">Aucune partie pour ce jeu. Lancez la première !</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Rang</th>
          <th>Joueur</th>
          <th className="num">Parties</th>
          <th className="num">Elo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.player_id} className={i === 0 ? 'first' : ''}>
            <td><span className={'ranking-token p' + Math.min(i + 1, 4)}>{i + 1}</span></td>
            <td><b>{names[r.player_id]}</b></td>
            <td className="num">{r.games_played}</td>
            <td className="num elo">{Math.round(r.elo)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
