import { sign } from '../../lib/format';

export default function MatchResult({ picked, names, calc, k, canSave, onRang, onSave }) {
  return (
    <section className="panel pad">
      <h2>Résultat</h2>
      {picked.length === 0 && <p className="note">Sélectionnez au moins deux joueurs, puis indiquez le rang de chacun.</p>}
      {picked.map((p) => {
        const c = calc[p.id];
        return (
          <div className="line" key={p.id}>
            <span className="grow">
              {names[p.id]}
              <small>{c ? `${Math.round(c.before)} → ${Math.round(c.after)}` : 'Ajoutez un 2e joueur'}</small>
            </span>
            {c && <b className={c.delta >= 0 ? 'up' : 'down'}>{sign(c.delta)}</b>}
            <select className="rang" aria-label={'Rang de ' + names[p.id]} value={p.rang} onChange={(e) => onRang(p.id, e.target.value)}>
              {picked.map((_, i) => <option key={i} value={i + 1}>{i + 1}{i === 0 ? 'er' : 'e'}</option>)}
            </select>
          </div>
        );
      })}
      {picked.length > 0 && (
        <p className="note">Même rang = égalité.{k != null && ` Coefficient K appliqué : ${k} (${picked.length} joueurs).`}</p>
      )}
      <button className="button button-primary" disabled={!canSave} onClick={onSave}>Enregistrer la partie</button>
    </section>
  );
}
