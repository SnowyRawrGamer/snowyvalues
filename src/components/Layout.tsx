import { Outlet, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { GAMES, getGame } from '../data/games';

const NAV_TABS = [
  { key: 'values', label: 'Value Lists' },
  { key: 'calculator', label: 'Trade Calculator' },
  { key: 'trade-proofs', label: 'Trade Proofs' },
  { key: 'admin', label: '🛡 Admin' },
];

export default function Layout() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const currentGame = gameId ? getGame(gameId) : undefined;
  const activeTab = location.pathname.split('/').pop();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-[75px] border-b border-border flex items-center px-8 gap-10">
        <b className="tracking-widest">
          ✦ SNOWY<span className="text-accentLight">VALUES</span>
        </b>
        <nav className="flex gap-2 flex-1">
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.key}
              to={`/${gameId ?? GAMES[0].id}/${tab.key}`}
              className={`px-3 py-2 rounded-lg text-sm ${
                activeTab === tab.key
                  ? 'bg-[#332d52] text-white'
                  : 'text-gray-400 hover:bg-[#332d52] hover:text-white'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <i className="text-win text-xs font-mono not-italic">● Live Data</i>
      </header>

      <main className="max-w-[1150px] w-full mx-auto px-6 py-16 flex-1">
        <section className="flex gap-3 border-b border-border pb-4 mb-8 flex-wrap">
          {GAMES.map((g) => (
            <button
              key={g.id}
              onClick={() => navigate(`/${g.id}/${activeTab ?? 'values'}`)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                g.id === currentGame?.id
                  ? 'bg-[#332d52] text-white border-transparent'
                  : 'text-gray-400 border-border hover:text-white'
              }`}
            >
              {g.name}
            </button>
          ))}
        </section>

        {currentGame ? (
          <Outlet context={{ game: currentGame }} />
        ) : (
          <p className="text-loss">Unknown game.</p>
        )}
      </main>
    </div>
  );
}
