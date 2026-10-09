import type { ListingStatus } from "../listing-editor/types";

export type CalendarDayState =
  | "AVAILABLE"
  | "BOOKED"
  | "HOLD"
  | "PENDING_HOST"
  | "BLOCKED"
  | "PAST";

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  state: CalendarDayState;
  price?: number; // Giá mỗi đêm VND
  bookingRef?: string; // Ví dụ: BK-8921
  bookingType?: "PLATFORM" | "INSTANT" | "REQUEST";
  guestNameMasked?: string; // Ví dụ: "Nguyễn V***" / "John D***"
  guestCount?: number;
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  note?: string; // Lý do chặn hoặc ghi chú
  isOutsideBookingRules?: boolean;
  isPrepBuffer?: boolean;
}

export interface StayRules {
  minNights: number;
  maxNights: number;
  prepNights: number;
  minNoticeHours: number;
  maxAdvanceMonths: number;
}

export interface CalendarMonthData {
  listingId: string;
  listingTitle: string;
  listingStatus: ListingStatus;
  timezone: string; // IANA string: Asia/Ho_Chi_Minh
  today: string; // YYYY-MM-DD (theo múi giờ listing)
  basePrice: number;
  currency: string;
  days: CalendarDay[];
  rules: StayRules;
  updatedAt: string; // ISO string
}

export interface BlockDatesPayload {
  listingId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  nights: string[]; // Danh sách các ngày đêm bị chặn (YYYY-MM-DD)
  reason?: string;
}

export interface UnblockDatesPayload {
  listingId: string;
  from: string;
  to: string;
  nights: string[];
}

export interface BlockDatesResult {
  success: boolean;
  blockedNights: string[];
  conflicts?: string[]; // Ngày bị xung đột 409
  message?: string;
}

export interface UnblockDatesResult {
  success: boolean;
  unblockedNights: string[];
  message?: string;
}
