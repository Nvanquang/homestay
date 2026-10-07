package backend.homestaybooking.shared.idempotency;

import java.time.Instant;

/**
 * Bản ghi trạng thái Idempotency cho một yêu cầu.
 */
public record IdempotencyRecord(
    String key,
    String requestHash,
    IdempotencyStatus status,
    int responseStatus,
    String responsePayload,
    Instant createdAt
) {
    public enum IdempotencyStatus {
        PENDING,
        COMPLETED,
        FAILED
    }
}
