import { useMemo } from "react";

export const START_ELO = 1000;

/** Returns the K value for a game specific to a given number of players
 * Return null if no game or fewer than 2 players are given
 */
export function getK(game, kFactors, nbPlayers) {
  if (!game || nbPlayers < 2) return null;

  const found = kFactors.find((k) => k.game_id === game.id && k.nb_players === nbPlayers);
  return Number(found ? found.k_factor : game.default_k);
}

/**
 * Elo multijoueur : chaque joueur est comparé à chacun des autres
 * players : [{ id, elo, rang }]  (rang 1 = vainqueur, rang identique = égalité)
 * Delta = K / (N-1) * somme(résultat réel - résultat attendu)
 */
export function computeElo(players, k) {
  const n = players.length;
  return players.map((p) => {
    let sum = 0;
    for (const o of players) {
      if (o.id === p.id) continue;
      const actual = p.rang < o.rang ? 1 : p.rang === o.rang ? 0.5 : 0;
      const expected = 1 / (1 + 10 ** ((o.elo - p.elo) / 400));
      sum += actual - expected;
    }
    const after = Math.round((p.elo + (k / (n - 1)) * sum) * 10) / 10;
    return { ...p, before: p.elo, after, delta: Math.round((after - p.elo) * 10) / 10 };
  });
}

/** Fonction calculant l'elo pour les joueurs
 * Retourne une liste avec les données de joueurs et
 * - before : elo avant modification
 * - after : elo après modification
 * - delta : variation de l'elo
 */
export function calculateResult(game, ks, playerList, ratings) {
  const k = getK(game, ks, playerList.length);
  if (k == null) return [];

  // Récupère la liste des joueurs avec leur elo
  const withElo = playerList.map((player) => ({
    ...player,
    elo: Number(ratings.find((r) => r.game_id === game.id && r.player_id === player.id)?.elo ?? START_ELO),
  }));

  return computeElo(withElo, k);
}