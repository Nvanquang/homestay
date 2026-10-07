package backend.homestaybooking.shared.time;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;

/**
 * MutableClock: Cài đặt Clock hỗ trợ kiểm thử, cho phép điều chỉnh và tua nhanh/lùi thời gian.
 */
public class MutableClock extends Clock {

    private Instant currentInstant;
    private final ZoneId zoneId;

    public MutableClock(Instant initialInstant, ZoneId zoneId) {
        this.currentInstant = Objects.requireNonNull(initialInstant, "initialInstant must not be null");
        this.zoneId = Objects.requireNonNull(zoneId, "zoneId must not be null");
    }

    public MutableClock(Instant initialInstant) {
        this(initialInstant, ZoneId.of("UTC"));
    }

    public static MutableClock of(Instant instant) {
        return new MutableClock(instant);
    }

    public static MutableClock of(Instant instant, ZoneId zoneId) {
        return new MutableClock(instant, zoneId);
    }

    public static MutableClock epoch() {
        return new MutableClock(Instant.EPOCH);
    }

    public static MutableClock now() {
        return new MutableClock(Instant.now());
    }

    @Override
    public ZoneId getZone() {
        return zoneId;
    }

    @Override
    public Clock withZone(ZoneId zone) {
        return new MutableClock(this.currentInstant, zone);
    }

    @Override
    public synchronized Instant instant() {
        return currentInstant;
    }

    /**
     * Đặt trực tiếp thời điểm hiện tại của đồng hồ.
     */
    public synchronized void setInstant(Instant newInstant) {
        this.currentInstant = Objects.requireNonNull(newInstant, "newInstant must not be null");
    }

    /**
     * Tua nhanh thời gian tới tương lai (ví dụ: tua 15 phút hết hạn giữ phòng).
     */
    public synchronized void fastForward(Duration duration) {
        Objects.requireNonNull(duration, "duration must not be null");
        this.currentInstant = this.currentInstant.plus(duration);
    }

    /**
     * Tua lùi thời gian về quá khứ.
     */
    public synchronized void rewind(Duration duration) {
        Objects.requireNonNull(duration, "duration must not be null");
        this.currentInstant = this.currentInstant.minus(duration);
    }
}
