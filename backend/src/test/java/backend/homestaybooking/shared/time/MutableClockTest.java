package backend.homestaybooking.shared.time;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class MutableClockTest {

    @Test
    @DisplayName("MutableClock khởi tạo đúng thời điểm ban đầu và hỗ trợ fastForward / rewind")
    void shouldAdjustTimeCorrectly() {
        Instant initial = Instant.parse("2026-10-07T10:00:00Z");
        MutableClock clock = MutableClock.of(initial, ZoneId.of("UTC"));

        assertThat(clock.instant()).isEqualTo(initial);
        assertThat(clock.getZone()).isEqualTo(ZoneId.of("UTC"));

        // Fast forward 15 minutes (Hold countdown test)
        clock.fastForward(Duration.ofMinutes(15));
        assertThat(clock.instant()).isEqualTo(Instant.parse("2026-10-07T10:15:00Z"));

        // Rewind 5 minutes
        clock.rewind(Duration.ofMinutes(5));
        assertThat(clock.instant()).isEqualTo(Instant.parse("2026-10-07T10:10:00Z"));

        // Set explicit instant
        Instant target = Instant.parse("2026-10-08T00:00:00Z");
        clock.setInstant(target);
        assertThat(clock.instant()).isEqualTo(target);
    }
}
