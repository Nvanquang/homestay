package backend.homestaybooking.shared.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Triển khai AuditService ghi trực tiếp vào bảng activity_log.
 * Luôn hoạt động trong CÙNG database transaction với luồng gọi để đảm bảo tính toàn vẹn (ACID).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final ActivityLogRepository activityLogRepository;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void recordEvent(
        String actorId,
        String actorRole,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> details,
        String ipAddress,
        String userAgent
    ) {
        Objects.requireNonNull(actorId, "actorId không được để trống");
        Objects.requireNonNull(action, "action không được để trống");
        Objects.requireNonNull(entityType, "entityType không được để trống");
        Objects.requireNonNull(entityId, "entityId không được để trống");

        String resolvedRole = (actorRole != null && !actorRole.isBlank()) ? actorRole.toUpperCase() : "SYSTEM";

        String detailsJson = null;
        if (details != null && !details.isEmpty()) {
            try {
                detailsJson = objectMapper.writeValueAsString(details);
            } catch (JsonProcessingException e) {
                log.warn("Không thể chuyển đổi details sang JSON cho audit log entityType={}, entityId={}", entityType, entityId, e);
                detailsJson = "{}";
            }
        }

        ActivityLogEntity logEntry = ActivityLogEntity.builder()
            .id(UUID.randomUUID())
            .actorId(actorId)
            .actorRole(resolvedRole)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .details(detailsJson)
            .ipAddress(ipAddress)
            .userAgent(userAgent)
            .createdAt(clock.instant())
            .build();

        activityLogRepository.save(logEntry);
        log.debug("Đã ghi nhận audit event action={} entityType={} entityId={} actorId={}", action, entityType, entityId, actorId);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void recordEvent(
        String actorId,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> details
    ) {
        recordEvent(actorId, "SYSTEM", action, entityType, entityId, details, null, null);
    }
}
