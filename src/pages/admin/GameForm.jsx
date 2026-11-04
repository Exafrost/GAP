import { useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';

export default function GameForm() {
  const { askPin, reload } = useApp();
  const [name, setName] = useState('');
  const [defK, setDefK] = useState(32);
  const [ks, setKs] = useState({});
  const [image, setImage] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const p_k = Object.entries(ks)
      .filter(([, v]) => v !== '')
      .map(([n, v]) => ({ nb_players: Number(n), k_factor: Number(v) }));
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_game', {
        p_pin: pin, p_name: name, p_default_k: Number(defK), p_k, p_image: image.trim() || null,
      });
      if (error) throw error;
      setName('');
      setKs({});
      setImage('');
      await reload();
    });
  };

  return (
    <form className="panel pad" onSubmit={submit}>
      <h2>Ajouter un jeu</h2>
      <label htmlFor="gname">Nom du jeu</label>
      <input id="gname" value={name} onChange={(e) => setName(e.target.value)} required />
      <label htmlFor="dk">K par défaut</label>
      <input id="dk" type="number" min="1" value={defK} onChange={(e) => setDefK(e.target.value)} required />
      <label>K selon le nombre de joueurs <span className="muted">facultatif</span></label>
      <div className="k-grid">
        {[2, 3, 4, 5, 6].map((n) => (
          <input key={n} type="number" min="1" placeholder={n + ' joueurs'} aria-label={'K pour ' + n + ' joueurs'} value={ks[n] ?? ''} onChange={(e) => setKs({ ...ks, [n]: e.target.value })} />
        ))}
      </div>
      <label htmlFor="img">Fichier image <span className="muted">facultatif</span></label>
      <input id="img" placeholder="catan.jpg" value={image} onChange={(e) => setImage(e.target.value)} />
      <p className="note">Placez l’image dans <code>public/games/</code>. Sans nom de fichier, le site cherche <code>nom-du-jeu.jpg</code>.</p>
      <button className="button button-primary">Ajouter le jeu</button>
    </form>
  );
}
