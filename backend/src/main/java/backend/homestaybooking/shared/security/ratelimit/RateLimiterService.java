package backend.homestaybooking.shared.security.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * Quản lý Bucket4j Token Bucket rate limiter theo IP và nhóm route.
 */
@Service
public class RateLimiterService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    /**
     * Lấy hoặc tạo mới bucket cho một key cụ thể (mặc định 5 yêu cầu / 1 phút).
     */
    public Bucket resolveBucket(String key, long capacity, Duration refillDuration) {
        return buckets.computeIfAbsent(key, k -> {
            Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, refillDuration)
                .build();
            return Bucket.builder().addLimit(limit).build();
        });
    }

    public Bucket resolveDefaultBucket(String key) {
        return resolveBucket(key, 5L, Duration.ofMinutes(1));
    }

    public void clear() {
        buckets.clear();
    }
}
