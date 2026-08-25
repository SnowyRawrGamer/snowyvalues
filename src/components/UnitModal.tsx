import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import type { GameUnit, GameCurrency } from '../types/game';

interface Props {
  unit: GameUnit;
  currency: GameCurrency;
  onClose: () => void;
}

export default function UnitModal({ unit, currency, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/70 grid place-items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-panel2 border border-[#6154a0] rounded-2xl p-8 w-[440px] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="float-right text-gray-400 hover:text-white">
          ×
        </button>
        <h1 className="text-2xl font-semibold mb-1">{unit.name}</h1>
        <p className="text-xs text-gray-500 mb-4">
          {unit.category} · {unit.rarity} · Demand: {unit.demand}
        </p>
        <h2 className="font-mono text-2xl mb-4">
          {unit.baseValue.toLocaleString()} {currency.shortLabel}
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          {unit.isCommunityVerified
            ? 'Value derived from verified community trades.'
            : 'This value is a seeded estimate — no verified trades have informed it yet.'}
          {unit.existCount != null && ` · Est. ${unit.existCount.toLocaleString()} in circulation.`}
        </p>
        <ResponsiveContainer height={180} width="100%">
          <AreaChart data={unit.priceHistory}>
            <XAxis
              dataKey="date"
              tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              stroke="#555"
              fontSize={10}
            />
            <Tooltip
              formatter={(v: number) => v.toLocaleString()}
              labelFormatter={(d) => new Date(d).toLocaleDateString()}
              contentStyle={{ background: '#191a26', border: '1px solid #2b2c3b' }}
            />
            <Area dataKey="value" stroke="#a894ff" fill="#a894ff" fillOpacity={0.2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
