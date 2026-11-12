import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/PageHeader';
import GameCard from './GameCard';
import { useState } from 'react';
import { gameStats } from '../../lib/games';

export default function Home() {
  const { data } = useApp();
  const [filterPlayedGames, setfilterPlayedGames] = useState(false);
  const [games, setGames] = useState(data.games);

  const updateFilteredGames = () => {
    const doFilterPlayedGames = !filterPlayedGames;
    setfilterPlayedGames(doFilterPlayedGames);
    setGames(data.games.filter((game) => {
      const { matches } = gameStats(data, game.id);
      if (doFilterPlayedGames){
        return matches.length > 0;
      }
      else {
        return true;
      }
    }));
  }

  return (
    <>
      <PageHeader title="Jeux" lead="Choisissez un jeu pour voir son classement et son historique" displayHelpELOLink={true}/>
      {data.games.length === 0 ? (
        <p className="muted">Aucun jeu pour l’instant. <Link to="/gestion">Ajoutez-en un</Link>.</p>
      ) : (
        <div>
          <button type='button' className={'page-head toggable-button' + (filterPlayedGames ? ' toggled' : '')} onClick={() => updateFilteredGames()}>Afficher uniquement les jeux joués</button>
          <div className="gcards">
            {games.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        </div>
      )}
    </>
  );
}
