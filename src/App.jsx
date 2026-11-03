import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase';
import { computeElo, getK, START_ELO } from './elo';

const TABS = [
  ['ranking', 'Classements', 'Le niveau Elo de chaque joueur, jeu par jeu'],
  ['new', 'Nouvelle partie', 'Saisir le résultat d’une partie et mettre à jour les classements'],
  ['history', 'Historique', 'Les dernières parties jouées'],
  ['admin', 'Gestion', 'Joueurs, jeux et coefficients K'],
];
const ICONS = {
  ranking: 'M4 20v-9h5v9M9 20V4h6v16M15 20v-6h5v6',
  new: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v8M8 12h8',
  history: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
  admin: 'M4 7h16M4 17h16M15 4v6M9 14v6',
  menu: 'M4 6h16M4 12h16M4 18h16',
};
const today = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-JJ en heure locale
const fmtDate = (d) =>
  new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const sign = (n) => (n > 0 ? '+' : '') + n;

const Icon = ({ name }) => (
  <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
);

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
    <rect x="2" y="2" width="28" height="28" rx="6" fill="#e58a1f" />
    <circle cx="10" cy="10" r="2.6" fill="#2f1640" />
    <circle cx="16" cy="16" r="2.6" fill="#2f1640" />
    <circle cx="22" cy="22" r="2.6" fill="#2f1640" />
  </svg>
);

