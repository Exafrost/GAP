import { useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';

export default function PlayerForm() {
  const { askPin, reload } = useApp();
  const [name, setName] = useState('');

  const submit = (e) => {
    e.preventDefault();
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_player', { p_pin: pin, p_name: name });
      if (error) throw error;
      setName('');
      await reload();
    });
  };

  return (
    <form className="panel pad" onSubmit={submit}>
      <h2>Ajouter un joueur</h2>
      <label htmlFor="pname">Prénom</label>
      <input id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
      <button className="button button-primary">Ajouter le joueur</button>
    </form>
  );
}
