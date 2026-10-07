package backend.homestaybooking.shared.idempotency;

import java.util.Optional;

/**
 * Giao diện kho lưu trữ trạng thái Idempotency.
 */
public interface IdempotencyStore {

    Optional<IdempotencyRecord> find(String key);

    void save(IdempotencyRecord record);

    void update(String key, IdempotencyRecord.IdempotencyStatus status, int responseStatus, String responsePayload);
}
