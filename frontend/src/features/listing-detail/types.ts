import { PropertyType, BookingMode, CancellationPolicyType, ListingCardDTO } from "@/features/search/types";

export interface ListingDetailPhoto {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface AmenityDetail {
  id: string;
  name: string;
  category: "ESSENTIAL" | "FEATURE" | "SAFETY" | "LOCATION";
  iconName?: string;
  description?: string;
}

export interface HostPublicProfile {
  id: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  verified: boolean;
  joinedAt: string; // "03/2026"
  activeListingCount: number;
  responseRate?: number;
  responseTime?: string;
  ratingScore?: number;
  reviewCount?: number;
}

export interface StayRules {
  minNights: number;
  maxNights: number;
  minNoticeHours: number;
  maxAdvanceMonths: number;
}

export interface CancellationMilestone {
  label: string;
  windowHours: number;
  roomRefundPercent: number;
  cleaningRefundPercent: number;
  serviceFeeRefundPercent: number;
}

export interface CancellationPolicyDetail {
  id: string;
  key: CancellationPolicyType;
  name: string;
  summary: string;
  milestones: CancellationMilestone[];
  specialCases: {
    hostCancel: string;
    forceMajeure: string;
  };
}

export interface ListingDetailDTO {
  id: string;
  title: string;
  propertyType: PropertyType;
  areaLabel: string;
  description: string;
  photos: ListingDetailPhoto[];
  maxGuests: number;
  standardGuests: number;
  extraGuestFee: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  bookingMode: BookingMode;
  cancellationPolicy: CancellationPolicyDetail;
  amenities: AmenityDetail[];
  stayRules: StayRules;
  checkInTime: string; // "14:00"
  checkOutTime: string; // "12:00"
  houseRules: string[];
  publicArea: {
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    label: string;
  };
  baseNightlyPrice: number;
  weekendNightlyPrice: number;
  cleaningFee: number;
  weeklyDiscountPercent: number;
  monthlyDiscountPercent: number;
  ratingScore: number;
  reviewCount: number;
  host: HostPublicProfile;
  blockedDates?: string[]; // YYYY-MM-DD
}

export interface QuoteLineItem {
  key: "ROOM" | "EXTRA_GUEST" | "CLEANING" | "DISCOUNT" | "SERVICE_FEE" | "TAX";
  label: string;
  amount: number;
}

export interface NightlyPriceBreakdown {
  date: string;
  price: number;
  source: "BASE" | "WEEKEND" | "SEASON" | "HOLIDAY";
}

export interface BookingQuoteResult {
  nights: number;
  guests: number;
  basePricePerNight: number;
  lines: QuoteLineItem[];
  nightlyBreakdown: NightlyPriceBreakdown[];
  total: number;
  includesFeesAndTaxes: boolean;
  violations?: Array<{
    code: "UNAVAILABLE" | "MIN_NIGHTS" | "MAX_NIGHTS" | "NOTICE" | "CAPACITY";
    message: string;
  }>;
  nextAvailableRange?: {
    from: string;
    to: string;
  };
}
