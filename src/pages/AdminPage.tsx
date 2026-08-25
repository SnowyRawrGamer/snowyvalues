import { useOutletContext } from 'react-router-dom';
import type { GameDefinition, AdminUser } from '../types/game';
import { canManageGame } from '../types/game';

// Placeholder signed-in admin — real version comes from Supabase Auth session.
const MOCK_ADMIN: AdminUser = {
  userId: 'demo-admin',
  displayName: 'Demo Admin',
  scopes: [{ type: 'game', gameId: 'clicking-legends-remastered' }],
};

export default function AdminPage() {
  const { game } = useOutletContext<{ game: GameDefinition }>();
  const hasAccess = canManageGame(MOCK_ADMIN, game.id);

  if (!hasAccess) {
    return (
      <section className="bg-panel border border-border rounded-xl p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-loss mb-2">No access</h2>
        <p className="text-gray-400">
          {MOCK_ADMIN.displayName} does not have admin permissions for {game.name}.
          This is demonstrating the game-scoped permission model — real auth is not wired up yet.
        </p>
      </section>
    );
  }

  return (
    <section className="bg-panel border border-border rounded-xl p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-1">Review queue — {game.name}</h2>
      <p className="text-gray-400 mb-6">Signed in as {MOCK_ADMIN.displayName} (game-scoped access)</p>

      {['Nebula Dragon / 120,000 Clicks', 'Frostbyte Cat / 45,000 Clicks'].map((row) => (
        <div
          key={row}
          className="border-t border-[#303143] py-3 flex items-center justify-between gap-3"
        >
          <span>{row}</span>
          <div className="flex gap-2">
            <button className="bg-accent text-black font-bold px-3 py-1.5 rounded-lg text-sm">
              Approve
            </button>
            <button className="border border-loss text-loss px-3 py-1.5 rounded-lg text-sm">
              Reject
            </button>
          </div>
        </div>
      ))}

      <p className="text-xs text-gray-600 mt-6">
        These rows are placeholder data. Real queue comes from pending
        TradeProofSubmission rows in Supabase once the backend is built.
      </p>
    </section>
  );
}
