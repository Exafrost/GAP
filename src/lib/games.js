import { CALCULATORS } from "./calculator";

const slugify = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Image locale : colonne games.image, sinon <nom-du-jeu>.jpg, à placer dans public/games/
export const gameImageFile = (game) => game.image || slugify(game.name) + '.jpg';
export const gameImageUrl = (game) => `${import.meta.env.BASE_URL}games/${gameImageFile(game)}`;
export const detailIconUrl = (game, file) => `${import.meta.env.BASE_URL}games/icons/${slugify(game.name)}/${file}`;

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

// Retourne la listes des détails triés
export function cleanDetails(values = {}, fields = []) {
  const out = {};
  for (const field of fields) {
    const value = values[field.key];
    if (value === undefined || value === '') continue;
    out[field.key] = field.type === 'number' ? Number(value) : value;
  }
  return out;
}

export function computeFields(values = {}, fields = []) {
  const out = { ...values };
  for (const f of fields) {
    if (f.type !== 'computed') continue;
    if (!CALCULATORS[f.calculator]) continue;
    out[f.key] = f.calculator
      ? CALCULATORS[f.calculator](values).total
      : (f.sum ?? []).reduce((t, s) => t + (Number(values[s.key]) || 0) * (s.weight ?? 1), 0);
  }
  return out;
}

export const explainField = (f, values = {}) => (f.calculator ? CALCULATORS[f.calculator](values).parts : null);
