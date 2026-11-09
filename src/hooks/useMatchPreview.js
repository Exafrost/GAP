import { useMemo } from 'react';
import { calculateResult } from '../lib/Helper/eloHelper';

/** Fonction retournant les résultats théoriques du match
 */
export function useMatchPreview(game, ks, picked, ratings) {
  return useMemo(() => calculateResult(game, ks, picked, ratings), [game, ks, picked, ratings]);
}