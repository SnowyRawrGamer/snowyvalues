// Core domain types for SnowyValues.
// Everything (value lists, calculator, admin scoping) is derived from these.

export type Rarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | 'Mythic'
  | 'Secret';

export type DemandLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';

export type UnitCategory =
  | 'Pet'
  | 'Unit'
  | 'Secret'
  | 'Gamepass'
  | 'Currency Item';

export interface PricePoint {
  /** ISO date string */
  date: string;
  value: number;
}

export interface UnitVariant {
  id: string;
  label: string; // e.g. "Shiny", "Golden", "Rainbow"
  valueMultiplier: number; // applied on top of base value
}

export interface GameUnit {
  id: string;
  gameId: string;
  name: string;
  category: UnitCategory;
  rarity: Rarity;
  baseValue: number;
  demand: DemandLevel;
  /** Estimated number in circulation. Null = unknown/uncapped. */
  existCount: number | null;
  variants?: UnitVariant[];
  iconUrl?: string;
  priceHistory: PricePoint[];
  /** True once at least one verified trade has informed this value */
  isCommunityVerified: boolean;
  lastUpdated: string; // ISO date
}

export interface GameCurrency {
  id: string;
  /** Display name, e.g. "Clicks", "Cheese", "Robux" */
  name: string;
  shortLabel: string; // e.g. "Clicks", "Ch"
}

export interface GameDefinition {
  id: string; // slug, e.g. "clicking-legends-remastered"
  name: string;
  shortName: string;
  currency: GameCurrency;
  categories: UnitCategory[];
  coverColor: string; // accent color for game-switcher UI
  isActive: boolean;
}

// --- Trading / calculator ---

export interface TradeSideEntry {
  unitId: string;
  variantId?: string;
  quantity: number;
}

export interface TradeSide {
  entries: TradeSideEntry[];
  customPoints: number;
}

export type TradeVerdict = 'win' | 'fair' | 'loss';

// --- Trade proof submission & verification pipeline ---

export type TradeProofStatus = 'pending' | 'approved' | 'rejected';

export interface TradeProofSubmission {
  id: string;
  gameId: string;
  submittedBy: string; // user id
  screenshotUrl: string;
  side1: TradeSideEntry[];
  side2: TradeSideEntry[];
  notes?: string;
  status: TradeProofStatus;
  reviewedBy?: string;
  createdAt: string;
  reviewedAt?: string;
}

// --- Admin permissions ---

export type AdminScope =
  | { type: 'sitewide' }
  | { type: 'game'; gameId: string };

export interface AdminUser {
  userId: string;
  displayName: string;
  scopes: AdminScope[];
}

export function canManageGame(admin: AdminUser, gameId: string): boolean {
  return admin.scopes.some(
    (s) => s.type === 'sitewide' || (s.type === 'game' && s.gameId === gameId)
  );
}
