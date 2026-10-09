import type {
  PriceRule,
  PricingRulesOverview,
  UpsertPriceRulePayload,
  CalendarPriceDay,
  PriceSource,
} from "../types";
import { getListingDetail } from "../../listing-editor/api/mock-listings";

const STORAGE_KEY_RULES = "homestay_pricing_rules_";
const STORAGE_KEY_WEEKEND = "homestay_weekend_price_";

// Seeded rules in-memory fallback
const inMemoryRules: Record<string, PriceRule[]> = {};
const inMemoryWeekendPrice: Record<string, number> = {};

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function computePhase(dateFrom: string, dateTo: string, today: string): PriceRule["phase"] {
  if (dateTo < today) return "PAST";
  if (dateFrom <= today && dateTo >= today) return "ACTIVE";
  return "UPCOMING";
}

function getStoredRules(listingId: string): PriceRule[] {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_RULES}${listingId}`);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
  }

  if (inMemoryRules[listingId]) {
    return inMemoryRules[listingId];
  }

  const today = getTodayStr();

  // Seed default rules
  const seeded: PriceRule[] = [
    {
      id: "rule-101",
      listingId,
      type: "HOLIDAY",
      name: "Tết Nguyên Đán 2027",
      dateFrom: "2027-02-05",
      dateTo: "2027-02-12",
      nightlyPrice: 2400000,
      phase: computePhase("2027-02-05", "2027-02-12", today),
      createdAt: "2026-10-01T08:00:00Z",
      updatedAt: "2026-10-01T08:00:00Z",
    },
    {
      id: "rule-102",
      listingId,
      type: "SEASON",
      name: "Mùa Hè Cao Điểm",
      dateFrom: "2026-06-01",
      dateTo: "2026-08-31",
      nightlyPrice: 1600000,
      phase: computePhase("2026-06-01", "2026-08-31", today),
      createdAt: "2026-05-15T09:00:00Z",
      updatedAt: "2026-05-15T09:00:00Z",
    },
    {
      id: "rule-103",
      listingId,
      type: "SPECIAL",
      name: "Festival Hoa Đà Lạt",
      dateFrom: "2026-12-20",
      dateTo: "2026-12-28",
      nightlyPrice: 2000000,
      phase: computePhase("2026-12-20", "2026-12-28", today),
      createdAt: "2026-09-20T10:00:00Z",
      updatedAt: "2026-09-20T10:00:00Z",
    },
  ];

  inMemoryRules[listingId] = seeded;
  return seeded;
}

function saveStoredRules(listingId: string, rules: PriceRule[]) {
  inMemoryRules[listingId] = rules;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_KEY_RULES}${listingId}`, JSON.stringify(rules));
    } catch {
      // ignore
    }
  }
}

function getStoredWeekendPrice(listingId: string, defaultPrice: number): number {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_WEEKEND}${listingId}`);
      if (data) return parseInt(data, 10);
    } catch {
      // fallback
    }
  }
  return inMemoryWeekendPrice[listingId] ?? defaultPrice;
}

function saveStoredWeekendPrice(listingId: string, price: number) {
  inMemoryWeekendPrice[listingId] = price;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_KEY_WEEKEND}${listingId}`, String(price));
    } catch {
      // ignore
    }
  }
}

/**
 * Kiểm tra xem 2 khoảng ngày có giao nhau không [from1, to1] & [from2, to2]
 */
function isOverlapping(from1: string, to1: string, from2: string, to2: string): boolean {
  return !(to1 < from2 || from1 > to2);
}

/**
 * Lấy danh sách quy tắc giá và thông tin giá cơ sở của listing
 */
export async function getPricingRulesOverview(
  listingId: string,
  locale: string = "vi"
): Promise<PricingRulesOverview> {
  await new Promise((r) => setTimeout(r, 120));

  let listing;
  try {
    listing = await getListingDetail(listingId);
  } catch {
    listing = null;
  }

  const baseNightlyPrice = listing?.pricing?.baseNightlyPrice || 1200000;
  const initialWeekend = listing?.pricing?.weekendNightlyPrice || Math.round(baseNightlyPrice * 1.25);
  const weekendNightlyPrice = getStoredWeekendPrice(listingId, initialWeekend);

  const today = getTodayStr();
  const rawRules = getStoredRules(listingId);

  // Recalculate phases dynamically
  const rules = rawRules.map((r) => ({
    ...r,
    phase: computePhase(r.dateFrom, r.dateTo, today),
  }));

  const isEn = locale === "en";

  return {
    listingId,
    listingTitle: listing?.basicInfo?.title || (isEn ? "Cozy Homestay" : "Chỗ nghỉ ấm cúng"),
    baseNightlyPrice,
    weekendNightlyPrice,
    weekendNights: ["FRI", "SAT"],
    rules,
    currency: "VND",
  };
}

/**
 * Thêm hoặc sửa quy tắc giá (Upsert)
 * Kiểm tra xung đột cùng nhóm ưu tiên [Assumption A6]
 */
