import type { GameUnit, TradeSide, TradeVerdict } from '../types/game';

const FAIR_THRESHOLD = 500; // net diff within this range counts as "fair"

export function sideValue(side: TradeSide, units: GameUnit[]): number {
  const itemsTotal = side.entries.reduce((sum, entry) => {
    const unit = units.find((u) => u.id === entry.unitId);
    if (!unit) return sum;
    let unitValue = unit.baseValue;
    if (entry.variantId) {
      const variant = unit.variants?.find((v) => v.id === entry.variantId);
      if (variant) unitValue *= variant.valueMultiplier;
    }
    return sum + unitValue * entry.quantity;
  }, 0);
  return itemsTotal + side.customPoints;
}

export interface TradeResult {
  yourValue: number;
  theirValue: number;
  /** Positive = you gain value, negative = you lose value */
  netDifference: number;
  percentDifference: number;
  verdict: TradeVerdict;
}

export function evaluateTrade(
  youGive: TradeSide,
  youGet: TradeSide,
  units: GameUnit[]
): TradeResult {
  const yourValue = sideValue(youGive, units);
  const theirValue = sideValue(youGet, units);
  const netDifference = theirValue - yourValue;
  const percentDifference =
    yourValue === 0 ? 0 : (netDifference / yourValue) * 100;

  let verdict: TradeVerdict = 'fair';
  if (netDifference > FAIR_THRESHOLD) verdict = 'win';
  else if (netDifference < -FAIR_THRESHOLD) verdict = 'loss';

  return { yourValue, theirValue, netDifference, percentDifference, verdict };
}
