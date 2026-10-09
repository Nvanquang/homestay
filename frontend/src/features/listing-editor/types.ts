export type PropertyType = "ENTIRE_PLACE" | "PRIVATE_ROOM";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "PUBLISHED"
  | "UNLISTED"
  | "REJECTED";

export type WizardStepId =
  | "basic"
  | "location"
  | "photos"
  | "amenities"
  | "rules"
  | "pricing"
  | "policy"
  | "legal";

export interface WizardStepInfo {
  id: WizardStepId;
  stepNumber: number;
  labelKey: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface ListingPhotoItem {
  id: string;
  url: string;
  order: number;
  caption?: string;
  status: "READY" | "UPLOADING" | "ERROR";
  progress?: number;
}

export interface PublicAreaCircle {
  centerLat: number;
  centerLng: number;
  radiusM: number;
  label: string;
}

export interface LocationData {
  province: string;
  district: string;
  exactAddress: string;
  exactLat: number;
  exactLng: number;
  publicArea?: PublicAreaCircle;
}

export interface BasicInfoData {
  propertyType: PropertyType;
  title: string;
  description: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
}

export interface ListingDraftProgress {
  completedSteps: number;
  totalSteps: number;
  resumeStep: WizardStepId;
}

// S06 Types
export type AmenityCategory =
  | "ESSENTIAL"
  | "KITCHEN"
  | "BATHROOM"
  | "ENTERTAINMENT"
  | "SAFETY"
  | "OUTDOOR";

export interface AmenityItem {
  id: string;
  nameVi: string;
  nameEn: string;
  category: AmenityCategory;
  iconName: string;
  descriptionVi?: string;
  descriptionEn?: string;
}

export interface HouseRulesData {
  smoking: boolean;
  pets: boolean;
  parties: boolean;
  quietHoursEnabled: boolean;
  quietHoursFrom: string;
  quietHoursTo: string;
  notes?: string;
}

export interface BookingRulesData {
  minNights: number;
  maxNights: number;
  prepNights: number;
  minNoticeHours: number;
  maxAdvanceMonths: number;
  houseRules: HouseRulesData;
}

export interface PricingData {
  baseNightlyPrice: number;
  weekendNightlyPrice?: number;
  cleaningFee: number;
  baseGuests: number;
  extraGuestFee: number;
  weeklyDiscountPct: number;
  monthlyDiscountPct: number;
  currency: string;
}

export interface NightlyPriceBreakdown {
  date: string;
  price: number;
  source: "BASE" | "WEEKEND" | "SEASON" | "HOLIDAY" | "SPECIAL";
}

export interface PricingViolation {
  code: "MIN_NIGHTS" | "MAX_NIGHTS" | "NOTICE" | "ADVANCE";
  message: string;
}

export interface PricingPreviewParams {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface PricingPreviewResult {
  nights: number;
  roomSubtotal: number;
  extraGuestsCount: number;
  extraGuestTotal: number;
  cleaningFee: number;
  discountType?: "WEEKLY" | "MONTHLY";
  discountPct?: number;
  discountAmount: number;
  hostTotal: number;
  guestTotal: number;
  platformFeeAmount: number;
  nightlyBreakdown: NightlyPriceBreakdown[];
  currency: string;
  violations: PricingViolation[];
}

export interface ListingItem {
  id: string;
  hostId: string;
  status: ListingStatus;
  version: number;
  basicInfo: BasicInfoData;
  location: LocationData;
  photos: ListingPhotoItem[];
  amenityIds?: string[];
  bookingRules?: BookingRulesData;
  pricing?: PricingData;
  draftProgress: ListingDraftProgress;
  updatedAt: string;
  createdAt: string;
  coverPhotoUrl?: string;
  rejectionReason?: string;
  capabilities: {
    canEdit: boolean;
    canPreview: boolean;
    canViewStatus: boolean;
    canOpenCalendar: boolean;
    canOpenPricing: boolean;
    canDelete: boolean;
  };
}

export interface ListingFilterParams {
  status?: ListingStatus | "ALL";
  query?: string;
}
