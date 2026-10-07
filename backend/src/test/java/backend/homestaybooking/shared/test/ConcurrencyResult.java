package backend.homestaybooking.shared.test;

import java.util.Collections;
import java.util.List;

/**
 * Kết quả đo đếm của phiên kiểm thử đồng thời N luồng.
 */
public record ConcurrencyResult<T>(
    int totalRequests,
    int successCount,
    int failureCount,
    List<T> successfulResults,
    List<Throwable> exceptions,
    long durationMillis
) {
    public ConcurrencyResult {
        successfulResults = Collections.unmodifiableList(successfulResults);
        exceptions = Collections.unmodifiableList(exceptions);
    }
}