export default function App() {
  const [tab, setTab] = useState('ranking');
  const [menu, setMenu] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pinAsk, setPinAsk] = useState(null);

  const load = useCallback(async () => {
    const res = await Promise.all([
      supabase.from('players').select('*').order('name'),
      supabase.from('games').select('*').order('name'),
      supabase.from('game_k_factors').select('*'),
      supabase.from('ratings').select('*'),
      supabase
        .from('matches')
        .select('id, played_at, game_id, match_players(player_id, rang, elo_before, elo_after)')
        .order('played_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    const failed = res.find((r) => r.error);
    if (failed) return setError(failed.error.message);
    setError('');
    setData({ players: res[0].data, games: res[1].data, ks: res[2].data, ratings: res[3].data, matches: res[4].data });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const names = useMemo(() => Object.fromEntries((data?.players ?? []).map((p) => [p.id, p.name])), [data]);
  const ctx = { data, names, reload: load, askPin: (run) => setPinAsk({ run }) };
  const current = TABS.find((t) => t[0] === tab);
  const go = (id) => {
    setTab(id);
    setMenu(false);
  };

  return (
    <div className="app">
      <aside className={'side' + (menu ? ' open' : '')}>
        <div className="brand">
          <Logo /> Ludo-Elo
        </div>
        <nav aria-label="Navigation principale">
          {TABS.map(([id, label]) => (
            <button key={id} className={'nav' + (tab === id ? ' on' : '')} aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
              <Icon name={id} />
              {label}
            </button>
          ))}
        </nav>
        <p className="side-foot">Classements Elo entre amis</p>
      </aside>
      {menu && <div className="scrim" onClick={() => setMenu(false)} />}

      <div className="main">
        <div className="topbar">
          <button className="burger" aria-label="Ouvrir le menu" onClick={() => setMenu(true)}>
            <Icon name="menu" />
          </button>
          <Logo /> Ludo-Elo
        </div>
        <main className="page">
          <h1>{current[1]}</h1>
          <p className="lead">{current[2]}</p>
          {error && <div className="panel error">Connexion impossible : {error}</div>}
          {!data && !error && <p className="muted">Chargement…</p>}
          {data && tab === 'ranking' && <Ranking {...ctx} />}
          {data && tab === 'new' && <NewMatch {...ctx} />}
          {data && tab === 'history' && <History {...ctx} />}
          {data && tab === 'admin' && <Admin {...ctx} />}
        </main>
      </div>
      {pinAsk && <PinModal ask={pinAsk} onClose={() => setPinAsk(null)} />}
    </div>
  );
}

function Ranking({ data, names }) {
  const [sel, setSel] = useState(null);
  const gameId = sel ?? data.games[0]?.id;
  const rows = data.ratings.filter((r) => r.game_id === gameId).sort((a, b) => b.elo - a.elo);
  return (
    <section className="panel">
      {!data.games.length && <p className="muted pad">Aucun jeu. Ajoutez-en un dans « Gestion ».</p>}
      <div className="gametabs" role="tablist">
        {data.games.map((g) => (
          <button key={g.id} role="tab" aria-selected={g.id === gameId} className={g.id === gameId ? 'on' : ''} onClick={() => setSel(g.id)}>
            {g.name}
          </button>
        ))}
      </div>
      {data.games.length > 0 && rows.length === 0 && <p className="muted pad">Aucune partie pour ce jeu. Lancez la première !</p>}
      {rows.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Joueur</th>
              <th className="num">Parties</th>
              <th className="num">Elo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.player_id} className={i === 0 ? 'first' : ''}>
                <td><span className={'token t' + Math.min(i + 1, 4)}>{i + 1}</span></td>
                <td><b>{names[r.player_id]}</b></td>
                <td className="num">{r.games_played}</td>
                <td className="num elo">{Math.round(r.elo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

function NewMatch({ data, names, reload, askPin }) {
  const [gameId, setGameId] = useState(data.games[0]?.id ?? '');
  const [date, setDate] = useState(today());
  const [picked, setPicked] = useState([]); // [{ id, rang }]
  const [done, setDone] = useState('');
  const game = data.games.find((g) => g.id === gameId);

  const toggle = (id) => {
    setDone('');
    setPicked((p) =>
      p.some((x) => x.id === id)
        ? p.filter((x) => x.id !== id).map((x) => ({ ...x, rang: Math.min(x.rang, p.length - 1) }))
        : [...p, { id, rang: p.length + 1 }]
    );
  };
  const setRang = (id, rang) => setPicked((p) => p.map((x) => (x.id === id ? { ...x, rang: Number(rang) } : x)));

  const k = game && picked.length >= 2 ? getK(game, data.ks, picked.length) : null;
  const preview = useMemo(() => {
    if (k == null) return [];
    const withElo = picked.map((p) => ({
      ...p,
      elo: Number(data.ratings.find((r) => r.game_id === gameId && r.player_id === p.id)?.elo ?? START_ELO),
    }));
    return computeElo(withElo, k);
  }, [picked, k, gameId, data.ratings]);
  const calc = Object.fromEntries(preview.map((p) => [p.id, p]));

  const save = () =>
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_match', {
        p_pin: pin,
        p_game_id: gameId,
        p_played_at: date,
        p_results: preview.map((p) => ({ player_id: p.id, rang: p.rang, elo_before: p.before, elo_after: p.after })),
      });
      if (error) throw error;
      setPicked([]);
      setDone('Partie enregistrée.');
      await reload();
    });

  return (
    <div className="cols">
      <section className="panel pad">
        <h2>Paramètres</h2>
        <label htmlFor="game">Jeu</label>
        <select id="game" value={gameId} onChange={(e) => { setGameId(e.target.value); setDone(''); }}>
          {data.games.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        {!data.games.length && <p className="note">Aucun jeu. Ajoutez-en un dans « Gestion ».</p>}
        <label htmlFor="date">Date de la partie</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <label>Joueurs <span className="muted">{picked.length} sélectionné{picked.length > 1 ? 's' : ''}</span></label>
        {!data.players.length && <p className="note">Aucun joueur. Ajoutez-en dans « Gestion ».</p>}
        <div className="pgrid">
          {data.players.map((p) => {
            const on = picked.some((x) => x.id === p.id);
            return (
              <button key={p.id} type="button" className={'player' + (on ? ' on' : '')} aria-pressed={on} onClick={() => toggle(p.id)}>
                {p.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel pad">
        <h2>Résultat</h2>
        {done && <p className="ok">{done}</p>}
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
              <select className="rang" aria-label={'Rang de ' + names[p.id]} value={p.rang} onChange={(e) => setRang(p.id, e.target.value)}>
                {picked.map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}{i === 0 ? 'er' : 'e'}</option>
                ))}
              </select>
            </div>
          );
        })}
        {picked.length > 0 && (
          <p className="note">Même rang = égalité.{k != null && ` Coefficient K appliqué : ${k} (${picked.length} joueurs).`}</p>
        )}
        <button className="btn" disabled={!game || picked.length < 2 || !date} onClick={save}>
          Enregistrer la partie
        </button>
      </section>
    </div>
  );
}

function History({ data, names }) {
  const gname = (id) => data.games.find((g) => g.id === id)?.name ?? '?';
  if (!data.matches.length) return <p className="muted">Aucune partie enregistrée pour l’instant.</p>;
  return (
    <div className="hgrid">
      {data.matches.map((m) => (
        <section className="panel pad" key={m.id}>
          <div className="hist-head">
            <h2>{gname(m.game_id)}</h2>
            <span className="muted">{fmtDate(m.played_at)}</span>
          </div>
          {[...m.match_players].sort((a, b) => a.rang - b.rang).map((p) => {
            const d = Math.round((p.elo_after - p.elo_before) * 10) / 10;
            return (
              <div className="line" key={p.player_id}>
                <span className="token sm">{p.rang}</span>
                <span className="grow">{names[p.player_id]}</span>
                <span>{Math.round(p.elo_after)}</span>
                <b className={'delta ' + (d >= 0 ? 'up' : 'down')}>{sign(d)}</b>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function Admin({ data, reload, askPin }) {
  const [name, setName] = useState('');
  const [gname, setGname] = useState('');
  const [defK, setDefK] = useState(32);
  const [ks, setKs] = useState({});

  const addPlayer = (e) => {
    e.preventDefault();
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_player', { p_pin: pin, p_name: name });
      if (error) throw error;
      setName('');
      await reload();
    });
  };

  const addGame = (e) => {
    e.preventDefault();
    const p_k = Object.entries(ks)
      .filter(([, v]) => v !== '')
      .map(([n, v]) => ({ nb_players: Number(n), k_factor: Number(v) }));
    askPin(async (pin) => {
      const { error } = await supabase.rpc('add_game', { p_pin: pin, p_name: gname, p_default_k: Number(defK), p_k });
      if (error) throw error;
      setGname('');
      setKs({});
      await reload();
    });
  };

  return (
    <div className="cols">
      <div className="stack">
        <form className="panel pad" onSubmit={addPlayer}>
          <h2>Ajouter un joueur</h2>
          <label htmlFor="pname">Prénom</label>
          <input id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
          <button className="btn">Ajouter le joueur</button>
        </form>

        <form className="panel pad" onSubmit={addGame}>
          <h2>Ajouter un jeu</h2>
          <label htmlFor="gname">Nom du jeu</label>
          <input id="gname" value={gname} onChange={(e) => setGname(e.target.value)} required />
          <label htmlFor="dk">K par défaut</label>
          <input id="dk" type="number" min="1" value={defK} onChange={(e) => setDefK(e.target.value)} required />
          <label>K selon le nombre de joueurs <span className="muted">facultatif</span></label>
          <div className="k-grid">
            {[2, 3, 4, 5, 6].map((n) => (
              <input key={n} type="number" min="1" placeholder={n + ' joueurs'} aria-label={'K pour ' + n + ' joueurs'} value={ks[n] ?? ''} onChange={(e) => setKs({ ...ks, [n]: e.target.value })} />
            ))}
          </div>
          <button className="btn">Ajouter le jeu</button>
        </form>
      </div>

      <section className="panel pad">
        <h2>Jeux et coefficients K</h2>
        {data.games.map((g) => (
          <div className="line" key={g.id}>
            <span className="grow">
              {g.name}
              <small>
                Par défaut {g.default_k}
                {data.ks.filter((k) => k.game_id === g.id).sort((a, b) => a.nb_players - b.nb_players).map((k) => ` · ${k.nb_players} j. : ${k.k_factor}`).join('')}
              </small>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

function PinModal({ ask, onClose }) {
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
      <form className="panel pad modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Code PIN</h2>
        <input className="pin" type="password" inputMode="numeric" autoFocus autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} aria-label="Code PIN" />
        {err && <p className="err">{err}</p>}
        <button className="btn" disabled={busy || !pin}>{busy ? 'Vérification…' : 'Valider'}</button>
        <button type="button" className="btn ghost" onClick={onClose}>Annuler</button>
      </form>
    </div>
  );
}
