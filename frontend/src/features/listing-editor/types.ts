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

export interface ListingItem {
  id: string;
  hostId: string;
  status: ListingStatus;
  version: number;
  basicInfo: BasicInfoData;
  location: LocationData;
  photos: ListingPhotoItem[];
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
