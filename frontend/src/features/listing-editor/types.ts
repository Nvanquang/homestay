export type PropertyType = "ENTIRE_PLACE" | "PRIVATE_ROOM" | "ROOM" | "SHARED_ROOM";

export type ListingStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "PENDING_REVIEW"
  | "NEEDS_CHANGES"
  | "PUBLISHED"
  | "ACTIVE"
  | "UNLISTED"
  | "REJECTED"
  | "LOCKED";

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

/* ----------------------------------------------------
 * Slice FE-S07: Cancellation Policy, Booking Mode, Legal Docs & Review Status
 * ---------------------------------------------------- */

export type CancellationPolicyType = "FLEXIBLE" | "MODERATE" | "STRICT";
export type BookingMode = "INSTANT" | "REQUEST";

export interface PolicyData {
  cancellationPolicy: CancellationPolicyType;
  bookingMode: BookingMode;
}

export interface CancellationPolicyTier {
  hoursBefore: number;
  refundPercent: number;
  noteVi: string;
  noteEn: string;
}

export interface CancellationPolicyDetail {
  id: CancellationPolicyType;
  nameVi: string;
  nameEn: string;
  summaryVi: string;
  summaryEn: string;
  badgeVi: string;
  badgeEn: string;
  tiers: CancellationPolicyTier[];
}

export type LegalDocType =
  | "OPERATING_LICENSE"
  | "BUSINESS_REGISTRATION"
  | "FIRE_SAFETY"
  | "OTHER";

export interface LegalDocItem {
  id: string;
  type: LegalDocType;
  name: string;
  fileUrl: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface LegalData {
  legalDocs: LegalDocItem[];
  legalRegistrationNumber?: string;
}

export interface ReadinessItem {
  key: string;
  ok: boolean;
  messageVi: string;
  messageEn: string;
  stepNumber: number;
  stepId: WizardStepId;
  linkUrl: string;
}

export interface ListingReadinessResult {
  canSubmit: boolean;
  items: ReadinessItem[];
  summary: {
    id: string;
    title: string;
    coverPhotoUrl?: string;
    baseNightlyPrice: number;
    cancellationPolicy: CancellationPolicyType;
    bookingMode: BookingMode;
    province: string;
    district: string;
  };
}

export type ReviewSectionType =
  | "PHOTOS"
  | "DESCRIPTION"
  | "LEGAL"
  | "PRICING"
  | "LOCATION"
  | "OTHER";

export interface ReviewReasonItem {
  section: ReviewSectionType;
  note: string;
  stepNumber: number;
  stepId: WizardStepId;
}

export interface ListingRevisionItem {
  no: number;
  submittedAt: string;
  decidedAt?: string;
  result: "PENDING" | "APPROVED" | "NEEDS_CHANGES" | "REJECTED";
  reasons?: ReviewReasonItem[];
}

export interface ListingReviewStatusDetail {
  listingId: string;
  title: string;
  coverPhotoUrl?: string;
  status: ListingStatus;
  submittedAt?: string;
  currentReview?: {
    reasons: ReviewReasonItem[];
    decidedAt?: string;
  };
  revisions: ListingRevisionItem[];
  lockReason?: string;
  publicUrl?: string;
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
  policy?: PolicyData;
  legal?: LegalData;
  legalDocs?: LegalDocItem[];
  legalRegistrationNumber?: string;
  cancellationPolicy?: CancellationPolicyType;
  bookingMode?: BookingMode;
  draftProgress: ListingDraftProgress;
  updatedAt: string;
  createdAt: string;
  submittedAt?: string;
  coverPhotoUrl?: string;
  rejectionReason?: string;
  reviewStatus?: ListingReviewStatusDetail;
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
