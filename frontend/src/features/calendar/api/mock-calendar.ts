import type {
  CalendarMonthData,
  CalendarDay,
  BlockDatesPayload,
  UnblockDatesPayload,
  BlockDatesResult,
  UnblockDatesResult,
  StayRules,
} from "../types";
import { getListingDetail } from "../../listing-editor/api/mock-listings";

// Local storage key prefix
const STORAGE_KEY_BLOCKS = "homestay_calendar_blocks_";
const STORAGE_KEY_RULES = "homestay_calendar_rules_";

// In-memory fallback
const inMemoryBlocks: Record<string, Record<string, { blocked: boolean; reason?: string }>> = {};
const inMemoryRules: Record<string, StayRules> = {};

export function getStoredBlocks(listingId: string): Record<string, { blocked: boolean; reason?: string }> {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_BLOCKS}${listingId}`);
      if (data) return JSON.parse(data);
    } catch {
      // fallback to in-memory
    }
  }
  return inMemoryBlocks[listingId] || {};
}

function saveStoredBlocks(
  listingId: string,
  blocks: Record<string, { blocked: boolean; reason?: string }>
) {
  inMemoryBlocks[listingId] = blocks;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_KEY_BLOCKS}${listingId}`, JSON.stringify(blocks));
    } catch {
      // ignore
    }
  }
}

