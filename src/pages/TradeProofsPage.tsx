import { useOutletContext } from 'react-router-dom';
import type { GameDefinition } from '../types/game';

export default function TradeProofsPage() {
  const { game } = useOutletContext<{ game: GameDefinition }>();

  return (
    <section className="bg-panel border border-border rounded-xl p-6 max-w-2xl">
      <h2 className="text-2xl font-semibold mb-1">Submit a trade proof — {game.name}</h2>
      <p className="text-gray-400 mb-6">
        Upload a screenshot for community review. Approved trades feed the valuation algorithm.
      </p>

      <div className="border border-dashed border-[#303143] rounded-lg p-6 text-center text-gray-500 mb-4">
        File upload UI goes here (needs Supabase Storage — not wired up yet)
      </div>
      <button
        disabled
        className="bg-accent/40 text-black/60 font-bold px-4 py-2 rounded-lg cursor-not-allowed"
        title="Submission pipeline not built yet — needs backend"
      >
        Submit for review
      </button>

      <p className="text-xs text-gray-600 mt-6">
        Note: this page is UI scaffolding only. Real submission, storage, and the
        review queue require a backend (Supabase) — see the project README for the
        build plan.
      </p>
    </section>
  );
}
