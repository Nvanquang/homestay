package backend.homestaybooking.shared.error;

import org.springframework.http.HttpStatus;

/**
 * Danh mục mã lỗi nghiệp vụ chuẩn hóa toàn hệ thống (RFC 9457 Problem Details
 * code).
 */
public enum ErrorCode {

    // --- 400 BAD REQUEST ---
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "Dữ liệu yêu cầu không hợp lệ"),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Cú pháp yêu cầu không hợp lệ hoặc thiếu thông tin"),
    IDEMPOTENCY_KEY_REQUIRED(HttpStatus.BAD_REQUEST, "Thiếu header Idempotency-Key bắt buộc"),
    IDEMPOTENCY_PAYLOAD_MISMATCH(HttpStatus.BAD_REQUEST, "Khóa Idempotency bị tái sử dụng với nội dung yêu cầu khác"),

    // --- 401 UNAUTHORIZED ---
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Chưa xác thực hoặc phiên đăng nhập đã hết hạn"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không chính xác"),

    // --- 403 FORBIDDEN ---
    FORBIDDEN(HttpStatus.FORBIDDEN, "Không đủ quyền thực hiện hành động này"),
    EMAIL_UNVERIFIED(HttpStatus.FORBIDDEN, "Tài khoản chưa xác minh email"),
    EMAIL_NOT_VERIFIED(HttpStatus.FORBIDDEN, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác minh"),
    HOST_NOT_VERIFIED(HttpStatus.FORBIDDEN, "Tài khoản chưa được phê duyệt làm Host"),

    // --- 404 NOT FOUND ---
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"),

    // --- 409 CONFLICT ---
    CONFLICT_CONCURRENT_ACCESS(HttpStatus.CONFLICT, "Xung đột truy cập đồng thời hoặc phiên bản dữ liệu cũ"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT,
            "Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác"),
    IDEMPOTENCY_IN_PROGRESS(HttpStatus.CONFLICT, "Yêu cầu với khóa Idempotency này đang được xử lý"),
    CALENDAR_UNAVAILABLE(HttpStatus.CONFLICT, "Ngày chọn đã có người đặt hoặc bị chặn"),
    BOOKING_OVERLAPPING_DATES(HttpStatus.CONFLICT, "Khoảng ngày đặt phòng bị trùng lặp với đặt phòng khác"),

    // --- 410 GONE ---
    TOKEN_EXPIRED_OR_USED(HttpStatus.GONE, "Liên kết đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu liên kết mới"),

    // --- 423 LOCKED ---
    ACCOUNT_LOCKED(HttpStatus.LOCKED, "Tài khoản đang bị tạm khoá do thử sai nhiều lần. Vui lòng thử lại sau"),

    // --- 422 UNPROCESSABLE CONTENT ---
    VALIDATION_FAILED(HttpStatus.UNPROCESSABLE_CONTENT, "Dữ liệu vi phạm quy tắc kiểm tra tính hợp lệ"),
    IDEMPOTENCY_KEY_REUSED(HttpStatus.UNPROCESSABLE_CONTENT, "Khóa Idempotency bị tái sử dụng không hợp lệ"),

    // --- 429 TOO MANY REQUESTS ---
    RATE_LIMITED(HttpStatus.TOO_MANY_REQUESTS, "Thao tác quá nhanh, vượt giới hạn tần suất yêu cầu"),

    // --- 500 INTERNAL SERVER ERROR ---
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi máy chủ không mong muốn");

    private final HttpStatus status;
    private final String defaultMessage;

    ErrorCode(HttpStatus status, String defaultMessage) {
        this.status = status;
        this.defaultMessage = defaultMessage;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
