export default function FieldInput({ field, removeField, updateField }) {
  const set = (key) => (e) => updateField(field.id, { [key]: e.target.value });

  return (
    <div className="flex">
      <input id={'field' + field.id} value={field.key} onChange={set('key')} placeholder="Clé" required />
      <input value={field.name} onChange={set('name')} placeholder="Libellé" required />
      <select value={String(field.required)} onChange={(e) => updateField(field.id, { required: e.target.value === 'true' })}>
        <option value="true">Obligatoire</option>
        <option value="false">Optionnel</option>
      </select>
      <select value={field.type} onChange={set('type')}>
        <option value="player">Champ joueur</option>
        <option value="computed">Champ calculé</option>
      </select>
      {field.type === 'computed' && (
        <input value={field.computeFunction} onChange={set('computeFunction')} placeholder="Fonction de calcul" required />
      )}
      <input value={field.iconPath} onChange={set('iconPath')} placeholder="Chemin icône" />
      <button type="button" className="button button-primary sm" title="Supprimer le champ" onClick={() => removeField(field.id)}>-</button>
    </div>
  );
}