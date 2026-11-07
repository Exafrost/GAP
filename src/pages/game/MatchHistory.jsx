import { Link } from 'react-router-dom';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import { fmtDate, sign } from '../../lib/format';

export default function MatchHistory({ matches, names, game }) {
  const { askPin, reload } = useApp();
  if (!matches.length) return <p className="muted">Aucune partie enregistrée.</p>;

  // La « dernière » partie est la dernière SAISIE (created_at), pas forcément la plus récente en date :
  // c'est elle qui détermine l'Elo courant, donc la seule qu'on peut annuler sans fausser les suivantes.
  const last = matches.reduce((best, m) => (m.created_at > best.created_at ? m : best));
  const byRang = (m) => [...m.match_players].sort((a, b) => a.rang - b.rang);

  const remove = (m) =>
    askPin(
      async (pin) => {
        const { error } = await supabase.rpc('delete_last_match', { p_pin: pin, p_match_id: m.id });
        if (error) throw error;
        await reload();
      },
      {
        title: 'Supprimer cette partie ?',
        message:
          'Les points seront annulés : ' +
          byRang(m).map((p) => `${names[p.player_id]} ${Math.round(p.elo_after)} → ${Math.round(p.elo_before)}`).join(', ') +
          '.',
        confirmLabel: 'Supprimer la partie',
      }
    );

  return (
    <div className="history mcards">
      {matches.map((m) => (
        <Link to={`/jeu/${game.id}/${m.id}`} className="mcard">
          <div className="match mcard-body" key={m.id}>
            <div className="match-head">
              <span>{fmtDate(m.played_at)}</span>
              {m.id === last.id && (
                <button className="textbtn" title="Dernière partie saisie : ses points seront annulés" onClick={() => remove(m)}>
                  Supprimer
                </button>
              )}
            </div>
            {byRang(m).map((p) => {
              const d = Math.round((p.elo_after - p.elo_before) * 10) / 10;
              return (
                <div className="line" key={p.player_id}>
                  <span className="ranking-token sm">{p.rang}</span>
                  <span className="grow">{names[p.player_id]}</span>
                  <span>{Math.round(p.elo_after)}</span>
                  <b className={'delta ' + (d >= 0 ? 'up' : 'down')}>{sign(d)}</b>
                </div>
              );
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
