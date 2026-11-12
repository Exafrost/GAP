import { useState } from 'react';
import { gameImageUrl } from '../lib/games';

const COLORS = ['#6a3a8c', '#c43d2e', '#e58a1f', '#4b2a66', '#a3402f'];

// Image locale du jeu ; si le fichier est absent, on affiche un visuel de remplacement coloré aléatoirement selon le nom.
// À utiliser avec key={game.id} pour réinitialiser l'état quand on change de jeu.
export default function GameCover({ game, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    const color = COLORS[[...game.name].reduce((oldValue, currentLetter) => oldValue + currentLetter.charCodeAt(0), 0) % COLORS.length];
    const initials = game.name.split(/\s+/).map((word) => word[0]).join('').slice(0, 3).toUpperCase();
    return (
      <div className={`cover fallback ${className}`} style={{ background: color }} aria-hidden="true">
        {initials}
      </div>
    );
  }
  const url = gameImageUrl(game);
  return (
    <div className={`cover ${className}`}>
      <img className="cover-bg" src={url} alt="" aria-hidden="true" />
      <img className="cover-img" src={url} alt={`Image du jeu ${game.name}`} onError={() => setFailed(true)} />
    </div>
  );
}
