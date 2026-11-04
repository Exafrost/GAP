import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/home/Home';
import GameDetail from './pages/game/GameDetail';
import NewMatch from './pages/match/NewMatch';
import Admin from './pages/admin/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="jeu/:gameId" element={<GameDetail />} />
        <Route path="partie" element={<NewMatch />} />
        <Route path="gestion" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
