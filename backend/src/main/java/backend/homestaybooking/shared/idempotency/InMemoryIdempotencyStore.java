package backend.homestaybooking.shared.idempotency;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

/**
 * Cài đặt InMemory thread-safe cho IdempotencyStore.
 */
@Component
@ConditionalOnMissingBean(value = IdempotencyStore.class, ignored = InMemoryIdempotencyStore.class)
public class InMemoryIdempotencyStore implements IdempotencyStore {

    private final Map<String, IdempotencyRecord> store = new ConcurrentHashMap<>();

    @Override
    public Optional<IdempotencyRecord> find(String key) {
        if (key == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(store.get(key));
    }

    @Override
    public void save(IdempotencyRecord record) {
        if (record != null && record.key() != null) {
            store.put(record.key(), record);
        }
    }

    @Override
    public void update(String key, IdempotencyRecord.IdempotencyStatus status, int responseStatus, String responsePayload) {
        if (key == null) {
            return;
        }
        store.computeIfPresent(key, (k, old) -> new IdempotencyRecord(
            k,
            old.requestHash(),
            status,
            responseStatus,
            responsePayload,
            old.createdAt()
        ));
    }

    public void clear() {
        store.clear();
    }
}
