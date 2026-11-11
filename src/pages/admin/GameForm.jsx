import { useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import FieldInput from './FieldInput';

export default function GameForm() {
  const { data, askPin, reload } = useApp();
  const [name, setName] = useState('');
  const [defK, setDefK] = useState(32);
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [ks, setKs] = useState({});
  const [image, setImage] = useState('');
  const [ownerIds, setOwnerIds] = useState([]);
  const [scoreField, setScoreFields] = useState([]);

  const numberOfPlayerArray = Array.from({length: maxPlayers-minPlayers+1}, (_, k) => minPlayers+k);

  const addScoreField = () => {
    const newId = Math.max(0, ...scoreField.map((f) => f.id)) + 1;
    setScoreFields([...scoreField, {id: newId, key:"", name:"", required:true, type:"player", computeFunction:"", iconPath:"", ranks: false}])
  };

  const removeScoreField = (id) => setScoreFields((fields) => fields.filter((f) => f.id !== id))
  const updateScoreField = (id, changes) => setScoreFields((fields) => fields.map((f) => (f.id === id ? { ...f, ...changes } : f)));
  const rankingId = scoreField.find((f) => f.ranks)?.id ?? '';

  const setRanking = (id) => setScoreFields((fields) => fields.map((f) => ({ ...f, ranks: f.id === id })));

  const detailFields = scoreField.map(({ id, name, iconPath, computeFunction, ranks, required, type, key }) => ({
    key,
    label: name,
    scope: 'player',
    type: type === 'computed' ? 'computed' : 'number',
    required: required === false ? false : undefined, // obligatoire par défaut, on ne stocke que l'exception
    icon: iconPath || undefined,
    calculator: type === 'computed' ? computeFunction || undefined : undefined,
    ranks: ranks || undefined,
  }));

  const submit = (e) => {
    e.preventDefault();
    const p_k = Object.entries(ks)
      .filter(([, v]) => v !== '')
      .map(([n, v]) => ({ nb_players: Number(n), k_factor: Number(v) }));
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_game', {
        p_pin: pin, p_name: name, p_default_k: Number(defK), p_k, p_image: image.trim() || null, p_owners: ownerIds,
        p_min_player: minPlayers, p_max_player: maxPlayers, p_detail_fields: detailFields,
      });
      if (error) throw error;
      setName('');
      setKs({});
      setImage('');
      await reload();
    });
  };

  // Détenteurs
  const toggle = (id) => setOwnerIds((players) => (players.includes(id) ? players.filter((x) => x !== id) : [...players, id]));

  return (
    <form className="panel pad" onSubmit={submit}>
      <h2>Ajouter un jeu</h2>
      <label htmlFor="gname">Nom du jeu</label>
      <input id="gname" value={name} onChange={(e) => setName(e.target.value)} required />
      <label htmlFor="dk">K par défaut</label>
      <input id="dk" type="number" min="1" value={defK} onChange={(e) => setDefK(e.target.value)} required />
      <label htmlFor="min-player">Minimum de joueurs</label>
      <input id="min-player" type="number" min="2" max="12" value={minPlayers} onChange={(e) => setMinPlayers(Number(e.target.value))} required />
      <label htmlFor="max-player">Maximum de jouers</label>
      <input id="max-player" type="number" min="2" max="12" value={maxPlayers} onChange={(e) => setMaxPlayers(Number(e.target.value))} required />
      <label htmlFor="detenteurs">Détenteur(s)</label>
      <div id="detenteurs" className="pgrid">
        {data.players.map((player) => {
          const on = ownerIds.includes(player.id);
          return (
            <button key={player.id} type="button" className={'button inline toggable-button' + (on ? ' toggled' : '')} aria-pressed={on} onClick={() => toggle(player.id)}>
              {player.name}
            </button>
          );
        })}
      </div>
      <label>K selon le nombre de joueurs <span className="muted">facultatif</span></label>
      <div className="k-grid">
        {numberOfPlayerArray.map((n) => (
          <input key={n} type="number" min="1" placeholder={n + ' joueurs'} aria-label={'K pour ' + n + ' joueurs'} value={ks[n] ?? ''} onChange={(e) => setKs({ ...ks, [n]: e.target.value })} />
        ))}
      </div>
      <label htmlFor="img">Fichier image <span className="muted">facultatif</span></label>
      <input id="img" placeholder="catan.jpg" value={image} onChange={(e) => setImage(e.target.value)} />
      <p className="note">Placez l’image dans <code>public/games/</code>. Sans nom de fichier, le site cherche <code>nom-du-jeu.extension</code>.</p>
      <label>Champ(s) de score <span className='muted'>facultatif</span></label>
      <button className='button button-seconday' type="button" onClick={() => addScoreField()}>Ajouter un champ</button>
      {scoreField.map((field) => (<FieldInput key={field.id} field={field} removeField={removeScoreField} updateField={updateScoreField} />))}
      {scoreField.length > 0 && (
      <div>
        <label htmlFor="ranking">Champ de classement</label>
        <select id="ranking" value={rankingId} required onChange={(e) => setRanking(Number(e.target.value))}>
          <option value="">Choisir un champ…</option>
          {scoreField.map((field) => (
            <option key={field.id} value={field.id}>{field.name || `Champ ${field.id}`}</option>
          ))}
        </select>
      </div>
      )}
      <button className="button button-primary">Ajouter le jeu</button>
    </form>
  );
}
