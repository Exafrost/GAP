import { useState } from 'react';
import { supabase } from '../../supabase';
import { useApp } from '../../context/AppContext';

export default function OwnersEditor({ game }) {
  const { data, askPin, reload } = useApp();
  const [open, setOpen] = useState(false);
  const [ids, setIds] = useState([]);

  const start = () => {
    setIds(game.game_owners.map((o) => o.player_id)); // coche les détenteurs actuels
    setOpen(true);
  };
  const toggle = (id) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const save = () =>
    askPin(async (pin) => {
      const { error } = await supabase.rpc('set_game_owners', { p_pin: pin, p_game_id: game.id, p_player_ids: ids });
      if (error) throw error;
      await reload();
      setOpen(false);
    });

  if (!open) {
    return <button type="button" className="button button-secondary inline" onClick={start}>Modifier les détenteurs</button>;
  }
  return (
    <div className="owners-edit">
      <div className="pgrid">
        {data.players.map((p) => {
          const on = ids.includes(p.id);
          return (
            <button key={p.id} type="button" className={'button inline toggable-button' + (on ? ' toggled' : '')} aria-pressed={on} onClick={() => toggle(p.id)}>
              {p.name}
            </button>
          );
        })}
      </div>
      <div className="btn-row">
        <button type="button" className="button button-primary inline" onClick={save}>Enregistrer</button>
        <button type="button" className="button button-secondary inline" onClick={() => setOpen(false)}>Annuler</button>
      </div>
    </div>
  );
}