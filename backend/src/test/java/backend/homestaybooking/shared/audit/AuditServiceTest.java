package backend.homestaybooking.shared.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import backend.homestaybooking.shared.config.TimeConfig;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Service;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Import({TimeConfig.class, AuditServiceTest.TestConfig.class})
@DisplayName("Kiểm thử dịch vụ AuditService cùng Transaction (Atomicity)")
class AuditServiceTest {

    @Autowired
    private AuditService auditService;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private SampleTransactionalService sampleService;

    @BeforeEach
    void setUp() {
        activityLogRepository.deleteAll();
    }

    @Test
    @DisplayName("Ghi audit log thành công với đầy đủ thuộc tính")
    void shouldRecordAuditEventSuccessfully() {
        auditService.recordEvent(
            "user-123",
            "HOST",
            "LISTING_CREATED",
            "LISTING",
            "listing-456",
            Map.of("title", "Cozy Homestay Da Lat", "price", 1000000),
            "1.2.3.4",
            "Mozilla/5.0"
        );

        List<ActivityLogEntity> logs = activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("LISTING", "listing-456");
        assertThat(logs).hasSize(1);

        ActivityLogEntity entry = logs.get(0);
        assertThat(entry.getActorId()).isEqualTo("user-123");
        assertThat(entry.getActorRole()).isEqualTo("HOST");
        assertThat(entry.getAction()).isEqualTo("LISTING_CREATED");
        assertThat(entry.getDetails()).contains("Cozy Homestay Da Lat");
        assertThat(entry.getIpAddress()).isEqualTo("1.2.3.4");
        assertThat(entry.getUserAgent()).isEqualTo("Mozilla/5.0");
        assertThat(entry.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Nghiệp vụ bị rollback - Audit log trong cùng transaction cũng tự động rollback")
    void shouldRollbackAuditLogWhenBusinessTransactionRollsBack() {
        assertThatThrownBy(() -> sampleService.performFailingBusinessAction("order-999"))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Lỗi nghiệp vụ mô phỏng gây rollback!");

        List<ActivityLogEntity> logs = activityLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc("ORDER", "order-999");
        assertThat(logs).isEmpty();
    }

    @org.springframework.boot.test.context.TestConfiguration
    static class TestConfig {
        @org.springframework.context.annotation.Bean
        public SampleTransactionalService sampleTransactionalService(AuditService auditService) {
            return new SampleTransactionalService(auditService);
        }
    }

    static class SampleTransactionalService {

        private final AuditService auditService;

        SampleTransactionalService(AuditService auditService) {
            this.auditService = auditService;
        }

        @Transactional
        public void performFailingBusinessAction(String orderId) {
            auditService.recordEvent(
                "actor-001",
                "GUEST",
                "ORDER_SUBMITTED",
                "ORDER",
                orderId,
                Map.of("amount", 500000),
                "127.0.0.1",
                "AppClient"
            );

            // Ném ngoại lệ cố tình để kích hoạt transaction rollback
            throw new RuntimeException("Lỗi nghiệp vụ mô phỏng gây rollback!");
        }
    }
}
