import {
  IdentityVerificationRecord,
  DocumentAttachment,
  DocumentPurpose,
  ReviewQueueFilterParams,
  ReviewQueueResponse,
  ReviewDecisionPayload,
  VerificationStatus,
} from "../types";
import { IdentityVerificationFormValues } from "../schemas";

// In-memory verification database
let verificationQueue: IdentityVerificationRecord[] = [
  {
    id: "verif-1042",
    userId: "user-host-1",
    applicantType: "HOST",
    legalName: "Nguyễn Văn An",
    dateOfBirth: "1992-05-14",
    phone: "0912345678",
    idType: "CCCD",
    idNumber: "079192001234",
    idFront: {
      id: "doc-1",
      fileName: "cccd_mat_truoc_an.jpg",
      fileSize: 2.4 * 1024 * 1024,
      fileType: "image/jpeg",
      purpose: "ID_FRONT",
      fileUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      uploadedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    idBack: {
      id: "doc-2",
      fileName: "cccd_mat_sau_an.jpg",
      fileSize: 2.1 * 1024 * 1024,
      fileType: "image/jpeg",
      purpose: "ID_BACK",
      fileUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      uploadedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    operatingRightDocs: [
      {
        id: "doc-3",
        fileName: "so_do_hop_dong_thue_nha.pdf",
        fileSize: 4.8 * 1024 * 1024,
        fileType: "application/pdf",
        purpose: "OPERATING_RIGHT",
        fileUrl: "#",
        uploadedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      },
    ],
    status: "PENDING",
    submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    flaggedDuplicate: true,
    duplicateOfEmail: "nguyen.b@homestay.local",
    lockedBy: null,
    history: [
      {
        id: "hist-1",
        submittedAt: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
        decidedAt: new Date(Date.now() - 6 * 86400 * 1000).toISOString(),
        status: "REJECTED",
        rejectionReason: {
          category: "BLURRY",
          note: "Ảnh chụp mặt sau CCCD bị chói sáng và mờ số. Vui lòng chụp lại rõ 4 góc.",
        },
      },
    ],
  },
  {
    id: "verif-1043",
    userId: "user-guest-2",
    applicantType: "GUEST",
    legalName: "Trần Thị Bình",
    dateOfBirth: "1998-11-20",
    phone: "0987654321",
    idType: "PASSPORT",
    idNumber: "B8765432",
    idFront: {
      id: "doc-4",
      fileName: "passport_binh.jpg",
      fileSize: 3.2 * 1024 * 1024,
      fileType: "image/jpeg",
      purpose: "ID_FRONT",
      fileUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
      uploadedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    },
    operatingRightDocs: [],
    status: "PENDING",
    submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    flaggedDuplicate: false,
    lockedBy: null,
    history: [],
  },
  {
    id: "verif-1040",
    userId: "user-host-3",
    applicantType: "HOST",
    legalName: "Lê Hoàng Long",
    dateOfBirth: "1988-03-08",
    phone: "0903123456",
    idType: "CCCD",
    idNumber: "079188009876",
    operatingRightDocs: [],
    status: "REJECTED",
    submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    decidedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    rejectionReason: {
      category: "MISMATCH",
      note: "Họ tên nhập trên hệ thống không trùng khớp với họ tên ghi trên CCCD.",
    },
    flaggedDuplicate: false,
    lockedBy: null,
    history: [],
  },
  {
    id: "verif-1039",
    userId: "user-host-4",
    applicantType: "HOST",
    legalName: "Phạm Thu Hà",
    dateOfBirth: "1995-09-12",
    phone: "0934567890",
    idType: "CCCD",
    idNumber: "079195005432",
    operatingRightDocs: [],
    status: "APPROVED",
    submittedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    decidedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    flaggedDuplicate: false,
    lockedBy: null,
    history: [],
  },
];

// Current host verification state in applicant view
let currentHostVerification: IdentityVerificationRecord = {
  id: "verif-host-current",
  userId: "user-me",
  applicantType: "HOST",
  legalName: "Nguyễn Văn Quang",
  dateOfBirth: "1994-07-22",
  phone: "0988123456",
  idType: "CCCD",
  idNumber: "079194008899",
  operatingRightDocs: [],
  status: "UNVERIFIED",
  history: [],
};

// Log audit for secure image views
interface DocumentViewAuditLog {
  id: string;
  reviewId: string;
  documentId: string;
  adminId: string;
  adminName: string;
  viewedAt: string;
}
let viewAuditLogs: DocumentViewAuditLog[] = [];

// ================= APPLICANT APIS =================

export async function getHostVerification(): Promise<IdentityVerificationRecord> {
  await new Promise((r) => setTimeout(r, 100));
  return JSON.parse(JSON.stringify(currentHostVerification));
}

export async function saveVerificationDraft(
  data: Partial<IdentityVerificationFormValues>,
  files?: {
    idFront?: DocumentAttachment;
    idBack?: DocumentAttachment;
    operatingRightDocs?: DocumentAttachment[];
  }
): Promise<IdentityVerificationRecord> {
  await new Promise((r) => setTimeout(r, 150));
  currentHostVerification = {
    ...currentHostVerification,
    ...data,
    idFront: files?.idFront ?? currentHostVerification.idFront,
    idBack: files?.idBack ?? currentHostVerification.idBack,
    operatingRightDocs:
      files?.operatingRightDocs ?? currentHostVerification.operatingRightDocs,
    status: currentHostVerification.status === "UNVERIFIED" ? "DRAFT" : currentHostVerification.status,
  };
  return JSON.parse(JSON.stringify(currentHostVerification));
}

export async function uploadDocumentFile(
  file: File,
  purpose: DocumentPurpose
): Promise<DocumentAttachment> {
  await new Promise((r) => setTimeout(r, 200));

  // 1. Kiểm tra kích thước <= 10MB
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error("FILE_TOO_LARGE: Dung lượng tệp không được vượt quá 10MB");
  }

  // 2. Kiểm tra định dạng
  const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
  const allowedDocTypes = [...allowedImageTypes, "application/pdf"];

  if (purpose === "ID_FRONT" || purpose === "ID_BACK") {
    if (!allowedImageTypes.includes(file.type)) {
      throw new Error("INVALID_FORMAT: Giấy tờ tùy thân chỉ chấp nhận định dạng ảnh JPG hoặc PNG");
    }
  } else {
    if (!allowedDocTypes.includes(file.type)) {
      throw new Error("INVALID_FORMAT: Giấy tờ chỉ chấp nhận định dạng JPG, PNG hoặc PDF");
    }
  }

  // Tạo URL preview blob tạm thời
  const objectUrl = URL.createObjectURL(file);

  const attachment: DocumentAttachment = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    purpose,
    fileUrl: objectUrl,
    uploadedAt: new Date().toISOString(),
  };

  return attachment;
}

