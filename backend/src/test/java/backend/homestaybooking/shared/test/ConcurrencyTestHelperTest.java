package backend.homestaybooking.shared.test;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("Kiểm thử hạ tầng ConcurrencyTestHelper")
class ConcurrencyTestHelperTest {

    @Test
    @DisplayName("N luồng bắn đồng thời cùng tăng AtomicInteger - Toàn bộ thành công")
    void testConcurrentExecution_allSucceed() throws InterruptedException {
        int threadCount = 20;
        AtomicInteger counter = new AtomicInteger(0);

        ConcurrencyResult<Integer> result = ConcurrencyTestHelper.executeConcurrent(
            threadCount,
            () -> counter.incrementAndGet()
        );

        assertThat(result.totalRequests()).isEqualTo(threadCount);
        assertThat(result.successCount()).isEqualTo(threadCount);
        assertThat(result.failureCount()).isZero();
        assertThat(result.successfulResults()).hasSize(threadCount);
        assertThat(result.exceptions()).isEmpty();
        assertThat(counter.get()).isEqualTo(threadCount);
    }

    @Test
    @DisplayName("N luồng tranh chấp duy nhất 1 tài nguyên - Đúng 1 thành công, N-1 thất bại")
    void testConcurrentExecution_raceCondition_singleWinner() throws InterruptedException {
        int threadCount = 15;
        AtomicBoolean lock = new AtomicBoolean(false);

        ConcurrencyResult<String> result = ConcurrencyTestHelper.executeConcurrent(
            threadCount,
            () -> {
                if (lock.compareAndSet(false, true)) {
                    return "WINNER";
                }
                throw new IllegalStateException("CONFLICT: Tài nguyên đã bị chiếm!");
            }
        );

        assertThat(result.totalRequests()).isEqualTo(threadCount);
        assertThat(result.successCount()).isEqualTo(1);
        assertThat(result.failureCount()).isEqualTo(14);
        assertThat(result.successfulResults()).containsExactly("WINNER");
        assertThat(result.exceptions()).hasSize(14);
    }
}
