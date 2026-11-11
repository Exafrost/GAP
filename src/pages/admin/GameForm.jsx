import { useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';
import FieldEditor from '../../components/FieldEditor';
import { GetScoreFieldFormatted } from '../../lib/Helper/fieldsHelper';

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


  const submit = (e) => {
    e.preventDefault();
    const p_k = Object.entries(ks)
      .filter(([, v]) => v !== '')
      .map(([n, v]) => ({ nb_players: Number(n), k_factor: Number(v) }));
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_game', {
        p_pin: pin, p_name: name, p_default_k: Number(defK), p_k, p_image: image.trim() || null, p_owners: ownerIds,
        p_min_player: minPlayers, p_max_player: maxPlayers, p_detail_fields: GetScoreFieldFormatted(scoreField),
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
      
      <FieldEditor scoreField={scoreField} setScoreFields={setScoreFields}/>
      <button className="button button-primary">Ajouter le jeu</button>
    </form>
  );
}
