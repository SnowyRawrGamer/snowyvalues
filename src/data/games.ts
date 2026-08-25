import type { GameDefinition, GameUnit } from '../types/game';

export type Game = GameDefinition;
export type Unit = GameUnit;

export const GAMES: GameDefinition[] = [
  {
    id: 'clicking-legends-remastered',
    name: 'Clicking Legends Remastered',
    shortName: 'Clicking Legends',
    currency: { id: 'clicks', name: 'Clicks', shortLabel: 'Clicks' },
    categories: ['Pet', 'Unit', 'Secret', 'Gamepass', 'Currency Item'],
    coverColor: '#38bdf8',
    isActive: true,
  },
  {
    id: 'adopt-me',
    name: 'Adopt Me',
    shortName: 'Adopt Me',
    currency: { id: 'bucks', name: 'Bucks', shortLabel: 'B' },
    categories: ['Pet', 'Unit'],
    coverColor: '#a78bfa',
    isActive: true,
  },
];

const units: GameUnit[] = [
  {
    id: 'nebula-dragon', gameId: 'clicking-legends-remastered', name: 'Nebula Dragon', category: 'Pet', rarity: 'Legendary', baseValue: 120000, demand: 'High', existCount: null,
    iconUrl: '🐉', priceHistory: [{ date: '2026-08-20', value: 115000 }, { date: '2026-08-25', value: 120000 }], isCommunityVerified: true, lastUpdated: '2026-08-25',
  },
  {
    id: 'frostbyte-cat', gameId: 'clicking-legends-remastered', name: 'Frostbyte Cat', category: 'Pet', rarity: 'Epic', baseValue: 45000, demand: 'Medium', existCount: null,
    iconUrl: '🐈', priceHistory: [{ date: '2026-08-20', value: 42000 }, { date: '2026-08-25', value: 45000 }], isCommunityVerified: true, lastUpdated: '2026-08-25',
  },
];

export function getUnits(gameId: string): GameUnit[] {
  return units.filter((unit: GameUnit) => unit.gameId === gameId);
}
