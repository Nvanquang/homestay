export type StaffRole = "ADMIN" | "SUPPORT" | "ACCOUNTANT";

export type StaffStatus = "ACTIVE" | "INVITED" | "LOCKED";

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  staffRole: StaffRole;
  status: StaffStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  avatarUrl?: string;
}

export type StaffActivityAction = "CREATE" | "CHANGE_ROLE" | "LOCK" | "UNLOCK";

export interface StaffActivityLog {
  id: string;
  staffId: string;
  actorId: string;
  actorName: string;
  action: StaffActivityAction;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  createdAt: string;
}

export interface StaffFilterParams {
  query?: string;
  role?: StaffRole | "ALL";
  status?: StaffStatus | "ALL";
  page?: number;
  pageSize?: number;
}

export interface StaffListResponse {
  items: StaffUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminAuthSession {
  id: string;
  fullName: string;
  email: string;
  staffRole: StaffRole;
}

// ==========================================
// S08: ADMIN LISTING REVIEW TYPES (A04)
// ==========================================

export type ListingReviewStatus =
  | "PENDING_REVIEW"
  | "IN_REVIEW"
  | "APPROVED"
  | "NEEDS_CHANGES"
  | "REJECTED";

export interface DuplicateAddressAlert {
  duplicateListingId: string;
  duplicateListingTitle: string;
  duplicateHostId: string;
  duplicateHostName: string;
  similarity: "SAME_ADDRESS" | "SIMILAR_COORDINATES";
  exactAddress: string;
}

export interface ListingReviewQueueItem {
  id: string; // listingId
  title: string;
  coverPhotoUrl?: string;
  propertyType: string;
  hostId: string;
  hostName: string;
  hostVerified: boolean;
  regionName: string;
  districtName: string;
  exactAddress: string;
  submittedAt: string;
  revisionNo: number;
  status: ListingReviewStatus;
  flagDuplicateAddress: boolean;
  duplicateAlert?: DuplicateAddressAlert;
  lockedBy?: {
    adminId: string;
    adminName: string;
    lockedAt: string;
  } | null;
  basePrice: number;
  currency: string;
}

export interface ListingReviewQueueFilter {
  query?: string;
  region?: string;
  flag?: "ALL" | "DUPLICATE_ONLY" | "CLEAN_ONLY";
  status?: ListingReviewStatus | "ALL";
  onlyMine?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListingReviewQueueResponse {
  items: ListingReviewQueueItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ListingReviewPhoto {
  id: string;
  url: string;
  caption?: string;
  order: number;
}

export interface ListingReviewLegalDoc {
  id: string;
  docType: "OPERATING_LICENSE" | "FIRE_SAFETY" | "SECURITY_COMMITMENT" | "OTHER";
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface ListingReviewDetail {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  checkInTime: string;
  checkOutTime: string;
  location: {
    province: string;
    district: string;
    exactAddress: string;
    exactLat: number;
    exactLng: number;
    publicArea?: {
      centerLat: number;
      centerLng: number;
      radiusM: number;
    };
  };
  photos: ListingReviewPhoto[];
  amenityIds: string[];
  houseRules: {
    smoking: boolean;
    pets: boolean;
    parties: boolean;
    quietHoursEnabled: boolean;
    quietHoursFrom?: string;
    quietHoursTo?: string;
    notes?: string;
  };
  pricing: {
    baseNightlyPrice: number;
    weekendNightlyPrice?: number;
    cleaningFee?: number;
    extraGuestFee?: number;
    baseGuests: number;
    weeklyDiscountPct?: number;
    monthlyDiscountPct?: number;
    currency: string;
  };
  policy: {
    cancellationPolicy: "FLEXIBLE" | "MODERATE" | "STRICT";
    bookingMode: "INSTANT" | "REQUEST";
  };
  legal: {
    legalRegistrationNumber?: string;
    legalDocs: ListingReviewLegalDoc[];
  };
  host: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    identityStatus: "VERIFIED" | "PENDING" | "UNVERIFIED" | "REJECTED";
    listingCount: number;
    joinedAt: string;
  };
  revisionNo: number;
  submittedAt: string;
  status: ListingReviewStatus;
  duplicates: DuplicateAddressAlert[];
  lockedBy?: {
    adminId: string;
    adminName: string;
    lockedAt: string;
  } | null;
  activityLogs?: {
    id: string;
    adminId: string;
    adminName: string;
    action: string;
    note?: string;
    createdAt: string;
  }[];
}

export type ListingDecisionType = "APPROVE" | "NEEDS_CHANGES" | "REJECT";

export type ReviewSectionType =
  | "PHOTOS"
  | "DESCRIPTION"
  | "LEGAL_DOCS"
  | "PRICING"
  | "LOCATION"
  | "AMENITIES"
  | "HOUSE_RULES"
  | "OTHER";

export interface ReviewReasonItem {
  section: ReviewSectionType;
  stepNumber: number;
  note: string;
}

export interface ListingReviewDecisionPayload {
  decision: ListingDecisionType;
  reasons?: ReviewReasonItem[];
  acknowledgedDuplicateAddress?: boolean;
  note?: string;
}

export interface ListingDocViewLogItem {
  id: string;
  listingId: string;
  docId: string;
  adminId: string;
  adminName: string;
  viewedAt: string;
}

