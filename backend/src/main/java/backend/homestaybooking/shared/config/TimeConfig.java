package backend.homestaybooking.shared.config;

import java.time.Clock;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình bean java.time.Clock chuẩn hệ thống (mặc định UTC).
 * Cho phép ghi đè trong môi trường kiểm thử (ví dụ MutableClock).
 */
@Configuration
public class TimeConfig {

    @Bean
    @ConditionalOnMissingBean(Clock.class)
    public Clock clock() {
        return Clock.systemUTC();
    }
}
