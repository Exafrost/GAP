const ICONS = {
  games: 'M7 4h10a3 3 0 013 3v10a3 3 0 01-3 3H7a3 3 0 01-3-3V7a3 3 0 013-3zM9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01',
  new: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v8M8 12h8',
  admin: 'M4 7h16M4 17h16M15 4v6M9 14v6',
  menu: 'M4 6h16M4 12h16M4 18h16',
};

export default function Icon({ name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}