export async function upsertPriceRule(
  payload: UpsertPriceRulePayload
): Promise<{ success: boolean; rule?: PriceRule; conflictingRules?: PriceRule[]; error?: string }> {
  await new Promise((r) => setTimeout(r, 180));

  const { listingId, id, type, name, dateFrom, dateTo, nightlyPrice } = payload;
  const currentRules = getStoredRules(listingId);

  // Nhóm ưu tiên:
  // Nhóm 1: HOLIDAY & SPECIAL
  // Nhóm 2: SEASON
  const isTier1 = type === "HOLIDAY" || type === "SPECIAL";

  const conflictingRules = currentRules.filter((r) => {
    if (id && r.id === id) return false; // Bỏ qua chính nó khi sửa
    const otherIsTier1 = r.type === "HOLIDAY" || r.type === "SPECIAL";
    const sameTier = isTier1 ? otherIsTier1 : r.type === "SEASON";

    return sameTier && isOverlapping(dateFrom, dateTo, r.dateFrom, r.dateTo);
  });

  if (conflictingRules.length > 0) {
    return {
      success: false,
      conflictingRules,
      error: `Khoảng ngày này trùng với quy tắc cùng bậc ưu tiên: "${conflictingRules[0].name}" (${conflictingRules[0].dateFrom} – ${conflictingRules[0].dateTo}). Vui lòng điều chỉnh lại khoảng ngày.`,
    };
  }

  const today = getTodayStr();
  const phase = computePhase(dateFrom, dateTo, today);

  let updatedList: PriceRule[];
  let savedRule: PriceRule;

  if (id) {
    savedRule = {
      id,
      listingId,
      type,
      name,
      dateFrom,
      dateTo,
      nightlyPrice,
      phase,
      createdAt: currentRules.find((r) => r.id === id)?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedList = currentRules.map((r) => (r.id === id ? savedRule : r));
  } else {
    savedRule = {
      id: `rule-${Date.now()}`,
      listingId,
      type,
      name,
      dateFrom,
      dateTo,
      nightlyPrice,
      phase,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    updatedList = [savedRule, ...currentRules];
  }

  saveStoredRules(listingId, updatedList);

  return {
    success: true,
    rule: savedRule,
  };
}

/**
 * Xóa quy tắc giá
 */
export async function deletePriceRule(
  listingId: string,
  ruleId: string
): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 150));

  const currentRules = getStoredRules(listingId);
  const updatedList = currentRules.filter((r) => r.id !== ruleId);
  saveStoredRules(listingId, updatedList);

  return { success: true };
}

/**
 * Cập nhật giá cuối tuần (Thứ 6 & Thứ 7)
 */
export async function updateWeekendPrice(
  listingId: string,
  nightlyPrice: number
): Promise<{ success: boolean; weekendNightlyPrice: number }> {
  await new Promise((r) => setTimeout(r, 120));

  saveStoredWeekendPrice(listingId, nightlyPrice);
  return { success: true, weekendNightlyPrice: nightlyPrice };
}

/**
 * Lấy lịch giá từng ngày theo tháng dựa trên Pricing Engine Hierarchy:
 * HOLIDAY / SPECIAL (Bậc 1) > SEASON (Bậc 2) > WEEKEND (Bậc 3) > BASE (Bậc 4)
 */
export async function getPriceCalendar(
  listingId: string,
  yearMonth: string, // YYYY-MM
  locale: string = "vi"
): Promise<CalendarPriceDay[]> {
  await new Promise((r) => setTimeout(r, 150));

  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const daysInMonth = new Date(year, month, 0).getDate();
  const overview = await getPricingRulesOverview(listingId, locale);

  const today = getTodayStr();
  const calendarDays: CalendarPriceDay[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, "0");
    const mStr = String(month).padStart(2, "0");
    const dateStr = `${year}-${mStr}-${dayStr}`;

    const dateObj = new Date(year, month - 1, d);
    const dayOfWeek = dateObj.getDay(); // 0 Sun, 5 Fri, 6 Sat
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

    // Pricing Hierarchy Algorithm:
    // 1. Kiểm tra Bậc 1: HOLIDAY hoặc SPECIAL
    const tier1Rule = overview.rules.find(
      (r) =>
        (r.type === "HOLIDAY" || r.type === "SPECIAL") &&
        dateStr >= r.dateFrom &&
        dateStr <= r.dateTo
    );

    // 2. Kiểm tra Bậc 2: SEASON
    const tier2Rule = overview.rules.find(
      (r) => r.type === "SEASON" && dateStr >= r.dateFrom && dateStr <= r.dateTo
    );

    let price = overview.baseNightlyPrice;
    let source: PriceSource = "BASE";
    let sourceName: string | undefined = locale === "en" ? "Base Price" : "Giá cơ bản";
    let ruleId: string | undefined;

    if (tier1Rule) {
      price = tier1Rule.nightlyPrice;
      source = tier1Rule.type;
      sourceName = tier1Rule.name;
      ruleId = tier1Rule.id;
    } else if (tier2Rule) {
      price = tier2Rule.nightlyPrice;
      source = "SEASON";
      sourceName = tier2Rule.name;
      ruleId = tier2Rule.id;
    } else if (isWeekend && overview.weekendNightlyPrice > 0) {
      price = overview.weekendNightlyPrice;
      source = "WEEKEND";
      sourceName = locale === "en" ? "Weekend Price" : "Giá cuối tuần";
    }

    calendarDays.push({
      date: dateStr,
      price,
      source,
      sourceName,
      ruleId,
      isPast: dateStr < today,
    });
  }

  return calendarDays;
}
