import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Icon from './Icon';
import Logo from './Logo';

const NAV = [
  { to: '/', label: 'Jeux', icon: 'games', active: (p) => p === '/' || p.startsWith('/jeu/') },
  { to: '/partie', label: 'Nouvelle partie', icon: 'new', active: (p) => p === '/partie' },
  { to: '/gestion', label: 'Gestion', icon: 'admin', active: (p) => p === '/gestion' },
];

export default function Layout() {
  const { data, error } = useApp();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <aside className={'side' + (menu ? ' open' : '')}>
        <Link to="/" className="brand">
          <Logo /> GAP
        </Link>
        <nav aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={'nav' + (n.active(pathname) ? ' on' : '')} aria-current={n.active(pathname) ? 'page' : undefined}>
              <Icon name={n.icon} />
              {n.label}
            </Link>
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
          <Logo /> GAP
        </div>
        <main className="page">
          {error && <div className="panel error">Connexion impossible : {error}</div>}
          {!data && !error && <p className="muted">Chargement…</p>}
          {data && <Outlet />}
        </main>
      </div>
    </div>
  );
}
