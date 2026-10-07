package backend.homestaybooking.shared.audit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Thực thể lưu trữ nhật ký kiểm toán (Audit Activity Log).
 * Bảng activity_log là bảng bất biến chỉ thêm (Append-Only), không hỗ trợ sửa hay xoá.
 */
@Entity
@Table(name = "activity_log")
@Immutable
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class ActivityLogEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "actor_id", nullable = false, length = 64, updatable = false)
    private String actorId;

    @Column(name = "actor_role", nullable = false, length = 32, updatable = false)
    private String actorRole;

    @Column(name = "action", nullable = false, length = 64, updatable = false)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 64, updatable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 64, updatable = false)
    private String entityId;

    @Column(name = "details")
    @JdbcTypeCode(SqlTypes.JSON)
    private String details;

    @Column(name = "ip_address", length = 45, updatable = false)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "text", updatable = false)
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
