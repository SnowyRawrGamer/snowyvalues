import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { GameUnit, GameCurrency } from '../types/game';

interface Props {
  unit: GameUnit;
  currency: GameCurrency;
  onClick: () => void;
}

export default function UnitCard({ unit, currency, onClick }: Props) {
  return (
    <article
      onClick={onClick}
      className="bg-panel border border-border rounded-xl p-5 cursor-pointer hover:border-accent transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 grid place-items-center bg-[#40366a] rounded-xl text-lg font-bold">
          {unit.name[0]}
        </div>
        <label className="text-[10px] font-mono bg-[#302952] text-[#b6aaff] px-2 py-1 rounded">
          {unit.rarity}
        </label>
      </div>
      <h3 className="mb-1 font-semibold">{unit.name}</h3>
      <small className="text-gray-400 block mb-2">
        {unit.isCommunityVerified ? 'Verified community average' : 'Estimated — awaiting trade data'}
      </small>
      <h2 className="font-mono text-xl mb-2">
        {unit.baseValue.toLocaleString()}{' '}
        <sup className="text-xs text-gray-500">{currency.shortLabel}</sup>
      </h2>
      <ResponsiveContainer height={45} width="100%">
        <AreaChart data={unit.priceHistory}>
          <Area dataKey="value" stroke="#a894ff" fill="#a894ff" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </article>
  );
}
