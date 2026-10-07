package backend.homestaybooking.shared.test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Tiện ích kiểm thử đồng thời (Concurrency Test Harness).
 * Sử dụng kỹ thuật 2 tầng CountDownLatch (Ready Gate & Start Gate) làm rào xuất phát
 * nhằm đảm bảo N luồng bắn đồng thời vào cùng một mili-giây, tái hiện chính xác tranh chấp dữ liệu.
 */
public final class ConcurrencyTestHelper {

    private ConcurrencyTestHelper() {
        // Utility class
    }

    /**
     * Bắn đồng thời N luồng thực thi tác vụ Callable có trả về kết quả.
     *
     * @param threadCount    Số lượng luồng đồng thời
     * @param task           Hành động thực thi của mỗi luồng
     * @param timeoutSeconds Thời gian tối đa chờ toàn bộ các luồng hoàn tất (giây)
     * @return ConcurrencyResult thống kê số lượng thành công, thất bại, kết quả và danh sách lỗi
     */
    public static <T> ConcurrencyResult<T> executeConcurrent(
        int threadCount,
        Callable<T> task,
        int timeoutSeconds
    ) throws InterruptedException {
        if (threadCount <= 0) {
            throw new IllegalArgumentException("Số lượng luồng phải lớn hơn 0");
        }

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyGate = new CountDownLatch(threadCount);
        CountDownLatch startGate = new CountDownLatch(1);
        CountDownLatch doneGate = new CountDownLatch(threadCount);

        AtomicInteger successCounter = new AtomicInteger(0);
        AtomicInteger failureCounter = new AtomicInteger(0);

        List<T> results = Collections.synchronizedList(new ArrayList<>());
        List<Throwable> exceptions = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                readyGate.countDown();
                try {
                    // Chờ phát súng lệnh tại rào xuất phát
                    startGate.await();
                    T result = task.call();
                    if (result != null) {
                        results.add(result);
                    }
                    successCounter.incrementAndGet();
                } catch (Throwable t) {
                    exceptions.add(t);
                    failureCounter.incrementAndGet();
                } finally {
                    doneGate.countDown();
                }
            });
        }

        // Đợi tất cả các luồng đã sẵn sàng trước rào xuất phát
        readyGate.await(10, TimeUnit.SECONDS);

        long startTime = System.currentTimeMillis();
        // Nổ súng lệnh: Mở rào xuất phát cho toàn bộ N luồng bắn cùng một thời điểm
        startGate.countDown();

        // Đợi toàn bộ các luồng hoàn tất hoặc hết thời gian timeout
        boolean completedInTime = doneGate.await(timeoutSeconds, TimeUnit.SECONDS);
        long duration = System.currentTimeMillis() - startTime;

        executor.shutdownNow();

        if (!completedInTime) {
            exceptions.add(new IllegalStateException("Kiểm thử đồng thời vượt quá thời gian chờ: " + timeoutSeconds + "s"));
        }

        return new ConcurrencyResult<>(
            threadCount,
            successCounter.get(),
            failureCounter.get(),
            results,
            exceptions,
            duration
        );
    }

    /**
     * Overload tiện ích với thời gian timeout mặc định là 30 giây.
     */
    public static <T> ConcurrencyResult<T> executeConcurrent(int threadCount, Callable<T> task)
        throws InterruptedException {
        return executeConcurrent(threadCount, task, 30);
    }

    /**
     * Bắn đồng thời N luồng thực thi tác vụ Runnable không trả về giá trị.
     */
    public static ConcurrencyResult<Void> executeConcurrent(
        int threadCount,
        Runnable task,
        int timeoutSeconds
    ) throws InterruptedException {
        return executeConcurrent(
            threadCount,
            () -> {
                task.run();
                return null;
            },
            timeoutSeconds
        );
    }
}