export async function submitVerification(
  formData: IdentityVerificationFormValues,
  files: {
    idFront?: DocumentAttachment;
    idBack?: DocumentAttachment;
    operatingRightDocs: DocumentAttachment[];
  }
): Promise<IdentityVerificationRecord> {
  await new Promise((r) => setTimeout(r, 250));

  // Kiểm tra tệp bắt buộc
  if (!files.idFront) {
    throw new Error("MISSING_DOC: Vui lòng tải lên ảnh mặt trước giấy tờ tùy thân");
  }
  if (formData.idType === "CCCD" && !files.idBack) {
    throw new Error("MISSING_DOC: Vui lòng tải lên ảnh mặt sau CCCD");
  }

  const nowIso = new Date().toISOString();
  currentHostVerification = {
    ...currentHostVerification,
    ...formData,
    idFront: files.idFront,
    idBack: files.idBack,
    operatingRightDocs: files.operatingRightDocs,
    status: "PENDING",
    submittedAt: nowIso,
  };

  // Đẩy vào hàng đợi Admin
  const existingIdx = verificationQueue.findIndex(
    (item) => item.id === currentHostVerification.id
  );
  if (existingIdx >= 0) {
    verificationQueue[existingIdx] = JSON.parse(JSON.stringify(currentHostVerification));
  } else {
    verificationQueue.unshift(JSON.parse(JSON.stringify(currentHostVerification)));
  }

  return JSON.parse(JSON.stringify(currentHostVerification));
}

// ================= ADMIN APIS =================

