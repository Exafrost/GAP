
export const CALCULATORS = {
  'wonders-total': SevenWonders,
  'miams': Miams,
  'scoville': Scoville
};

const NumberOrZero = (x) => Number(x) || 0;

function sciences(t, c, g, jokers) {
  let best = 0;
  for (let a = 0; a <= jokers; a++)
    for (let b = 0; b <= jokers - a; b++) {
      const x = t + a, y = c + b, z = g + (jokers - a - b);
      best = Math.max(best, x * x + y * y + z * z + 7 * Math.min(x, y, z));
    }
  return best;
}

export function SevenWonders(valueDict = {}) {
  const parts = {
    Militaire: NumberOrZero(valueDict.militaire),
    Pièces: Math.floor(NumberOrZero(valueDict.pieces) / 3),
    Merveille: NumberOrZero(valueDict.merveille),
    Civil: NumberOrZero(valueDict.civil),
    Commerce: NumberOrZero(valueDict.commerce),
    Guildes: NumberOrZero(valueDict.guildes),
    Sciences: sciences(NumberOrZero(valueDict.tablette), NumberOrZero(valueDict.compas), NumberOrZero(valueDict.rouage), NumberOrZero(valueDict.joker)),
  };
  return { total: Object.values(parts).reduce((a, b) => a + b, 0), parts };
}

export function Miams(valueDict = {}){
  const parts = {};
  return {total: NumberOrZero(valueDict.coeurs) + NumberOrZero(valueDict.etoiles), parts}
}

export function Scoville(valueDict = {}){
  const parts = {
    Recettes: NumberOrZero(valueDict.recettes),
    Marche: NumberOrZero(valueDict.marche),
    TuileBonus: NumberOrZero(valueDict.tuilebonus),
    Pieces: NumberOrZero(valueDict.piece),
    Plaques: NumberOrZero(valueDict.plaques)
  };
  return {total: Object.values(parts).reduce((a, b) => a + b, 0), parts }
}