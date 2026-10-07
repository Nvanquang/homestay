package backend.homestaybooking.shared.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Kích hoạt các Configuration Properties có xác thực cho tầng shared kernel.
 */
@Configuration
@EnableConfigurationProperties(AppProperties.class)
public class AppConfig {
}
