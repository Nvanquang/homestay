package backend.homestaybooking.shared.error;

import java.time.Instant;
import java.util.Objects;

/**
 * Ngoại lệ nghiệp vụ gốc (Unchecked Exception) mang mã lỗi và chi tiết.
 */
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;
    private Instant lockedUntil;

    public BusinessException(ErrorCode errorCode) {
        super(Objects.requireNonNull(errorCode, "errorCode must not be null").getDefaultMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage != null && !customMessage.isBlank() ? customMessage : errorCode.getDefaultMessage());
        this.errorCode = Objects.requireNonNull(errorCode, "errorCode must not be null");
    }

    public BusinessException(ErrorCode errorCode, String customMessage, Instant lockedUntil) {
        super(customMessage != null && !customMessage.isBlank() ? customMessage : errorCode.getDefaultMessage());
        this.errorCode = Objects.requireNonNull(errorCode, "errorCode must not be null");
        this.lockedUntil = lockedUntil;
    }

    public BusinessException(ErrorCode errorCode, String customMessage, Throwable cause) {
        super(customMessage != null && !customMessage.isBlank() ? customMessage : errorCode.getDefaultMessage(), cause);
        this.errorCode = Objects.requireNonNull(errorCode, "errorCode must not be null");
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public Instant getLockedUntil() {
        return lockedUntil;
    }
}
