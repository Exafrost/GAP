import { sign } from '../../lib/format';
import { computeFields, explainField } from '../../lib/games';
import DetailInput, { FieldLabel } from './DetailInput';

export default function MatchResult({
  game, picked, names, calc, k, canSave, onRang, onSave,
  playerDetails, matchDetails, onPlayerDetail, onMatchDetail,
}) {
  const fields = game?.detail_fields ?? [];
  const playerFields = fields.filter((f) => (f.scope ?? 'player') === 'player');
  const matchFields = fields.filter((f) => f.scope === 'match');
  const computed = Object.fromEntries(
    picked.map((p) => [p.id, computeFields(playerDetails[p.id], playerFields)])
  );
  return (
    <form className="panel pad" onSubmit={(e) => {e.preventDefault(); onSave();}}>
        <h2>Résultat</h2>
        {picked.length === 0 && <p className="note">Sélectionnez au moins {game.min_player} joueurs, puis indiquez le rang de chacun.</p>}
        
        {picked.length > 0 && (
          <div className="table-scroll">
            <table className="matrix">
              <thead>
                <tr>
                  <td />
                  {picked.map((player) => <th key={player.id} scope="col">{names[player.id]}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Rang</th>
                  {picked.map((player) => (
                    <td key={player.id}>
                      <select className="rang" aria-label={'Rang de ' + names[player.id]} value={player.rang} onChange={(e) => onRang(player.id, e.target.value)}>
                        {picked.map((_, i) => <option key={i} value={i + 1}>{i + 1}{i === 0 ? 'er' : 'e'}</option>)}
                      </select>
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row">Elo</th>
                  {picked.map((p) => {
                    const c = calc[p.id];
                    return <td key={p.id}>{c ? `${Math.round(c.before)} → ${Math.round(c.after)}` : '—'}</td>;
                  })}
                </tr>
                <tr>
                  <th scope="row">Variation</th>
                  {picked.map((p) => {
                    const c = calc[p.id];
                    return <td key={p.id}>{c ? <b className={c.delta >= 0 ? 'up' : 'down'}>{sign(c.delta)}</b> : '—'}</td>;
                  })}
                </tr>
                {playerFields.map((field) => (
                  <tr key={field.key}>
                    <th scope="row"><FieldLabel game={game} field={field} /></th>
                    {picked.map((player) => (
                      <td key={player.id}>
                        <DetailInput
                          field={field}
                          label={`${field.label} de ${names[player.id]}`}
                          value={field.type === 'computed' ? computed[player.id][field.key] : playerDetails[player.id]?.[field.key] ?? ''}
                          onChange={(v) => onPlayerDetail(player.id, field.key, Number(v))}
                          parts={explainField(field, playerDetails[player.id])}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {picked.length > 0 && (
          <p className="note">Même rang = égalité.{k != null && ` Coefficient K appliqué : ${k} (${picked.length} joueurs).`}</p>
        )}

        {matchFields.length > 0 && (
          <>
            <h3>Détails de la partie</h3>
            {matchFields.map((field) => (
              <div key={field.key}>
                <label htmlFor={'m-' + field.key}><span><FieldLabel game={game} field={field} /></span></label>
                <DetailInput id={'m-' + field.key} field={field} value={matchDetails[field.key] ?? ''} onChange={(v) => onMatchDetail(field.key, v)} />
              </div>
            ))}
          </>
        )}

        <button className="button button-primary main" disabled={!canSave}>Enregistrer la partie</button>
    </form>
  );
}