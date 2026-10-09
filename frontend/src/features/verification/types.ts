export type IdentityType = "CCCD" | "PASSPORT";

export type VerificationStatus =
  | "UNVERIFIED"
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type ApplicantType = "HOST" | "GUEST";

export type RejectionCategory =
  | "BLURRY"
  | "EXPIRED_DOC"
  | "MISMATCH"
  | "INVALID_DOC"
  | "OTHER";

export type DocumentPurpose = "ID_FRONT" | "ID_BACK" | "OPERATING_RIGHT";

export interface DocumentAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  purpose: DocumentPurpose;
  fileUrl?: string; // Signed/preview URL
  uploadedAt: string;
}

export interface VerificationHistoryItem {
  id: string;
  submittedAt: string;
  decidedAt?: string;
  status: VerificationStatus;
  rejectionReason?: {
    category: RejectionCategory;
    note: string;
  };
}

export interface IdentityVerificationRecord {
  id: string;
  userId: string;
  applicantType: ApplicantType;
  legalName: string;
  dateOfBirth: string;
  phone: string;
  idType: IdentityType;
  idNumber: string;
  idFront?: DocumentAttachment;
  idBack?: DocumentAttachment;
  operatingRightDocs: DocumentAttachment[];
  status: VerificationStatus;
  submittedAt?: string;
  decidedAt?: string;
  rejectionReason?: {
    category: RejectionCategory;
    note: string;
  };
  flaggedDuplicate?: boolean;
  duplicateOfEmail?: string;
  lockedBy?: {
    adminId: string;
    adminName: string;
    lockedAt: string;
  } | null;
  history?: VerificationHistoryItem[];
}

export interface ReviewQueueFilterParams {
  type?: ApplicantType | "ALL";
  applicantType?: ApplicantType | "ALL";
  status?: VerificationStatus | "ALL";
  flag?: boolean;
  mine?: boolean;
  query?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ReviewQueueResponse {
  items: IdentityVerificationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReviewDecisionPayload {
  decision: "APPROVE" | "REJECT";
  reasonCategory?: RejectionCategory;
  note?: string;
  acknowledgedFlag?: boolean;
}
