export const START_ELO = 1000;

// K du jeu pour ce nombre de joueurs (sinon K par défaut du jeu)
export function getK(game, kFactors, nbPlayers) {
  const found = kFactors.find((k) => k.game_id === game.id && k.nb_players === nbPlayers);
  return Number(found ? found.k_factor : game.default_k);
}

/**
 * Elo multijoueur : chaque joueur est comparé à chacun des autres (duel virtuel).
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