export async function getReviewQueue(
  params: ReviewQueueFilterParams = {}
): Promise<ReviewQueueResponse> {
  await new Promise((r) => setTimeout(r, 100));

  let filtered = [...verificationQueue];

  const searchKeyword = (params.search || params.query || "").trim().toLowerCase();
  if (searchKeyword) {
    filtered = filtered.filter(
      (item) =>
        item.legalName.toLowerCase().includes(searchKeyword) ||
        item.idNumber.toLowerCase().includes(searchKeyword) ||
        item.id.toLowerCase().includes(searchKeyword)
    );
  }

  const appType = params.applicantType || params.type;
  if (appType && appType !== "ALL") {
    filtered = filtered.filter((item) => item.applicantType === appType);
  }

  if (params.status && params.status !== "ALL") {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  if (params.flag !== undefined) {
    filtered = filtered.filter((item) => Boolean(item.flaggedDuplicate) === params.flag);
  }

  // Mặc định sắp cũ nhất trước (FIFO) theo đặc tả S04
  filtered.sort((a, b) => {
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return timeA - timeB;
  });

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getReviewDetail(
  id: string
): Promise<IdentityVerificationRecord> {
  await new Promise((r) => setTimeout(r, 100));
  const record = verificationQueue.find((item) => item.id === id);
  if (!record) {
    throw new Error("NOT_FOUND: Không tìm thấy hồ sơ xác minh");
  }
  return JSON.parse(JSON.stringify(record));
}

export async function lockReview(
  id: string,
  admin: { id: string; fullName: string } = { id: "admin-current", fullName: "Admin UrbanNest" }
): Promise<IdentityVerificationRecord> {
  await new Promise((r) => setTimeout(r, 100));
  const record = verificationQueue.find((item) => item.id === id);
  if (!record) {
    throw new Error("NOT_FOUND: Không tìm thấy hồ sơ");
  }

  // Nếu đang bị khoá bởi người khác (trong vòng 5 phút)
  if (record.lockedBy && record.lockedBy.adminId !== admin.id) {
    const lockedTime = new Date(record.lockedBy.lockedAt).getTime();
    if (Date.now() - lockedTime < 5 * 60 * 1000) {
      return JSON.parse(JSON.stringify(record));
    }
  }

  record.lockedBy = {
    adminId: admin.id,
    adminName: admin.fullName,
    lockedAt: new Date().toISOString(),
  };

  return JSON.parse(JSON.stringify(record));
}

export async function unlockReview(id: string, adminId: string = "admin-current"): Promise<void> {
  await new Promise((r) => setTimeout(r, 50));
  const record = verificationQueue.find((item) => item.id === id);
  if (record && record.lockedBy?.adminId === adminId) {
    record.lockedBy = null;
  }
}

export async function viewSecureDocument(
  reviewId: string,
  documentId: string,
  admin: { id: string; fullName: string } = { id: "admin-current", fullName: "Admin UrbanNest" }
): Promise<{ signedUrl: string; expiresAt: string }> {
  await new Promise((r) => setTimeout(r, 150));

  // Ghi log kiểm toán mỗi lần xem (BR-ACC-05)
  viewAuditLogs.unshift({
    id: `audit-${Date.now()}`,
    reviewId,
    documentId,
    adminId: admin.id,
    adminName: admin.fullName,
    viewedAt: new Date().toISOString(),
  });

  const record = verificationQueue.find((item) => item.id === reviewId);
  const doc =
    record?.idFront?.id === documentId
      ? record.idFront
      : record?.idBack?.id === documentId
      ? record.idBack
      : record?.operatingRightDocs.find((d) => d.id === documentId);

  const fallbackUrl = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80";

  return {
    signedUrl: doc?.fileUrl || fallbackUrl,
    expiresAt: new Date(Date.now() + 120 * 1000).toISOString(), // 120 giây
  };
}

export async function submitReviewDecision(
  reviewId: string,
  payload: ReviewDecisionPayload,
  admin: { id: string; fullName: string } = { id: "admin-current", fullName: "Admin UrbanNest" }
): Promise<IdentityVerificationRecord> {
  await new Promise((r) => setTimeout(r, 200));

  const record = verificationQueue.find((item) => item.id === reviewId);
  if (!record) {
    throw new Error("NOT_FOUND: Không tìm thấy hồ sơ");
  }

  if (record.status !== "PENDING") {
    throw new Error("409 CONFLICT: Hồ sơ đã được xử lý bởi người khác");
  }

  if (payload.decision === "APPROVE") {
    record.status = "APPROVED";
    record.decidedAt = new Date().toISOString();
    record.rejectionReason = undefined;
  } else {
    if (!payload.reasonCategory || !payload.note || payload.note.trim().length < 10) {
      throw new Error("INVALID_REJECTION: Bắt buộc chọn lý do và nhập ghi chú từ chối tối thiểu 10 ký tự");
    }
    record.status = "REJECTED";
    record.decidedAt = new Date().toISOString();
    record.rejectionReason = {
      category: payload.reasonCategory,
      note: payload.note.trim(),
    };
  }

  // Nhả khoá
  record.lockedBy = null;

  // Cập nhật currentHostVerification nếu khớp ID
  if (currentHostVerification.id === reviewId) {
    currentHostVerification = JSON.parse(JSON.stringify(record));
  }

  return JSON.parse(JSON.stringify(record));
}

// Reset helper cho test suite
export function _resetVerificationDatabase(): void {
  currentHostVerification = {
    id: "verif-host-current",
    userId: "user-me",
    applicantType: "HOST",
    legalName: "Nguyễn Văn Quang",
    dateOfBirth: "1994-07-22",
    phone: "0988123456",
    idType: "CCCD",
    idNumber: "079194008899",
    operatingRightDocs: [],
    status: "UNVERIFIED",
    history: [],
  };
  viewAuditLogs = [];
}
