import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ValueListPage from './pages/ValueListPage';
import CalculatorPage from './pages/CalculatorPage';
import TradeProofsPage from './pages/TradeProofsPage';
import AdminPage from './pages/AdminPage';
import { GAMES } from './data/games';

export default function App() {
  const defaultGame = GAMES[0].id;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={`/${defaultGame}/values`} replace />} />
        <Route path=":gameId/values" element={<ValueListPage />} />
        <Route path=":gameId/calculator" element={<CalculatorPage />} />
        <Route path=":gameId/trade-proofs" element={<TradeProofsPage />} />
        <Route path=":gameId/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to={`/${defaultGame}/values`} replace />} />
      </Route>
    </Routes>
  );
}
