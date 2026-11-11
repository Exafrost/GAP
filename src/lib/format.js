export const today = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-JJ en heure locale
export const fmtDate = (d) =>
  new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
export const sign = (n) => (n > 0 ? '+' : '') + n;
export const plural = (n, word) => `${n} ${word}${n > 1 ? 's' : ''}`;
export const pluralSimple = (n, word) => `${word}${n > 1 ? 's' : ''}`;
