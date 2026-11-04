import { useState } from 'react';

export default function PinModal({ ask, onClose }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await ask.run(pin);
      onClose();
    } catch (ex) {
      setErr(ex.message || 'Une erreur est survenue');
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <form className="panel pad modal" role="dialog" aria-modal="true" aria-labelledby="pin-title" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 id="pin-title">{ask.title ?? 'Code PIN'}</h2>
        {ask.message && <p className="note">{ask.message}</p>}
        <input className="pin" type="password" inputMode="numeric" autoFocus autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} aria-label="Code PIN" />
        {err && <p className="err">{err}</p>}
        <button className="button button-primary main" disabled={busy || !pin}>{busy ? 'Vérification…' : ask.confirmLabel ?? 'Valider'}</button>
        <button type="button" className="button button-secondary main" onClick={onClose}>Annuler</button>
      </form>
    </div>
  );
}
