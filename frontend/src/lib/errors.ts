export type SupportedLocale = "vi" | "en";

export interface ApiFieldError {
  field: string;
  code: string;
  message?: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  code?: string;
  detail?: string;
  instance?: string;
  traceId?: string;
  fieldErrors?: ApiFieldError[];
  errors?: Record<string, string[]>;
  retryAfterSeconds?: number;
  retryAfterSec?: number;
  lockedUntil?: string;
  conflicts?: unknown;
}

export interface NormalizedError {
  status: number;
  code: string;
  title: string;
  message: string;
  traceId?: string;
  fieldErrors: Record<string, string>;
  retryAfterSeconds?: number;
  lockedUntil?: string;
  conflicts?: unknown;
}

/**
 * Standard bilingual error messages dictionary mapped by business error codes.
 */
export const ERROR_MESSAGES: Record<SupportedLocale, Record<string, string>> = {
  vi: {
    generic: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
    network: "Không thể kết nối tới máy chủ. Vui lòng kiểm tra đường truyền mạng.",
    VALIDATION: "Dữ liệu nhập vào chưa hợp lệ. Vui lòng kiểm tra các trường thông tin.",
    validation: "Dữ liệu nhập vào chưa hợp lệ. Vui lòng kiểm tra các trường thông tin.",
    UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    unauthenticated: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    "auth.unauthenticated": "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
    forbidden: "Bạn không có quyền thực hiện thao tác này.",
    "auth.forbidden": "Bạn không có quyền thực hiện thao tác này.",
    "auth.unverified_host": "Tài khoản chưa hoàn tất xác minh danh tính Host.",
    NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
    notFound: "Không tìm thấy dữ liệu yêu cầu.",
    CONFLICT: "Dữ liệu đã bị thay đổi bởi phiên làm việc khác. Vui lòng tải lại trang.",
    conflict: "Dữ liệu đã bị thay đổi bởi phiên làm việc khác. Vui lòng tải lại trang.",
    "common.version_conflict": "Dữ liệu đã được cập nhật bởi thao tác khác. Vui lòng tải lại.",
    RATE_LIMITED: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi trong giây lát rồi thử lại.",
    rateLimited: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi trong giây lát rồi thử lại.",
    "common.rate_limited": "Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi giây lát.",
    LOCKED: "Tài khoản hoặc tài nguyên hiện đang bị khoá.",
    locked: "Tài khoản hoặc tài nguyên hiện đang bị khoá.",
    "calendar.unavailable": "Phòng đã có khách đặt hoặc bị chặn trong khoảng thời gian này.",
    "booking.hold_expired": "Thời gian giữ phòng 15 phút đã hết hạn. Vui lòng chọn lại ngày đặt.",
    "booking.min_nights": "Số đêm lưu trú chưa đạt mức tối thiểu theo quy định của chỗ ở.",
    "payment.declined": "Giao dịch thanh toán bị từ chối. Vui lòng thử lại với phương thức khác.",
    "payment.amount_changed": "Tổng tiền thanh toán đã thay đổi do cập nhật giá mới.",
  },
  en: {
    generic: "An unexpected error occurred. Please try again later.",
    network: "Unable to connect to the server. Please check your network connection.",
    VALIDATION: "Invalid input data. Please check the highlighted fields.",
    validation: "Invalid input data. Please check the highlighted fields.",
    UNAUTHENTICATED: "Your session has expired. Please sign in again.",
    unauthenticated: "Your session has expired. Please sign in again.",
    "auth.unauthenticated": "Your session has expired. Please sign in again.",
    FORBIDDEN: "You do not have permission to perform this action.",
    forbidden: "You do not have permission to perform this action.",
    "auth.forbidden": "You do not have permission to perform this action.",
    "auth.unverified_host": "Your account has not completed host identity verification.",
    NOT_FOUND: "The requested resource was not found.",
    notFound: "The requested resource was not found.",
    CONFLICT: "The record was updated by another session. Please refresh the page.",
    conflict: "The record was updated by another session. Please refresh the page.",
    "common.version_conflict": "Data has been modified by another request. Please reload.",
    RATE_LIMITED: "Too many requests. Please wait a moment before trying again.",
    rateLimited: "Too many requests. Please wait a moment before trying again.",
    "common.rate_limited": "Too many requests. Please slow down.",
    LOCKED: "The account or resource is temporarily locked.",
    locked: "The account or resource is temporarily locked.",
    "calendar.unavailable": "These dates are already booked or blocked by the host.",
    "booking.hold_expired": "The 15-minute booking hold has expired. Please select your dates again.",
    "booking.min_nights": "The selected stay does not meet the minimum night requirement.",
    "payment.declined": "Payment was declined. Please try another payment method.",
    "payment.amount_changed": "The total payment amount has changed due to price updates.",
  },
};

