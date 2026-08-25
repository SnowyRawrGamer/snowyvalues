import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { GameDefinition } from '../types/game';
import { getUnits } from '../data/games';
import UnitCard from '../components/UnitCard';
import UnitModal from '../components/UnitModal';

export default function ValueListPage() {
  const { game } = useOutletContext<{ game: GameDefinition }>();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const units = getUnits(game.id).filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase())
  );
  const selected = units.find((u) => u.id === selectedId);

  return (
    <div>
      <small className="text-accent font-mono text-xs tracking-wide">
        COMMUNITY-VERIFIED ECONOMY
      </small>
      <h1 className="text-5xl leading-tight my-3">
        Know the value.
        <br />
        <em className="text-accentLight not-italic">Make the trade.</em>
      </h1>
      <p className="text-gray-400 mb-8 max-w-lg">
        The trusted value list for {game.name} — powered by verified trades, scarcity, and demand.
      </p>

      <input
        className="w-full bg-[#1a1b27] border border-[#303143] p-3 rounded-lg text-white mb-5"
        placeholder="Search units, pets, gamepasses..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {units.length === 0 ? (
        <p className="text-gray-500">No units yet for this game.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              currency={game.currency}
              onClick={() => setSelectedId(unit.id)}
            />
          ))}
        </div>
      )}

      {selected && (
        <UnitModal unit={selected} currency={game.currency} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