function getStoredRules(listingId: string, defaultRules: StayRules): StayRules {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_RULES}${listingId}`);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return inMemoryRules[listingId] || defaultRules;
}

function saveStoredRules(listingId: string, rules: StayRules) {
  inMemoryRules[listingId] = rules;
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(`${STORAGE_KEY_RULES}${listingId}`, JSON.stringify(rules));
    } catch {
      // ignore
    }
  }
}

// Format YYYY-MM-DD
function formatDate(year: number, month: number, day: number): string {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// Get number of days in month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Trả về dữ liệu lịch tháng cho listing.
 * Tự động tạo dữ liệu mẫu thực tế bao gồm booking có sẵn, giữ chỗ, chờ Host duyệt.
 */
export async function getCalendarData(
  listingId: string,
  yearMonth: string, // YYYY-MM
  locale: string = "vi"
): Promise<CalendarMonthData> {
  // Simulate 150ms network delay
  await new Promise((resolve) => setTimeout(resolve, 150));

  let listing;
  try {
    listing = await getListingDetail(listingId);
  } catch {
    listing = null;
  }

  const [yearStr, monthStr] = yearMonth.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Today reference in Asia/Ho_Chi_Minh
  const now = new Date();
  const todayStr = formatDate(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const isEn = locale === "en";

  const defaultRules: StayRules = {
    minNights: listing?.bookingRules?.minNights || 1,
    maxNights: listing?.bookingRules?.maxNights || 30,
    prepNights: listing?.bookingRules?.prepNights || 1,
    minNoticeHours: listing?.bookingRules?.minNoticeHours || 0,
    maxAdvanceMonths: listing?.bookingRules?.maxAdvanceMonths || 6,
  };

  const rules = getStoredRules(listingId, defaultRules);
  const storedBlocks = getStoredBlocks(listingId);

  const daysCount = getDaysInMonth(year, month);
  const days: CalendarDay[] = [];

  const basePrice = listing?.pricing?.baseNightlyPrice || 1200000;

  for (let d = 1; d <= daysCount; d++) {
    const dateStr = formatDate(year, month, d);
    let state: CalendarDay["state"] = "AVAILABLE";
    let bookingRef: string | undefined;
    let bookingType: CalendarDay["bookingType"];
    let guestNameMasked: string | undefined;
    let guestCount: number | undefined;
    let checkIn: string | undefined;
    let checkOut: string | undefined;
    let note: string | undefined;
    let isPrepBuffer = false;
    let isOutsideBookingRules = false;

    // Check past
    if (dateStr < todayStr) {
      state = "PAST";
    } else {
      // Mock seeded reservations:
      // Case 1: Giữa tháng ngày 15, 16, 17 là BOOKED (đêm 15, 16, 17 - trả phòng ngày 18)
      if (d >= 15 && d <= 17) {
        state = "BOOKED";
        bookingRef = "BK-8921";
        bookingType = "INSTANT";
        guestNameMasked = isEn ? "John D***" : "Nguyễn V***";
        guestCount = 2;
        checkIn = formatDate(year, month, 15);
        checkOut = formatDate(year, month, 18);
        note = isEn ? "Booked via platform" : "Đã đặt bởi nền tảng";
      } else if (d === 18 && rules.prepNights > 0) {
        // Buffer đêm sau checkout nếu có prepNights
        isPrepBuffer = true;
      }
      // Case 2: Ngày 22 là HOLD (giữ chỗ 15 phút)
      else if (d === 22) {
        state = "HOLD";
        bookingRef = "HL-4421";
        bookingType = "INSTANT";
        guestNameMasked = isEn ? "Sarah M***" : "Trần T***";
        guestCount = 4;
        checkIn = formatDate(year, month, 22);
        checkOut = formatDate(year, month, 23);
        note = isEn ? "Awaiting payment (15m hold)" : "Đang giữ chỗ thanh toán (15 phút)";
      }
      // Case 3: Ngày 25, 26 là PENDING_HOST (chờ Host duyệt)
      else if (d === 25 || d === 26) {
        state = "PENDING_HOST";
        bookingRef = "RQ-1102";
        bookingType = "REQUEST";
        guestNameMasked = isEn ? "David K***" : "Lê Hoàng P***";
        guestCount = 3;
        checkIn = formatDate(year, month, 25);
        checkOut = formatDate(year, month, 27);
        note = isEn ? "Booking request awaiting your approval" : "Yêu cầu đặt phòng chờ bạn duyệt";
      }

      // Check stored custom host block (if not already booked)
      if (state === "AVAILABLE" && storedBlocks[dateStr]?.blocked) {
        state = "BLOCKED";
        note = storedBlocks[dateStr].reason || (isEn ? "Blocked by host" : "Chủ nhà chặn");
      }

      // Outside booking rules simulation (e.g. within minNoticeHours = 24h, tomorrow)
      if (state === "AVAILABLE" && d === now.getDate() + 1 && rules.minNoticeHours >= 24) {
        isOutsideBookingRules = true;
      }
    }

    // Weekend price markup simulation (+20% Friday, Saturday nights)
    const dayOfWeek = new Date(year, month - 1, d).getDay(); // 0 is Sun, 5 is Fri, 6 is Sat
    const price = (dayOfWeek === 5 || dayOfWeek === 6) && listing?.pricing?.weekendNightlyPrice
      ? listing.pricing.weekendNightlyPrice
      : basePrice;

    days.push({
      date: dateStr,
      state,
      price,
      bookingRef,
      bookingType,
      guestNameMasked,
      guestCount,
      checkIn,
      checkOut,
      note,
      isPrepBuffer,
      isOutsideBookingRules,
    });
  }

  return {
    listingId,
    listingTitle: listing?.basicInfo?.title || (isEn ? "Cozy Homestay" : "Chỗ nghỉ ấm cúng"),
    listingStatus: listing?.status || "PUBLISHED",
    timezone: "Asia/Ho_Chi_Minh",
    today: todayStr,
    basePrice,
    currency: "VND",
    days,
    rules,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Chặn khoảng ngày (Atomic all-or-nothing theo BR-CAL-02).
 * Trả về 409 Conflict nếu có ngày vừa bị đặt hoặc trùng lặp.
 */
export async function blockDates(payload: BlockDatesPayload): Promise<BlockDatesResult> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const { listingId, nights, reason } = payload;
  const blocks = getStoredBlocks(listingId);

  // Check 409 conflict simulation:
  // Nếu người dùng cố tình chặn ngày đặc biệt (ví dụ date chứa 'CONFL') hoặc ngày đã bị BOOKED/HOLD
  const conflicts: string[] = [];
  for (const date of nights) {
    if (date.includes("2026-10-15") || date.includes("2026-10-16") || date.includes("2026-10-22")) {
      conflicts.push(date);
    }
  }

  if (conflicts.length > 0) {
    return {
      success: false,
      blockedNights: [],
      conflicts,
      message: "Một số ngày vừa được đặt bởi khách khác (409 Conflict). Vui lòng kiểm tra lại lịch.",
    };
  }

  // All-or-nothing apply
  const updatedBlocks = { ...blocks };
  for (const date of nights) {
    updatedBlocks[date] = { blocked: true, reason: reason || "" };
  }

  saveStoredBlocks(listingId, updatedBlocks);

  return {
    success: true,
    blockedNights: nights,
  };
}

/**
 * Mở các ngày đã chặn.
 */
export async function unblockDates(payload: UnblockDatesPayload): Promise<UnblockDatesResult> {
  await new Promise((resolve) => setTimeout(resolve, 180));

  const { listingId, nights } = payload;
  const blocks = getStoredBlocks(listingId);
  const updatedBlocks = { ...blocks };

  for (const date of nights) {
    delete updatedBlocks[date];
  }

  saveStoredBlocks(listingId, updatedBlocks);

  return {
    success: true,
    unblockedNights: nights,
  };
}

/**
 * Cập nhật quy tắc lưu trú (Stay Rules).
 */
export async function updateStayRules(
  listingId: string,
  rules: Partial<StayRules>
): Promise<StayRules> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const currentRules = getStoredRules(listingId, {
    minNights: 1,
    maxNights: 30,
    prepNights: 1,
    minNoticeHours: 0,
    maxAdvanceMonths: 6,
  });

  const updatedRules: StayRules = {
    ...currentRules,
    ...rules,
  };

  saveStoredRules(listingId, updatedRules);
  return updatedRules;
}
