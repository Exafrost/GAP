import { detailIconUrl } from '../../lib/games';

export function FieldLabel({ game, field }) {
  return (
    <span className="field-label">
      {field.icon && (
        <img className="field-icon" src={detailIconUrl(game, field.icon)} alt=""
             onError={(e) => (e.currentTarget.style.display = 'none')} />
      )}
      {field.label}
    </span>
  );
}

export default function DetailInput({ field, value, onChange, id, label, parts }) {
  const common = { id, 'aria-label': label, value, required: field.required !== false, onChange: (e) => onChange(e.target.value) };
  if (field.type === 'choice') {
    return (
      <select {...common}>
        <option value="">—</option>
        {(field.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  else if (field.type === 'computed') {
    return (
      <>
        <output className="computed">{value}</output>
        {parts && <small className="parts">{Object.entries(parts).map(([k, v]) => `${k} ${v}`).join(' · ')}</small>}
      </>
    );
  }

  return <input {...common} type={field.type === 'number' ? 'number' : 'text'} />;
}