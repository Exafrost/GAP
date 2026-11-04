import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/PageHeader';
import GameCard from './GameCard';

export default function Home() {
  const { data } = useApp();
  return (
    <>
      <PageHeader title="Jeux" lead="Choisissez un jeu pour voir son classement et son historique" />
      {data.games.length === 0 ? (
        <p className="muted">Aucun jeu pour l’instant. <Link to="/gestion">Ajoutez-en un</Link>.</p>
      ) : (
        <div className="gcards">
          {data.games.map((g) => <GameCard key={g.id} game={g} />)}
        </div>
      )}
    </>
  );
}
