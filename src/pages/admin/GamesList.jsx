import { useApp } from '../../context/AppContext';
import { gameImageFile, kSummary } from '../../lib/games';

export default function GamesList() {
  const { data } = useApp();
  return (
    <section className="panel pad">
      <h2>Jeux et coefficients K</h2>
      {data.games.map((g) => (
        <div className="line" key={g.id}>
          <span className="grow">
            {g.name}
            <small>{kSummary(g, data.ks)}</small>
            <small>Image : public/games/{gameImageFile(g)}</small>
          </span>
        </div>
      ))}
    </section>
  );
}