/**
 * Returns a user-friendly error message by code and locale.
 */
export function getErrorMessageByCode(code: string, locale: SupportedLocale = "vi"): string {
  const dictionary = ERROR_MESSAGES[locale] || ERROR_MESSAGES.vi;
  return dictionary[code] || dictionary.generic;
}

/**
 * Normalizes any server error or Problem Details payload into a consistent NormalizedError.
 */
export function normalizeProblemDetails(
  rawError: unknown,
  locale: SupportedLocale = "vi"
): NormalizedError {
  const fallbackMessage = getErrorMessageByCode("generic", locale);

  if (!rawError || typeof rawError !== "object") {
    return {
      status: 500,
      code: "generic",
      title: "Error",
      message: typeof rawError === "string" ? rawError : fallbackMessage,
      fieldErrors: {},
    };
  }

  const problem = rawError as ProblemDetails;
  const status = Number(problem.status) || 500;
  const rawCode = problem.code || (status === 401 ? "unauthenticated" : status === 403 ? "forbidden" : status === 404 ? "notFound" : "generic");

  const message =
    getErrorMessageByCode(rawCode, locale) ||
    problem.detail ||
    problem.title ||
    fallbackMessage;

  const fieldErrors: Record<string, string> = {};

  if (Array.isArray(problem.fieldErrors)) {
    for (const fe of problem.fieldErrors) {
      if (fe.field) {
        fieldErrors[fe.field] = fe.message || getErrorMessageByCode(fe.code, locale) || fe.code;
      }
    }
  } else if (problem.errors && typeof problem.errors === "object") {
    for (const [field, msgs] of Object.entries(problem.errors)) {
      if (Array.isArray(msgs) && msgs.length > 0) {
        fieldErrors[field] = msgs[0] || "";
      }
    }
  }

  return {
    status,
    code: rawCode,
    title: problem.title || (locale === "vi" ? "Thông báo lỗi" : "Error"),
    message,
    traceId: problem.traceId,
    fieldErrors,
    retryAfterSeconds: problem.retryAfterSeconds ?? problem.retryAfterSec,
    lockedUntil: problem.lockedUntil,
    conflicts: problem.conflicts,
  };
}

/**
 * Application ApiError class encapsulating Problem Details.
 */
export class AppApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly traceId?: string;
  readonly fieldErrors: Record<string, string>;
  readonly retryAfterSeconds?: number;
  readonly lockedUntil?: string;

  constructor(problem: ProblemDetails, locale: SupportedLocale = "vi") {
    const normalized = normalizeProblemDetails(problem, locale);
    super(normalized.message);
    this.name = "AppApiError";
    this.status = normalized.status;
    this.code = normalized.code;
    this.traceId = normalized.traceId;
    this.fieldErrors = normalized.fieldErrors;
    this.retryAfterSeconds = normalized.retryAfterSeconds;
    this.lockedUntil = normalized.lockedUntil;
  }
}
