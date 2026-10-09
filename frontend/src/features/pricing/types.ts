export type PriceRuleType = "WEEKEND" | "SEASON" | "HOLIDAY" | "SPECIAL";

export type PriceRulePhase = "UPCOMING" | "ACTIVE" | "PAST";

export type PriceSource = "BASE" | "WEEKEND" | "SEASON" | "HOLIDAY" | "SPECIAL";

export interface PriceRule {
  id: string;
  listingId: string;
  type: PriceRuleType;
  name: string;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string; // YYYY-MM-DD
  nightlyPrice: number; // Giá mỗi đêm VND
  phase: PriceRulePhase;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarPriceDay {
  date: string; // YYYY-MM-DD
  price: number;
  source: PriceSource;
  sourceName?: string;
  ruleId?: string;
  isPast?: boolean;
}

export interface PricingRulesOverview {
  listingId: string;
  listingTitle: string;
  baseNightlyPrice: number;
  weekendNightlyPrice: number;
  weekendNights: ("FRI" | "SAT")[];
  rules: PriceRule[];
  currency: string;
}

export interface UpsertPriceRulePayload {
  id?: string;
  listingId: string;
  type: "SEASON" | "HOLIDAY" | "SPECIAL";
  name: string;
  dateFrom: string;
  dateTo: string;
  nightlyPrice: number;
}

export interface UpsertWeekendPricePayload {
  listingId: string;
  nightlyPrice: number;
}
