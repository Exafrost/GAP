import PageHeader from '../../components/PageHeader';
import PlayerForm from './PlayerForm';
import GameForm from './GameForm';
import GamesList from './GamesList';

export default function Admin() {
  return (
    <>
      <PageHeader title="Gestion" lead="Joueurs, jeux et coefficients K" />
      <div className="cols">
        <div className="stack">
          <PlayerForm />
          <GameForm />
        </div>
        <GamesList />
      </div>
    </>
  );
}
