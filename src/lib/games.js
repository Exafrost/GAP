const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Image locale : colonne games.image, sinon <nom-du-jeu>.jpg, à placer dans public/games/
export const gameImageFile = (game) => game.image || slugify(game.name) + '.jpg';
export const gameImageUrl = (game) => `${import.meta.env.BASE_URL}games/${gameImageFile(game)}`;

// Classement actuel et parties d'un jeu (les parties sont déjà triées : date décroissante)
export function gameStats(data, gameId) {
  return {
    ranking: data.ratings.filter((r) => r.game_id === gameId).sort((a, b) => b.elo - a.elo),
    matches: data.matches.filter((m) => m.game_id === gameId),
  };
}

export const kSummary = (game, ks) =>
  `K par défaut ${game.default_k}` +
  ks.filter((k) => k.game_id === game.id).sort((a, b) => a.nb_players - b.nb_players).map((k) => ` · ${k.nb_players} j. : ${k.k_factor}`).join('');
