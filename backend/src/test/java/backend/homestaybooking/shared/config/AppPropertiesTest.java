package backend.homestaybooking.shared.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AppPropertiesTest {

    @Autowired
    private AppProperties appProperties;

    @Test
    @DisplayName("Cấu hình app properties được nạp và xác thực thành công từ profile test")
    void shouldLoadValidPropertiesInTestProfile() {
        assertThat(appProperties).isNotNull();
        assertThat(appProperties.name()).isEqualTo("Homestay Booking Platform (Test)");
        assertThat(appProperties.environment()).isEqualTo("test");
        assertThat(appProperties.security()).isNotNull();
        assertThat(appProperties.security().sessionCookieName()).isEqualTo("HOMESTAY_TEST_SESSION");
    }
}
